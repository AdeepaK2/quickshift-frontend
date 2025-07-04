'use client';

import { useState, useEffect } from 'react';
import { 
  FaMoneyBillWave, 
  FaClock, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaDownload,
  FaEye,
  FaPaypal,
  FaCreditCard,
  FaCalendarAlt,
  FaChartLine
} from 'react-icons/fa';
import { employerService } from '@/services/employerService';
import { gigCompletionService, GigCompletion } from '@/services/gigCompletionService';
import { paymentService, PaymentProcessRequest } from '@/services/paymentService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface PaymentData {
  _id: string;
  gigTitle: string;
  workers: Array<{
    worker: {
      _id: string;
      firstName: string;
      lastName: string;
    };
    payment: {
      amount: number;
      status: 'pending' | 'processing' | 'paid' | 'failed';
      paymentDate?: string;
    };
  }>;
  paymentSummary: {
    totalAmount: number;
    finalAmount: number;
    paymentStatus: 'pending' | 'processing' | 'completed' | 'failed';
    invoiceNumber?: string;
  };
  completedAt: string;
}

interface PaymentStats {
  totalSpent: number;
  totalGigs: number;
  averagePerGig: number;
  currentMonth: number;
  previousMonth: number;
  pendingPayments: number;
  completedPayments: number;
}

export default function PaymentManagement() {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isRecalculatingPayment, setIsRecalculatingPayment] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<null | {
    type: 'process' | 'recalculate',
    paymentId: string
  }>(null);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch completed gigs with payment information
      const completedGigsResponse = await gigCompletionService.getEmployerCompletedGigs({
        status: 'confirmed',
        limit: 50
      });

      // Fetch financial overview
      const financialResponse = await employerService.getFinancialOverview();

      if (completedGigsResponse.success && completedGigsResponse.data) {
        // Transform GigCompletion data to PaymentData format
        const transformedPayments: PaymentData[] = completedGigsResponse.data.map((gig: GigCompletion) => ({
          _id: gig._id,
          gigTitle: typeof gig.gigRequest === 'object' ? gig.gigRequest.title : 'Unknown Gig',
          workers: gig.workers.map(worker => ({
            worker: {
              _id: typeof worker.worker === 'object' ? worker.worker._id : worker.worker,
              firstName: typeof worker.worker === 'object' ? worker.worker.firstName : 'Unknown',
              lastName: typeof worker.worker === 'object' ? worker.worker.lastName : 'User'
            },
            payment: {
              amount: worker.payment.amount,
              status: worker.payment.status === 'paid' ? 'paid' : 
                     worker.payment.status === 'processing' ? 'processing' :
                     worker.payment.status === 'failed' ? 'failed' : 'pending',
              paymentDate: undefined // This field may not exist in the current data structure
            }
          })),
          paymentSummary: {
            totalAmount: gig.paymentSummary.totalAmount,
            finalAmount: gig.paymentSummary.finalAmount,
            paymentStatus: gig.paymentSummary.paymentStatus === 'completed' ? 'completed' :
                          gig.paymentSummary.paymentStatus === 'processing' ? 'processing' :
                          gig.paymentSummary.paymentStatus === 'partial' ? 'processing' : 'pending',
            invoiceNumber: undefined // Will be populated from actual data
          },
          completedAt: gig.completedAt || gig.createdAt
        }));
        
        setPayments(transformedPayments);
        
        setPaymentStats({
          totalSpent: financialResponse.data?.totalSpent || 0,
          totalGigs: financialResponse.data?.totalGigs || transformedPayments.length,
          averagePerGig: financialResponse.data?.averagePerGig || 0,
          currentMonth: financialResponse.data?.currentMonth || 0,
          previousMonth: financialResponse.data?.previousMonth || 0,
          pendingPayments: transformedPayments.filter(p => p.paymentSummary.paymentStatus === 'pending').length,
          completedPayments: transformedPayments.filter(p => p.paymentSummary.paymentStatus === 'completed').length
        });
      }

      if (financialResponse.success && financialResponse.data && !paymentStats) {
        const financialData = financialResponse.data;
        setPaymentStats({
          totalSpent: financialData.totalSpent,
          totalGigs: financialData.totalGigs,
          averagePerGig: financialData.averagePerGig,
          currentMonth: financialData.currentMonth,
          previousMonth: financialData.previousMonth,
          pendingPayments: 0,
          completedPayments: 0
        });
      }
    } catch (error) {
      console.error('Error fetching payment data:', error);
      if (error instanceof Error) {
        if (error.message.includes('authentication') || error.message.includes('token')) {
          setError('Your session has expired. Please log in again.');
          // Redirect to login after a brief delay
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 3000);
        } else if (error.message.includes('permission')) {
          setError('You do not have permission to access this data.');
        } else {
          setError(error.message || 'Failed to load payment data. Please try again.');
        }
      } else {
        setError('Failed to load payment data. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessPayment = async (paymentId: string) => {
    setShowConfirmDialog({ type: 'process', paymentId });
  };

  const handleRecalculatePayment = async (paymentId: string) => {
    setShowConfirmDialog({ type: 'recalculate', paymentId });
  };

  const confirmAction = async () => {
    if (!showConfirmDialog) return;
    if (showConfirmDialog.type === 'process') {
      try {
        setIsProcessingPayment(true);
        setError(null);
        const paymentData: PaymentProcessRequest = {
          paymentMethod: 'bank_transfer',
          notes: `Payment processed for gig completion ${showConfirmDialog.paymentId}`
        };
        const response = await paymentService.processPayment(showConfirmDialog.paymentId, paymentData);
        if (response.success) {
          setNotification({ type: 'success', message: `Payment processing initiated successfully! Invoice: ${response.data?.invoiceNumber || 'N/A'}` });
          setTimeout(() => setNotification(null), 5000);
          await fetchPaymentData();
        } else {
          setError(response.message || 'Failed to process payment');
          setNotification({ type: 'error', message: response.message || 'Failed to process payment' });
          setTimeout(() => setNotification(null), 5000);
        }
      } catch (error: any) {
        console.error('Error processing payment:', error);
        const errorMessage = error?.message || 'Failed to process payment. Please try again.';
        setError(errorMessage);
        setNotification({ type: 'error', message: errorMessage });
        setTimeout(() => setNotification(null), 5000);
      } finally {
        setIsProcessingPayment(false);
      }
    } else if (showConfirmDialog.type === 'recalculate') {
      try {
        setIsRecalculatingPayment(showConfirmDialog.paymentId);
        setError(null);
        const response = await gigCompletionService.recalculatePayments(showConfirmDialog.paymentId);
        if (response.success) {
          setNotification({ type: 'success', message: 'Payment amounts have been recalculated successfully!' });
          setTimeout(() => setNotification(null), 5000);
          await fetchPaymentData();
        } else {
          setError(response.message || 'Failed to recalculate payment');
          setNotification({ type: 'error', message: response.message || 'Failed to recalculate payment' });
          setTimeout(() => setNotification(null), 5000);
        }
      } catch (error: any) {
        console.error('Error recalculating payment:', error);
        const errorMessage = error?.message || 'Failed to recalculate payment. Please try again.';
        setError(errorMessage);
        setNotification({ type: 'error', message: errorMessage });
        setTimeout(() => setNotification(null), 5000);
      } finally {
        setIsRecalculatingPayment(null);
      }
    }
    setShowConfirmDialog(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-500" />;
      case 'processing':
        return <FaClock className="text-blue-500" />;
      case 'pending':
        return <FaClock className="text-orange-500" />;
      case 'failed':
        return <FaExclamationTriangle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.gigTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.paymentSummary.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0077B6]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <h3 className="font-semibold">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' && <FaCheckCircle />}
            {notification.type === 'error' && <FaExclamationTriangle />}
            <span>{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-4 text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#03045E]">Payment Management</h1>
        <p className="text-gray-600 mt-2">Manage and track all your worker payments</p>
      </div>

      {/* Payment Stats */}
      {paymentStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Spent</p>
                <p className="text-2xl font-bold">LKR {paymentStats.totalSpent.toLocaleString()}</p>
              </div>
              <FaMoneyBillWave className="text-3xl text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">This Month</p>
                <p className="text-2xl font-bold">LKR {paymentStats.currentMonth.toLocaleString()}</p>
              </div>
              <FaCalendarAlt className="text-3xl text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Pending Payments</p>
                <p className="text-2xl font-bold">{paymentStats.pendingPayments}</p>
              </div>
              <FaClock className="text-3xl text-orange-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Avg per Gig</p>
                <p className="text-2xl font-bold">LKR {paymentStats.averagePerGig.toLocaleString()}</p>
              </div>
              <FaChartLine className="text-3xl text-purple-200" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by gig title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            
            <button className="flex items-center space-x-2 bg-[#0077B6] text-white px-4 py-2 rounded-lg hover:bg-[#005f8c] transition-colors">
              <FaDownload />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payment List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <FaMoneyBillWave className="mx-auto text-gray-400 text-4xl mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-500">
                {statusFilter === 'all' 
                  ? 'You haven\'t made any payments yet.'
                  : `No ${statusFilter} payments found.`}
              </p>
            </div>
          ) : (
            filteredPayments.map((payment) => (
              <div key={payment._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{payment.gigTitle}</h4>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(payment.paymentSummary.paymentStatus)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.paymentSummary.paymentStatus)}`}>
                          {payment.paymentSummary.paymentStatus.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <span>{payment.workers.length} worker{payment.workers.length !== 1 ? 's' : ''}</span>
                      <span>Completed: {new Date(payment.completedAt).toLocaleDateString()}</span>
                      {payment.paymentSummary.invoiceNumber && (
                        <span>Invoice: {payment.paymentSummary.invoiceNumber}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-[#0077B6] mb-2">
                      LKR {payment.paymentSummary.finalAmount.toLocaleString()}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowPaymentModal(true);
                        }}
                        className="flex items-center space-x-1 text-[#0077B6] hover:text-[#005f8c] font-medium text-sm"
                      >
                        <FaEye />
                        <span>View Details</span>
                      </button>
                      
                      {payment.paymentSummary.paymentStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => handleProcessPayment(payment._id)}
                            disabled={isProcessingPayment}
                            className={`flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${
                              isProcessingPayment 
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                : 'bg-[#0077B6] text-white hover:bg-[#005f8c]'
                            }`}
                          >
                            <FaCreditCard />
                            <span>{isProcessingPayment ? 'Processing...' : 'Process Payment'}</span>
                          </button>
                          
                          {payment.paymentSummary.finalAmount === 0 && (
                            <button
                              onClick={() => handleRecalculatePayment(payment._id)}
                              disabled={isRecalculatingPayment === payment._id}
                              className={`flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${
                                isRecalculatingPayment === payment._id
                                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                  : 'bg-orange-500 text-white hover:bg-orange-600'
                              }`}
                            >
                              <FaChartLine />
                              <span>{isRecalculatingPayment === payment._id ? 'Calculating...' : 'Recalculate'}</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Payment Details Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Payment Summary */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Payment Summary</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gig Title:</span>
                    <span className="font-medium">{selectedPayment.gigTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium">LKR {selectedPayment.paymentSummary.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Final Amount:</span>
                    <span className="font-bold text-[#0077B6]">LKR {selectedPayment.paymentSummary.finalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPayment.paymentSummary.paymentStatus)}`}>
                      {selectedPayment.paymentSummary.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Worker Breakdown */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Worker Payments</h4>
                <div className="space-y-3">
                  {selectedPayment.workers.map((worker, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-900">
                            {worker.worker.firstName} {worker.worker.lastName}
                          </div>
                          <div className="text-sm text-gray-600">
                            Status: {worker.payment.status}
                            {worker.payment.paymentDate && (
                              <span className="ml-2">
                                • Paid: {new Date(worker.payment.paymentDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[#0077B6]">
                            LKR {worker.payment.amount.toLocaleString()}
                          </div>
                          {getStatusIcon(worker.payment.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#0077B6] hover:bg-gray-50 transition-colors text-left">
            <FaDownload className="text-[#0077B6] mb-2" />
            <h4 className="font-medium text-gray-900">Export Payment Report</h4>
            <p className="text-sm text-gray-600">Download payment history for accounting</p>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#0077B6] hover:bg-gray-50 transition-colors text-left">
            <FaCreditCard className="text-[#0077B6] mb-2" />
            <h4 className="font-medium text-gray-900">Payment Methods</h4>
            <p className="text-sm text-gray-600">Manage your payment methods</p>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#0077B6] hover:bg-gray-50 transition-colors text-left">
            <FaChartLine className="text-[#0077B6] mb-2" />
            <h4 className="font-medium text-gray-900">Payment Analytics</h4>
            <p className="text-sm text-gray-600">View detailed payment insights</p>
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!showConfirmDialog} onOpenChange={open => !open && setShowConfirmDialog(null)}>
        <DialogContent className="max-w-sm p-6 bg-white text-gray-900">
          <div className="mb-4">
            <div className="text-lg font-semibold mb-2">
              {showConfirmDialog?.type === 'process' ? 'Confirm Payment Processing' : 'Confirm Recalculation'}
            </div>
            <div className="text-gray-700 text-sm">
              {showConfirmDialog?.type === 'process'
                ? 'Are you sure you want to process this payment? This action cannot be undone.'
                : 'Are you sure you want to recalculate payment amounts? This will update the payment based on current job rates and hours worked.'}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              className="px-4 py-2 bg-gray-100 text-gray-800 border border-gray-300 rounded hover:bg-gray-200"
              onClick={() => setShowConfirmDialog(null)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={confirmAction}
              disabled={isProcessingPayment || !!isRecalculatingPayment}
            >
              Confirm
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
