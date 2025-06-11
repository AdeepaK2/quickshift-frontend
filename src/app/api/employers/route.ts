import { NextResponse } from "next/server";

// Mock data for development/fallback
const mockEmployers = [
  {
    _id: "1",
    companyName: "Tech Solutions Ltd",
    email: "admin@techsolutions.com",
    phone: "+1234567890",
    location: "Kuala Lumpur",
    isVerified: true,
    verified: true,
    ratings: {
      averageRating: 4.5,
      totalReviews: 23,
    },
    lastLoginAt: "2024-12-07T10:30:00Z",
    profilePicture: null,
    companyDescription: "Leading technology solutions provider",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-12-07T10:30:00Z",
  },
  {
    _id: "2",
    companyName: "Digital Marketing Hub",
    email: "contact@digitalmarketing.com",
    phone: "+1234567891",
    location: "Petaling Jaya",
    isVerified: false,
    verified: false,
    ratings: {
      averageRating: 4.2,
      totalReviews: 15,
    },
    lastLoginAt: "2024-12-06T14:20:00Z",
    profilePicture: null,
    companyDescription: "Full-service digital marketing agency",
    createdAt: "2024-02-20T09:00:00Z",
    updatedAt: "2024-12-06T14:20:00Z",
  },
  {
    _id: "3",
    companyName: "StartupCafe",
    email: "hello@startupcafe.my",
    phone: "+1234567892",
    location: "Shah Alam",
    isVerified: true,
    verified: true,
    ratings: {
      averageRating: 4.8,
      totalReviews: 42,
    },
    lastLoginAt: "2024-12-07T16:45:00Z",
    profilePicture: null,
    companyDescription: "Innovative startup accelerator and workspace",
    createdAt: "2024-03-10T11:00:00Z",
    updatedAt: "2024-12-07T16:45:00Z",
  },
];

export async function GET() {
  try {
    console.log("Local API: GET /api/employers called");

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return NextResponse.json({
      success: true,
      data: mockEmployers,
      message: "Employers retrieved successfully (local API)",
      total: mockEmployers.length,
      page: 1,
      pages: 1,
    });
  } catch (error) {
    console.error("Local employers API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve employers",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
