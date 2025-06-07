'use client';

import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaMoneyBillWave, FaMapMarkerAlt, FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

interface Gig {
  id: string;
  title: string;
  employer: string;
  location: string;
  startDate: string;
  endDate: string;
  status: 'ongoing' | 'completed';
  payment: {
    amount: string;
    status: 'paid' | 'pending';
    date?: string;
  };
  rating?: {
    value: number;
    comment: string;
  };
}

export default function MyGigs() {
  const [activeTab, setActiveTab] = useState<'ongoing' | 'previous'>('ongoing');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGig, setSelectedGig] = useState<string | null>(null);
  const [rating, setRating] = useState<{ value: number; comment: string }>({ value: 0, comment: '' });

  // Mock data - replace with actual API call
  const gigs: Gig[] = [
    {
      id: '1',
      title: 'Event Staff',
      employer: 'EventPro Solutions',
      location: 'Colombo',
      startDate: '2024-03-20',
      endDate: '2024-03-25',
      status: 'ongoing',
      payment: {
        amount: 'LKR 15,000',
        status: 'pending',
      },
    },
    {
      id: '2',
      title: 'Delivery Assistant',
      employer: 'QuickDeliver',
      location: 'Kandy',
      startDate: '2024-03-10',
      endDate: '2024-03-15',
      status: 'completed',
      payment: {
        amount: 'LKR 12,000',
        status: 'paid',
        date: '2024-03-16',
      },
      rating: {
        value: 4.5,
        comment: 'Great working environment and supportive team.',
      },
    },
  ];

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const renderStars = (value: number) => {
    const stars = [];
    const fullStars = Math.floor(value);
    const hasHalfStar = value % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }

    return stars;
  };

  const handleRatingSubmit = (gigId: string) => {
    // Handle rating submission
    console.log('Submitting rating for gig:', gigId, rating);
    setSelectedGig(null);
    setRating({ value: 0, comment: '' });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="flex space-x-4 mb-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded w-32"></div>
          ))}
        </div>
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

  const filteredGigs = gigs.filter((gig) => 
    activeTab === 'ongoing' ? gig.status === 'ongoing' : gig.status === 'completed'
  );

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-[#03045E] mb-6">My Gigs</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('ongoing')}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'ongoing'
              ? 'bg-[#0077B6] text-white shadow-md'
              : 'bg-[#CAF0F8] text-[#0077B6] hover:bg-[#90E0EF]'
          }`}
        >
          Ongoing Gigs
        </button>
        <button
          onClick={() => setActiveTab('previous')}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'previous'
              ? 'bg-[#0077B6] text-white shadow-md'
              : 'bg-[#CAF0F8] text-[#0077B6] hover:bg-[#90E0EF]'
          }`}
        >
          Previous Gigs
        </button>
      </div>

      {/* Gigs List */}
      <div className="space-y-6">
        {filteredGigs.map((gig) => (
          <div
            key={gig.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-[#03045E] mb-2">{gig.title}</h3>
                  <p className="text-gray-600 text-lg">{gig.employer}</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  gig.status === 'ongoing'
                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {gig.status === 'ongoing' ? 'Ongoing' : 'Completed'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-600 mb-6">
                <div className="flex items-center">
                  <FaMapMarkerAlt className="mr-3 text-[#0077B6]" />
                  <span className="text-lg">{gig.location}</span>
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-3 text-[#0077B6]" />
                  <span className="text-lg">
                    {new Date(gig.startDate).toLocaleDateString()} - {new Date(gig.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <FaMoneyBillWave className="mr-3 text-[#0077B6]" />
                  <span className="text-lg">{gig.payment.amount}</span>
                </div>
              </div>

              {gig.status === 'completed' && (
                <div className="border-t border-gray-200 pt-6">
                  {gig.rating ? (
                    <div>
                      <h4 className="text-lg font-medium text-[#03045E] mb-2">Your Rating</h4>
                      <div className="flex items-center mb-2">
                        <div className="flex mr-3">{renderStars(gig.rating.value)}</div>
                        <span className="text-lg font-medium text-[#03045E]">{gig.rating.value.toFixed(1)}</span>
                      </div>
                      <p className="text-gray-600">{gig.rating.comment}</p>
                    </div>
                  ) : selectedGig === gig.id ? (
                    <div>
                      <h4 className="text-lg font-medium text-[#03045E] mb-4">Rate this Gig</h4>
                      <div className="flex items-center mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating({ ...rating, value: star })}
                            className="text-2xl text-yellow-400 hover:text-yellow-500 transition-colors duration-200"
                          >
                            {star <= rating.value ? <FaStar /> : <FaRegStar />}
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={rating.comment}
                        onChange={(e) => setRating({ ...rating, comment: e.target.value })}
                        placeholder="Share your experience..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent shadow-sm mb-4"
                        rows={3}
                      />
                      <div className="flex justify-end space-x-4">
                        <button
                          onClick={() => {
                            setSelectedGig(null);
                            setRating({ value: 0, comment: '' });
                          }}
                          className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleRatingSubmit(gig.id)}
                          className="px-6 py-3 bg-[#0077B6] text-white rounded-lg hover:bg-[#00B4D8] transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          Submit Rating
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedGig(gig.id)}
                      className="text-[#0077B6] hover:text-[#00B4D8] transition-colors duration-200"
                    >
                      Rate this Gig
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredGigs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Gigs Found</h3>
            <p className="text-gray-500">
              {activeTab === 'ongoing'
                ? "You don't have any ongoing gigs at the moment."
                : "You haven't completed any gigs yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 