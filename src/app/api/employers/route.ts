import { NextResponse } from "next/server";

// Mock employer data that matches the backend schema
const mockEmployers = [
  {
    _id: "674a1b2c3d4e5f6789012345",
    companyName: "TechCorp Solutions",
    email: "hr@techcorp.com",
    phone: "+1-555-0123",
    location: "San Francisco, CA",
    isVerified: true,
    verified: true,
    ratings: {
      averageRating: 4.7,
      totalReviews: 156,
    },
    lastLoginAt: "2024-12-15T10:30:00Z",
    profilePicture:
      "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&h=150&fit=crop&crop=face",
    companyDescription:
      "Leading technology solutions provider specializing in cloud infrastructure and software development.",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-12-15T10:30:00Z",
  },
  {
    _id: "674a1b2c3d4e5f6789012346",
    companyName: "Global Innovations Inc",
    email: "careers@globalinnovations.com",
    phone: "+1-555-0124",
    location: "New York, NY",
    isVerified: false,
    verified: false,
    ratings: {
      averageRating: 3.9,
      totalReviews: 89,
    },
    lastLoginAt: "2024-12-14T15:45:00Z",
    profilePicture:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&h=150&fit=crop&crop=face",
    companyDescription:
      "Innovation-driven company focused on sustainable technology solutions and green energy initiatives.",
    createdAt: "2024-02-10T09:15:00Z",
    updatedAt: "2024-12-14T15:45:00Z",
  },
  {
    _id: "674a1b2c3d4e5f6789012347",
    companyName: "StartupHub Ventures",
    email: "team@startuphub.com",
    phone: "+1-555-0125",
    location: "Austin, TX",
    isVerified: true,
    verified: true,
    ratings: {
      averageRating: 4.2,
      totalReviews: 67,
    },
    lastLoginAt: "2024-12-13T11:20:00Z",
    profilePicture:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=150&h=150&fit=crop&crop=face",
    companyDescription:
      "Venture capital firm supporting early-stage startups in technology and healthcare sectors.",
    createdAt: "2024-03-05T12:30:00Z",
    updatedAt: "2024-12-13T11:20:00Z",
  },
  {
    _id: "674a1b2c3d4e5f6789012348",
    companyName: "HealthCare Plus",
    email: "hr@healthcareplus.com",
    phone: "+1-555-0126",
    location: "Boston, MA",
    isVerified: true,
    verified: true,
    ratings: {
      averageRating: 4.5,
      totalReviews: 234,
    },
    lastLoginAt: "2024-12-12T09:00:00Z",
    profilePicture:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=150&h=150&fit=crop&crop=face",
    companyDescription:
      "Leading healthcare provider offering innovative medical services and cutting-edge research.",
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-12-12T09:00:00Z",
  },
  {
    _id: "674a1b2c3d4e5f6789012349",
    companyName: "EduLearn Technologies",
    email: "contact@edulearn.com",
    phone: "+1-555-0127",
    location: "Seattle, WA",
    isVerified: false,
    verified: false,
    ratings: {
      averageRating: 3.6,
      totalReviews: 45,
    },
    lastLoginAt: "2024-12-11T14:30:00Z",
    profilePicture:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=150&h=150&fit=crop&crop=face",
    companyDescription:
      "Educational technology company developing innovative learning platforms and digital resources.",
    createdAt: "2024-04-12T13:45:00Z",
    updatedAt: "2024-12-11T14:30:00Z",
  },
];

export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const response = {
      success: true,
      count: mockEmployers.length,
      total: mockEmployers.length,
      page: 1,
      pages: 1,
      data: mockEmployers,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch employers" },
      { status: 500 }
    );
  }
}
