'use client';

import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaCreditCard, FaCalendarAlt, FaCheckCircle, FaClock, FaDownload, FaEye, FaSearch } from 'react-icons/fa';
import { gigCompletionService, GigCompletion } from '@/services/gigCompletionService';
import { format } from 'date-fns';

interface GigRequest {
  _id: string;
  title: string;
  employer: {
    companyName: string;
  } | string;
}

interface PaymentSummary {
  totalEarned: number;
  totalEarnings: number;
  pendingPayments: number;
  completedPayments: number;
  averagePayment: number;
  thisMonth: number;
  completedGigs: number;
}

interface Payment {
  id: string;
  gigId: string;
  gigTitle: string;
  employerName: string;
  amount: number;
  currency: string;
  status: string;
  paymentDate?: string;
  completionDate: string;
  description: string;
  paymentMethod?: string;
  transactionId?: string;
  invoiceUrl?: string;
}

// Convert GigCompletion to Payment interface
const convertToPayment = (gigCompletion: GigCompletion): Payment | null => {
  const gigRequest = gigCompletion.gigRequest;
  
  // Find the current user's worker entry
  // For now, we'll assume the first worker is the current user
  // In a real implementation, you'd match by worker ID
  const myWorkerData = gigCompletion.workers?.[0];
  
  if (!myWorkerData) {
    console.warn('No worker data found for completion:', gigCompletion._id);
    return null;
  }
  
  let status = 'pending';
  if (myWorkerData.payment.status === 'paid') {
    status = 'paid';
  } else if (myWorkerData.payment.status === 'processing') {
    status = 'processing';
  } else if (myWorkerData.payment.status === 'failed') {
    status = 'failed';
  }

  // Get employer name from the completion data or gigRequest
  let employerName = 'Unknown Employer';
  if (typeof gigCompletion.employer !== 'string' && gigCompletion.employer?.companyName) {
    employerName = gigCompletion.employer.companyName;
  } else if (typeof gigRequest !== 'string' && gigRequest.employer?.companyName) {
    employerName = gigRequest.employer.companyName;
  }

  // Calculate total hours from completed time slots
  const totalHours = myWorkerData.completedTimeSlots?.reduce((total, slot) => total + slot.hoursWorked, 0) || 0;

  return {
    id: gigCompletion._id,
    gigId: typeof gigRequest === 'string' ? gigRequest : gigRequest._id,
    gigTitle: typeof gigRequest === 'string' ? 'Unknown Job' : gigRequest.title,
    employerName,
    amount: myWorkerData.payment.amount || 0,
    currency: 'LKR',
    status,
    paymentDate: undefined, // Payment date would need to be added to the API response
    completionDate: gigCompletion.completedAt ? format(new Date(gigCompletion.completedAt), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    description: `Payment for ${typeof gigRequest === 'string' ? 'gig work' : gigRequest.title} (${totalHours} hours)`,
    paymentMethod: undefined, // Payment method would need to be added to the API response
    transactionId: undefined // Transaction ID would need to be added to the API response
  };
};

const MyPayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  // We'll use setError but not directly accessing error in this component
  const [, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'processing' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch gig completions as payments
        const response = await gigCompletionService.getMyCompletions({
          paymentStatus: filter === 'all' ? undefined : filter,
          sortBy: 'completedAt',
          sortOrder: 'desc'
        });
        
        if (response.success && response.data?.completions) {
          // Convert backend format to frontend format
          const convertedPayments = response.data.completions
            .filter(completion => completion.workers && completion.workers.length > 0) // Only include completions with worker data
            .map(convertToPayment)
            .filter((payment): payment is Payment => payment !== null); // Filter out null values and assert type
          
          setPayments(convertedPayments);
          
          // Fetch payment stats
          try {
            const statsResponse = await gigCompletionService.getPaymentStats();
            if (statsResponse.success && statsResponse.data) {
              setSummary({
                totalEarnings: statsResponse.data.totalPaid,
                totalEarned: statsResponse.data.totalPaid,
                thisMonth: statsResponse.data.thisMonthEarnings,
                pendingPayments: statsResponse.data.pendingAmount,
                completedPayments: convertedPayments.filter(p => p.status === 'paid').length,
                averagePayment: convertedPayments.length > 0 
                  ? convertedPayments.reduce((acc, curr) => acc + curr.amount, 0) / convertedPayments.length 
                  : 0,
                completedGigs: convertedPayments.filter(p => p.status === 'paid').length
              });
            }
          } catch (statsError) {
            console.error('Error fetching payment stats:', statsError);
            // Don't fail the whole page if stats don't load
            
            // Calculate basic stats from payments as fallback
            const paid = convertedPayments.filter(p => p.status === 'paid')
              .reduce((sum, payment) => sum + payment.amount, 0);
            const pending = convertedPayments.filter(p => p.status === 'pending')
              .reduce((sum, payment) => sum + payment.amount, 0);
            const completed = convertedPayments.filter(p => p.status === 'paid' || p.status === 'completed').length;
            
            setSummary({
              totalEarnings: paid,
              totalEarned: paid,
              thisMonth: paid, // simplified - would need date filtering for accuracy
              pendingPayments: pending,
              completedPayments: completed,
              averagePayment: completed > 0 ? paid / completed : 0,
              completedGigs: completed
            });
          }
        } else {
          setPayments([]);
          setError('Failed to load payment data');
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
        setError('Error loading your payment data');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [filter]);

  useEffect(() => {
    if (payments.length > 0) {
      const paidPayments = payments.filter(p => p.status === 'paid');
      const pendingPayments = payments.filter(p => p.status === 'pending');
      const totalPaid = paidPayments.reduce((acc, curr) => acc + curr.amount, 0);

      setSummary({
        totalEarnings: totalPaid,
        totalEarned: totalPaid,
        thisMonth: totalPaid, // This could be calculated more accurately with date filtering
        pendingPayments: pendingPayments.length,
        completedPayments: paidPayments.length,
        averagePayment: paidPayments.length > 0 ? totalPaid / paidPayments.length : 0,
        completedGigs: paidPayments.length
      });
    }
  }, [payments, setSummary]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <FaCheckCircle className="text-green-500" />;
      case 'processing': return <FaClock className="text-blue-500" />;
      case 'pending': return <FaClock className="text-orange-500" />;
      case 'failed': return <FaCreditCard className="text-red-500" />;
      default: return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-quickshift-light text-quickshift-primary';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method: string | undefined) => {
    if (!method) return '💳';
    switch (method.toLowerCase()) {
      case 'card':
        return '💳';
      case 'bank':
        return '🏦';
      default:
        return '💰';
    }
  };

  const getPaymentMethodLabel = (method: string | undefined) => {
    if (!method) return 'Card Payment';
    switch (method.toLowerCase()) {
      case 'card':
        return 'Card Payment';
      case 'bank':
        return 'Bank Transfer';
      default:
        return 'Other Payment';
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesFilter = filter === 'all' || payment.status === filter;
    const matchesSearch = payment.gigTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.employerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusCounts = () => {
    return {
      all: payments.length,
      paid: payments.filter(p => p.status === 'paid').length,
      pending: payments.filter(p => p.status === 'pending').length,
      processing: payments.filter(p => p.status === 'processing').length,
      failed: payments.filter(p => p.status === 'failed').length
    };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
        {/* Payments List Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Earnings</p>
                <p className="text-2xl font-bold">LKR {summary.totalEarnings.toLocaleString()}</p>
              </div>
              <FaMoneyBillWave className="text-3xl text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">This Month</p>
                <p className="text-2xl font-bold">LKR {summary.thisMonth.toLocaleString()}</p>
              </div>
              <FaCalendarAlt className="text-3xl text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Pending</p>
                <p className="text-2xl font-bold">LKR {summary.pendingPayments.toLocaleString()}</p>
              </div>
              <FaClock className="text-3xl text-orange-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Completed Gigs</p>
                <p className="text-2xl font-bold">{summary.completedGigs}</p>
              </div>
              <FaCheckCircle className="text-3xl text-purple-200" />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FaMoneyBillWave className="text-green-600 text-2xl mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">My Payments</h1>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Payments', count: statusCounts.all },
            { key: 'paid', label: 'Paid', count: statusCounts.paid },
            { key: 'processing', label: 'Processing', count: statusCounts.processing },
            { key: 'pending', label: 'Pending', count: statusCounts.pending },
            { key: 'failed', label: 'Failed', count: statusCounts.failed }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-quickshift-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {filteredPayments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FaMoneyBillWave className="mx-auto text-gray-400 text-4xl mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No payments yet' : `No ${filter} payments`}
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? 'Complete your first gig to start earning!'
                : `You don't have any ${filter} payments at the moment.`}
            </p>
            {filter === 'all' && (
              <button className="bg-quickshift-primary text-white px-6 py-2 rounded-lg hover:bg-quickshift-secondary transition-colors">
                Browse Jobs
              </button>
            )}
          </div>
        ) : (
          filteredPayments.map(payment => (
            <div key={payment.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {payment.gigTitle}
                    </h3>
                    <p className="text-gray-600 mb-2">{payment.employerName}</p>
                    <p className="text-gray-700 text-sm mb-3">{payment.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div>
                        Completed: {new Date(payment.completionDate).toLocaleDateString()}
                      </div>
                      {payment.paymentDate && (
                        <div>
                          Paid: {new Date(payment.paymentDate).toLocaleDateString()}
                        </div>
                      )}
                      <div className="flex items-center">
                        <span className="mr-1">{getPaymentMethodIcon(payment.paymentMethod)}</span>
                        {getPaymentMethodLabel(payment.paymentMethod)}
                      </div>
                      {payment.transactionId && (
                        <div className="font-mono text-xs">
                          ID: {payment.transactionId}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {payment.currency} {payment.amount.toLocaleString()}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(payment.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status-specific Information */}
                {payment.status === 'processing' && (
                  <div className="bg-quickshift-light border border-quickshift-tertiary rounded-lg p-3 mb-4">
                    <p className="text-blue-800 text-sm">
                      <strong>Payment Processing:</strong> Your payment is being processed and should arrive within 2-3 business days.
                    </p>
                  </div>
                )}

                {payment.status === 'pending' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                    <p className="text-orange-800 text-sm">
                      <strong>Payment Pending:</strong> Waiting for employer approval. Payments are typically processed within 24-48 hours of gig completion.
                    </p>
                  </div>
                )}

                {payment.status === 'failed' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-red-800 text-sm">
                      <strong>Payment Failed:</strong> There was an issue processing your payment. Please contact support for assistance.
                    </p>
                  </div>
                )}

                {payment.status === 'paid' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-green-800 text-sm">
                      <strong>Payment Completed:</strong> Payment has been successfully transferred to your account.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                  View Gig Details
                </button>
                <div className="space-x-2">
                  {payment.invoiceUrl && (
                    <button className="flex items-center space-x-1 bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors">
                      <FaDownload />
                      <span>Invoice</span>
                    </button>
                  )}
                  {payment.status === 'failed' && (
                    <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors">
                      Report Issue
                    </button>
                  )}
                  <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium text-sm">
                    <FaEye />
                    <span>Details</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <FaDownload className="text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">Download Tax Report</h3>
            <p className="text-sm text-gray-600">Generate annual earnings report for tax purposes</p>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <FaCreditCard className="text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900">Update Payment Info</h3>
            <p className="text-sm text-gray-600">Manage your bank account and payment preferences</p>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <FaEye className="text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900">Payment History</h3>
            <p className="text-sm text-gray-600">View detailed payment history and analytics</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyPayments;
