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

// API response type for completions
interface CompletionApiResponse {
  _id: string;
  gigRequest: {
    _id: string;
    title: string;
    category?: string;
    location?: any;
    payRate?: any;
  };
  employer: {
    _id: string;
    companyName: string;
    logo?: string;
  };
  status: string;
  completedAt: string;
  myWork: {
    payment: {
      status: string;
      amount: number;
      paymentDate?: string;
    };
    completedTimeSlots: Array<{
      hoursWorked: number;
    }>;
    totalHours: number;
    performance?: any;
  };
}

// Convert API response to Payment interface
const convertToPayment = (completion: CompletionApiResponse): Payment | null => {
  if (!completion.myWork) {
    console.warn('No myWork data found for completion:', completion._id);
    return null;
  }
  
  const { myWork, gigRequest, employer } = completion;
  
  let status = 'pending';
  if (myWork.payment.status === 'paid') {
    status = 'paid';
  } else if (myWork.payment.status === 'processing') {
    status = 'processing';
  } else if (myWork.payment.status === 'failed') {
    status = 'failed';
  }

  const employerName = employer?.companyName || 'Unknown Employer';
  const totalHours = myWork.totalHours || 0;

  return {
    id: completion._id,
    gigId: gigRequest._id,
    gigTitle: gigRequest.title || 'Unknown Job',
    employerName,
    amount: myWork.payment.amount || 0,
    currency: 'LKR',
    status,
    paymentDate: myWork.payment.paymentDate,
    completionDate: completion.completedAt ? format(new Date(completion.completedAt), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    description: `Payment for ${gigRequest.title} (${totalHours} hours)`,
    paymentMethod: undefined, // Payment method would need to be added to the API response
    transactionId: undefined // Transaction ID would need to be added to the API response
  };
};

const MyPayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'processing' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debugMode, setDebugMode] = useState(false);
  
  // Modal states
  const [showGigDetailsModal, setShowGigDetailsModal] = useState(false);
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [gigDetails, setGigDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Debug info
  const debugInfo = {
    hasToken: !!localStorage.getItem('accessToken'),
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
    paymentsCount: payments.length,
    summaryExists: !!summary,
    currentFilter: filter
  };

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching payments with filter:', filter);
        
        // Fetch gig completions as payments
        const response = await gigCompletionService.getMyCompletions({
          paymentStatus: filter === 'all' ? undefined : filter,
          sortBy: 'completedAt',
          sortOrder: 'desc'
        });
        
        console.log('API Response:', response);
        
        if (response.success && response.data?.completions) {
          // Convert backend format to frontend format
          const convertedPayments = response.data.completions
            .map((completion: any) => convertToPayment(completion as CompletionApiResponse))
            .filter((payment): payment is Payment => payment !== null); // Filter out null values and assert type
          
          console.log('Converted payments:', convertedPayments);
          setPayments(convertedPayments);
          
          // Fetch payment stats
          try {
            const statsResponse = await gigCompletionService.getPaymentStats();
            console.log('Stats Response:', statsResponse);
            
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
          console.error('Failed to load payments - invalid response:', response);
          setPayments([]);
          setError(response.message || 'Failed to load payment data');
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
        setError('Error loading your payment data. Please check your connection and try again.');
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

  // Modal handlers
  const fetchGigDetails = async (gigId: string) => {
    try {
      console.log('Fetching gig details for ID:', gigId);
      setLoadingDetails(true);
      setGigDetails(null); // Clear previous data
      const response = await gigCompletionService.getCompletionById(gigId);
      console.log('Gig details response:', response);
      if (response.success && response.data) {
        setGigDetails(response.data);
      } else {
        console.error('Failed to fetch gig details:', response.message);
        setGigDetails(null);
      }
    } catch (error) {
      console.error('Error fetching gig details:', error);
      setGigDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewGigDetails = async (payment: Payment) => {
    console.log('handleViewGigDetails called with payment:', payment);
    setSelectedPayment(payment);
    setShowGigDetailsModal(true);
    await fetchGigDetails(payment.id);
  };

  const handleViewPaymentDetails = (payment: Payment) => {
    console.log('handleViewPaymentDetails called with payment:', payment);
    setSelectedPayment(payment);
    setShowPaymentDetailsModal(true);
  };

  const closeModals = () => {
    setShowGigDetailsModal(false);
    setShowPaymentDetailsModal(false);
    setSelectedPayment(null);
    setGigDetails(null);
  };

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

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Payments</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-quickshift-primary text-white px-6 py-2 rounded-lg hover:bg-quickshift-secondary transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Panel */}
      {debugMode && (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900">Debug Information</h3>
            <button 
              onClick={() => setDebugMode(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <pre className="text-xs text-gray-700 overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}

      {/* Debug Toggle Button */}
      {!debugMode && (
        <button 
          onClick={() => setDebugMode(true)}
          className="fixed bottom-4 right-4 bg-gray-600 text-white px-3 py-2 rounded-full text-xs hover:bg-gray-700 z-50"
        >
          Debug
        </button>
      )}

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
                <button 
                  onClick={() => handleViewGigDetails(payment)}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
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
                  <button 
                    onClick={() => handleViewPaymentDetails(payment)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
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

      {/* Gig Details Modal */}
      {showGigDetailsModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={closeModals}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 m-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Gig Details</h2>
              <button 
                onClick={closeModals}
                className="text-gray-500 hover:text-gray-700 text-xl px-2"
              >
                ✕
              </button>
            </div>

            {loadingDetails ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading gig details...</span>
              </div>
            ) : (
              gigDetails && gigDetails.gigRequest && gigDetails.employer ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {gigDetails.gigRequest?.title || 'Unknown Job'}
                  </h3>
                  <p className="text-gray-700 mb-4">
                    <strong>Employer:</strong> {gigDetails.employer?.companyName || 'Unknown Employer'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Gig ID</p>
                      <p className="font-medium text-gray-900">{gigDetails._id || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Category</p>
                      <p className="font-medium text-gray-900">{gigDetails.gigRequest?.category || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Location</p>
                      <p className="font-medium text-gray-900">
                        {gigDetails.gigRequest?.location ? 
                          (typeof gigDetails.gigRequest.location === 'string' ? 
                            gigDetails.gigRequest.location : 
                            gigDetails.gigRequest.location.address || 
                            gigDetails.gigRequest.location.city || 
                            'Location specified'
                          ) : 'N/A'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Pay Rate</p>
                      <p className="font-medium text-gray-900">
                        {gigDetails.gigRequest?.payRate ? 
                          (typeof gigDetails.gigRequest.payRate === 'number' ? 
                            `LKR ${gigDetails.gigRequest.payRate}` : 
                            typeof gigDetails.gigRequest.payRate === 'object' && gigDetails.gigRequest.payRate.amount ?
                            `LKR ${gigDetails.gigRequest.payRate.amount}` :
                            'Pay rate specified'
                          ) : 'N/A'
                        }
                      </p>
                    </div>
                  </div>

                  {gigDetails.myWork && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h4 className="text-md font-semibold text-gray-900 mb-2">Completion Details</h4>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                        <div className="flex-1 mb-2 sm:mb-0">
                          <p className="text-gray-600 text-sm mb-1">Completion Date</p>
                          <p className="font-medium text-gray-900">
                            {gigDetails.completedAt ? new Date(gigDetails.completedAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-600 text-sm mb-1">Total Hours</p>
                          <p className="font-medium text-gray-900">
                            {gigDetails.myWork?.totalHours || 0} hours
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <div className="flex-1 mb-2 sm:mb-0">
                          <p className="text-gray-600 text-sm mb-1">Payment Status</p>
                          <p className="font-medium text-gray-900">
                            {gigDetails.myWork?.payment?.status ? 
                              gigDetails.myWork.payment.status.charAt(0).toUpperCase() + gigDetails.myWork.payment.status.slice(1) 
                              : 'N/A'
                            }
                          </p>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-600 text-sm mb-1">Amount</p>
                          <p className="font-medium text-gray-900">
                            LKR {gigDetails.myWork?.payment?.amount?.toLocaleString() || '0'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">Unable to load gig details. Please try again.</p>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {showPaymentDetailsModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={closeModals}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 m-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
              <button 
                onClick={closeModals}
                className="text-gray-500 hover:text-gray-700 text-xl px-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-gray-600 text-sm mb-1">Payment ID</p>
                <p className="font-medium text-gray-900">{selectedPayment.id}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Gig Title</p>
                <p className="font-medium text-gray-900">{selectedPayment.gigTitle}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Employer</p>
                <p className="font-medium text-gray-900">{selectedPayment.employerName}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Amount</p>
                <p className="font-medium text-gray-900">
                  {selectedPayment.currency} {selectedPayment.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Status</p>
                <p className="font-medium text-gray-900">
                  {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Payment Date</p>
                <p className="font-medium text-gray-900">
                  {selectedPayment.paymentDate ? new Date(selectedPayment.paymentDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Completion Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(selectedPayment.completionDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Payment Method</p>
                <p className="font-medium text-gray-900">
                  {getPaymentMethodLabel(selectedPayment.paymentMethod)}
                </p>
              </div>
              {selectedPayment.transactionId && (
                <div>
                  <p className="text-gray-600 text-sm mb-1">Transaction ID</p>
                  <p className="font-medium text-gray-900">
                    {selectedPayment.transactionId}
                  </p>
                </div>
              )}
              {selectedPayment.invoiceUrl && (
                <div>
                  <p className="text-gray-600 text-sm mb-1">Invoice</p>
                  <a 
                    href={selectedPayment.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Invoice
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPayments;
