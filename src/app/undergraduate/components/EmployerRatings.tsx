'use client';

import { useState, useEffect } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar, FaBuilding, FaMapMarkerAlt } from 'react-icons/fa';

interface Rating {
  id: string;
  employerName: string;
  location: string;
  rating: number;
  review: string;
  date: string;
  jobTitle: string;
}

export default function EmployerRatings() {
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with actual API call
  const ratings: Rating[] = [
    {
      id: '1',
      employerName: 'EventPro Solutions',
      location: 'Colombo',
      rating: 4.5,
      review: 'Great working environment and supportive team. The work was well-organized and the pay was fair.',
      date: '2024-03-15',
      jobTitle: 'Event Staff',
    },
    {
      id: '2',
      employerName: 'QuickDeliver',
      location: 'Kandy',
      rating: 3.8,
      review: 'Flexible hours and good pay. Communication could be improved.',
      date: '2024-03-10',
      jobTitle: 'Delivery Assistant',
    },
    {
      id: '3',
      employerName: 'TechCorp',
      location: 'Galle',
      rating: 4.2,
      review: 'Professional environment and clear expectations. Would work with them again.',
      date: '2024-03-05',
      jobTitle: 'Office Assistant',
    },
  ];

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // 1 second delay to simulate loading

    return () => clearTimeout(timer);
  }, []);

  const filteredRatings = ratings.filter((rating) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      rating.employerName.toLowerCase().includes(searchLower) ||
      rating.jobTitle.toLowerCase().includes(searchLower) ||
      rating.review.toLowerCase().includes(searchLower)
    );
  });

  const sortedRatings = [...filteredRatings].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return b.rating - a.rating;
  });

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 mb-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-20 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-[#03045E]">Employer Ratings</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search ratings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent shadow-sm"
            />
            <div className="absolute right-3 top-2.5 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'rating')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent shadow-sm appearance-none"
            >
              <option value="date">Date</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {sortedRatings.map((rating) => (
          <div key={rating.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-[#03045E] flex items-center mb-2">
                    <FaBuilding className="mr-3 text-[#0077B6]" />
                    {rating.employerName}
                  </h3>
                  <p className="text-gray-600 text-lg flex items-center">
                    <FaMapMarkerAlt className="mr-3 text-[#0077B6]" />
                    {rating.location}
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="flex mr-3 text-xl">{renderStars(rating.rating)}</div>
                  <span className="text-2xl font-semibold text-[#03045E]">{rating.rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-[#CAF0F8] text-[#0077B6] rounded-full text-sm font-medium">
                  {rating.jobTitle}
                </span>
              </div>

              <p className="text-gray-600 text-lg leading-relaxed mb-6">{rating.review}</p>

              <div className="text-sm text-gray-500">
                Posted on {new Date(rating.date).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}

        {sortedRatings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Ratings Found</h3>
            <p className="text-gray-500">No ratings match your search criteria. Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
} 