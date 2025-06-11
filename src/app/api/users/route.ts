import { NextResponse } from "next/server";

// Mock data for users/undergraduates
const mockUsers = [
  {
    id: "1",
    _id: "1",
    profilePicture: null,
    fullName: "Ahmad Hassan",
    email: "ahmad.hassan@student.uitm.edu.my",
    university: "Universiti Teknologi MARA (UiTM)",
    yearOfStudy: 3,
    studentIdVerified: true,
    phoneNumber: "+60123456789",
    faculty: "Computer Science",
    gender: "Male",
    dateOfBirth: "2002-05-15",
    address: "123 Jalan Ampang",
    city: "Shah Alam",
    postalCode: "40450",
    accountStatus: "active",
    verificationStatus: "verified",
    lastLogin: "2024-12-07T15:30:00Z",
    bio: "Passionate computer science student interested in web development and AI.",
    gpa: 3.75,
    skillsAndInterests: ["JavaScript", "React", "Python", "Machine Learning"],
    documentsUploaded: ["student_id.pdf", "transcript.pdf"],
    joinDate: "2024-01-10T08:00:00Z",
    verified: true,
  },
  {
    id: "2",
    _id: "2",
    profilePicture: null,
    fullName: "Siti Nurhaliza",
    email: "siti.nurhaliza@student.um.edu.my",
    university: "University of Malaya (UM)",
    yearOfStudy: 2,
    studentIdVerified: false,
    phoneNumber: "+60123456790",
    faculty: "Business Administration",
    gender: "Female",
    dateOfBirth: "2003-08-22",
    address: "456 Jalan Bangsar",
    city: "Kuala Lumpur",
    postalCode: "59000",
    accountStatus: "active",
    verificationStatus: "pending",
    lastLogin: "2024-12-06T20:15:00Z",
    bio: "Business student with interest in digital marketing and entrepreneurship.",
    gpa: 3.6,
    skillsAndInterests: [
      "Digital Marketing",
      "Business Strategy",
      "Social Media",
    ],
    documentsUploaded: ["student_id.pdf"],
    joinDate: "2024-02-15T09:00:00Z",
    verified: false,
  },
  {
    id: "3",
    _id: "3",
    profilePicture: null,
    fullName: "Chen Wei Ming",
    email: "chen.weiming@student.upm.edu.my",
    university: "Universiti Putra Malaysia (UPM)",
    yearOfStudy: 4,
    studentIdVerified: true,
    phoneNumber: "+60123456791",
    faculty: "Engineering",
    gender: "Male",
    dateOfBirth: "2001-12-03",
    address: "789 Jalan Serdang",
    city: "Serdang",
    postalCode: "43400",
    accountStatus: "suspended",
    verificationStatus: "verified",
    lastLogin: "2024-12-05T12:00:00Z",
    bio: "Engineering student specializing in software development and system design.",
    gpa: 3.85,
    skillsAndInterests: ["Java", "System Design", "DevOps", "Cloud Computing"],
    documentsUploaded: ["student_id.pdf", "transcript.pdf", "portfolio.pdf"],
    joinDate: "2024-01-05T07:30:00Z",
    verified: true,
  },
];

export async function GET() {
  try {
    console.log("Local API: GET /api/users called");

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 150));

    return NextResponse.json({
      success: true,
      data: mockUsers,
      message: "Users retrieved successfully (local API)",
      total: mockUsers.length,
      page: 1,
      pages: 1,
    });
  } catch (error) {
    console.error("Local users API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve users",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
