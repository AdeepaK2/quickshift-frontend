'use client';

import { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaCalendarAlt, FaCheckCircle, FaClock } from 'react-icons/fa';

interface Payment {
  id: string;
  gigTitle: string;
  amount: string;
  date: string;
  status: 'paid' | 'pending';
  employer: string;
}

export default function MyPayments() {
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockPayments: Payment[] = [
      {
        id: '1',
        gigTitle: 'Event Staff',
        amount: 'LKR 15,000',
        date: '2024-03-25',
        status: 'paid',
        employer: 'EventPro Solutions',
      },
      {
        id: '2',
        gigTitle: 'Delivery Assistant',
        amount: 'LKR 12,000',
        date: '2024-03-15',
        status: 'paid',
        employer: 'QuickDeliver',
      },
      {
        id: '3',
        gigTitle: 'Data Entry Clerk',
        amount: 'LKR 18,000',
        date: '2024-03-28',
        status: 'pending',
        employer: 'DataTech Solutions',
      },
    ];

    // Simulate API call
    const timer = setTimeout(() => {
      setPayments(mockPayments);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 mb-4">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-[#03045E] mb-6">My Payments</h1>

      <div className="space-y-6">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-[#03045E] mb-2">{payment.gigTitle}</h3>
                  <p className="text-gray-600 text-lg">{payment.employer}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  payment.status === 'paid'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                }`}>
                  {payment.status === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-600">
                <div className="flex items-center">
                  <FaMoneyBillWave className="mr-3 text-[#0077B6]" />
                  <span className="text-lg">{payment.amount}</span>
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-3 text-[#0077B6]" />
                  <span className="text-lg">{new Date(payment.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  {payment.status === 'paid' ? (
                    <FaCheckCircle className="mr-3 text-green-500" />
                  ) : (
                    <FaClock className="mr-3 text-yellow-500" />
                  )}
                  <span className="text-lg">
                    {payment.status === 'paid' ? 'Payment Completed' : 'Payment Processing'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {payments.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Payments Found</h3>
            <p className="text-gray-500">You haven&apos;t received any payments yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}