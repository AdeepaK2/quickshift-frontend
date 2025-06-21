/**
 * Gigs API - Centralized API calls for gig management
 * Handles all gig-related API operations with proper error handling
 * Uses environment variable for API base URL configuration
 */

const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://quickshift-9qjun.ondigitalocean.app";

// Types and interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export interface Gig {
  _id: string;
  title: string;
  description: string;
  category: string;
  employer: {
    _id: string;
    companyName: string;
    email: string;
    contactNumber?: string;
  };
  status: "draft" | "open" | "in_progress" | "completed" | "cancelled";
  payRate: {
    amount: number;
    rateType: "hourly" | "fixed" | "daily";
  };
  timeSlots: Array<{
    date: string;
    startTime: string;
    endTime: string;
    peopleNeeded: number;
    peopleAssigned: number;
  }>;
  location: {
    address: string;
    city: string;
    postalCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  requirements?: {
    skills?: string[];
    experience?: string;
    equipment?: string[];
    dressCode?: string;
  };
  applicationDeadline: string;
  applicants: Array<{
    user: string;
    status: "pending" | "accepted" | "rejected";
    appliedAt: string;
    timeSlots: string[];
    coverLetter?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// Dummy data for development and testing
const DUMMY_GIGS: Gig[] = [
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j1",
    title: "Event Setup Staff for University Career Fair",
    description:
      "Help set up booths, tables, and equipment for the annual university career fair. Must be able to lift 50+ lbs and work in a team environment. Great opportunity to network with potential employers!",
    category: "Event Staff",
    employer: {
      _id: "emp_001",
      companyName: "University Events Department",
      email: "events@university.edu",
      contactNumber: "+1-555-0123",
    },
    status: "open",
    payRate: {
      amount: 18.5,
      rateType: "hourly",
    },
    timeSlots: [
      {
        date: "2025-07-15",
        startTime: "08:00",
        endTime: "16:00",
        peopleNeeded: 12,
        peopleAssigned: 8,
      },
      {
        date: "2025-07-16",
        startTime: "08:00",
        endTime: "14:00",
        peopleNeeded: 8,
        peopleAssigned: 6,
      },
    ],
    location: {
      address: "123 University Ave, Student Center",
      city: "Toronto",
      postalCode: "M5S 1A1",
      coordinates: {
        latitude: 43.6629,
        longitude: -79.3957,
      },
    },
    requirements: {
      skills: ["Physical Fitness", "Team Work", "Punctuality"],
      experience: "No experience required",
      equipment: ["Comfortable shoes", "Work gloves"],
      dressCode: "Business casual, closed-toe shoes",
    },
    applicationDeadline: "2025-07-10T23:59:59.000Z",
    applicants: [
      {
        user: "user_001",
        status: "pending",
        appliedAt: "2025-06-18T10:30:00.000Z",
        timeSlots: ["2025-07-15"],
        coverLetter:
          "I'm a hardworking student looking for part-time work to help pay for tuition.",
      },
      {
        user: "user_002",
        status: "accepted",
        appliedAt: "2025-06-17T14:22:00.000Z",
        timeSlots: ["2025-07-15", "2025-07-16"],
        coverLetter:
          "I have experience with event setup from my previous job at a catering company.",
      },
    ],
    createdAt: "2025-06-15T09:00:00.000Z",
    updatedAt: "2025-06-19T16:45:00.000Z",
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j2",
    title: "Campus Tour Guide",
    description:
      "Lead prospective students and families on engaging campus tours. Share your knowledge of university life, facilities, and academic programs. Perfect for outgoing students who love their university!",
    category: "Campus Tours",
    employer: {
      _id: "emp_002",
      companyName: "Admissions Office",
      email: "admissions@university.edu",
      contactNumber: "+1-555-0124",
    },
    status: "open",
    payRate: {
      amount: 16.0,
      rateType: "hourly",
    },
    timeSlots: [
      {
        date: "2025-07-20",
        startTime: "10:00",
        endTime: "12:00",
        peopleNeeded: 3,
        peopleAssigned: 2,
      },
      {
        date: "2025-07-20",
        startTime: "14:00",
        endTime: "16:00",
        peopleNeeded: 3,
        peopleAssigned: 1,
      },
    ],
    location: {
      address: "Main Campus, Admissions Building",
      city: "Toronto",
      postalCode: "M5S 1A1",
    },
    requirements: {
      skills: ["Public Speaking", "University Knowledge", "Customer Service"],
      experience: "Current student preferred, training provided",
      dressCode: "University branded polo shirt (provided)",
    },
    applicationDeadline: "2025-07-15T23:59:59.000Z",
    applicants: [
      {
        user: "user_003",
        status: "accepted",
        appliedAt: "2025-06-16T11:15:00.000Z",
        timeSlots: ["2025-07-20"],
        coverLetter:
          "I'm a third-year student ambassador with excellent communication skills.",
      },
    ],
    createdAt: "2025-06-14T13:30:00.000Z",
    updatedAt: "2025-06-18T09:22:00.000Z",
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j3",
    title: "Warehouse Package Sorting",
    description:
      "Sort and organize packages for delivery. Fast-paced environment with opportunities for overtime. Must be able to stand for long periods and lift packages up to 70 lbs.",
    category: "Warehouse",
    employer: {
      _id: "emp_003",
      companyName: "QuickShip Logistics",
      email: "hr@quickship.com",
      contactNumber: "+1-555-0125",
    },
    status: "in_progress",
    payRate: {
      amount: 19.25,
      rateType: "hourly",
    },
    timeSlots: [
      {
        date: "2025-06-25",
        startTime: "06:00",
        endTime: "14:00",
        peopleNeeded: 15,
        peopleAssigned: 15,
      },
      {
        date: "2025-06-26",
        startTime: "06:00",
        endTime: "14:00",
        peopleNeeded: 15,
        peopleAssigned: 12,
      },
    ],
    location: {
      address: "4567 Industrial Blvd, Unit 12",
      city: "Mississauga",
      postalCode: "L5T 2B3",
    },
    requirements: {
      skills: ["Physical Fitness", "Attention to Detail", "Time Management"],
      experience: "Warehouse experience preferred but not required",
      equipment: ["Steel-toed boots", "High-visibility vest"],
      dressCode: "Work clothes, closed-toe shoes mandatory",
    },
    applicationDeadline: "2025-06-22T23:59:59.000Z",
    applicants: [
      {
        user: "user_004",
        status: "accepted",
        appliedAt: "2025-06-20T08:45:00.000Z",
        timeSlots: ["2025-06-25", "2025-06-26"],
      },
      {
        user: "user_005",
        status: "accepted",
        appliedAt: "2025-06-19T16:30:00.000Z",
        timeSlots: ["2025-06-25"],
      },
    ],
    createdAt: "2025-06-18T07:15:00.000Z",
    updatedAt: "2025-06-20T12:00:00.000Z",
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j4",
    title: "Restaurant Server - Downtown Location",
    description:
      "Serve customers in a busy downtown restaurant during lunch rush. Must have excellent customer service skills and be able to work in a fast-paced environment. Tips included!",
    category: "Food Service",
    employer: {
      _id: "emp_004",
      companyName: "Maple Leaf Bistro",
      email: "manager@mapleleafbistro.com",
      contactNumber: "+1-555-0126",
    },
    status: "open",
    payRate: {
      amount: 15.5,
      rateType: "hourly",
    },
    timeSlots: [
      {
        date: "2025-07-01",
        startTime: "11:00",
        endTime: "15:00",
        peopleNeeded: 4,
        peopleAssigned: 2,
      },
      {
        date: "2025-07-02",
        startTime: "11:00",
        endTime: "15:00",
        peopleNeeded: 4,
        peopleAssigned: 1,
      },
    ],
    location: {
      address: "789 King Street West",
      city: "Toronto",
      postalCode: "M5V 1M5",
    },
    requirements: {
      skills: ["Customer Service", "Multitasking", "Cash Handling"],
      experience: "Food service experience preferred",
      dressCode: "Black pants, white shirt, non-slip shoes",
    },
    applicationDeadline: "2025-06-28T23:59:59.000Z",
    applicants: [
      {
        user: "user_006",
        status: "pending",
        appliedAt: "2025-06-19T12:00:00.000Z",
        timeSlots: ["2025-07-01"],
        coverLetter:
          "I have 2 years of experience working at Tim Hortons and excellent customer service skills.",
      },
    ],
    createdAt: "2025-06-17T10:00:00.000Z",
    updatedAt: "2025-06-19T14:30:00.000Z",
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j5",
    title: "Data Entry Assistant",
    description:
      "Help digitize student records and enter data into our new system. Attention to detail is crucial. Quiet office environment with flexible hours. Perfect for students who prefer desk work.",
    category: "Administrative",
    employer: {
      _id: "emp_005",
      companyName: "Student Records Office",
      email: "records@university.edu",
      contactNumber: "+1-555-0127",
    },
    status: "draft",
    payRate: {
      amount: 320.0,
      rateType: "fixed",
    },
    timeSlots: [
      {
        date: "2025-07-08",
        startTime: "09:00",
        endTime: "17:00",
        peopleNeeded: 2,
        peopleAssigned: 0,
      },
    ],
    location: {
      address: "Administrative Building, Room 205",
      city: "Toronto",
      postalCode: "M5S 1A1",
    },
    requirements: {
      skills: ["Data Entry", "Microsoft Excel", "Attention to Detail"],
      experience: "Basic computer skills required",
      equipment: ["Laptop/computer will be provided"],
    },
    applicationDeadline: "2025-07-05T23:59:59.000Z",
    applicants: [],
    createdAt: "2025-06-19T15:45:00.000Z",
    updatedAt: "2025-06-19T15:45:00.000Z",
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j6",
    title: "Social Media Content Creator",
    description:
      "Create engaging social media content for our summer campaign. Need someone creative with experience in Instagram, TikTok, and Facebook. Must provide own equipment and editing software.",
    category: "Marketing",
    employer: {
      _id: "emp_006",
      companyName: "Campus Life Marketing",
      email: "marketing@campuslife.com",
      contactNumber: "+1-555-0128",
    },
    status: "completed",
    payRate: {
      amount: 850.0,
      rateType: "fixed",
    },
    timeSlots: [
      {
        date: "2025-06-10",
        startTime: "10:00",
        endTime: "18:00",
        peopleNeeded: 1,
        peopleAssigned: 1,
      },
    ],
    location: {
      address: "Remote work with some on-campus shoots",
      city: "Toronto",
      postalCode: "M5S 1A1",
    },
    requirements: {
      skills: [
        "Social Media",
        "Content Creation",
        "Video Editing",
        "Photography",
      ],
      experience: "Portfolio required, 1+ years social media experience",
      equipment: ["Camera/smartphone", "Editing software", "Laptop"],
    },
    applicationDeadline: "2025-06-05T23:59:59.000Z",
    applicants: [
      {
        user: "user_007",
        status: "accepted",
        appliedAt: "2025-06-01T09:30:00.000Z",
        timeSlots: ["2025-06-10"],
        coverLetter:
          "I run a successful Instagram account with 10k+ followers and have experience with Adobe Creative Suite.",
      },
    ],
    createdAt: "2025-05-28T11:20:00.000Z",
    updatedAt: "2025-06-15T17:00:00.000Z",
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j7",
    title: "Customer Support Phone Representative",
    description:
      "Handle customer inquiries via phone for our student services helpline. Training provided. Must have clear communication skills and patience. Work from home opportunity available.",
    category: "Customer Service",
    employer: {
      _id: "emp_007",
      companyName: "Student Support Services",
      email: "support@studentsupport.ca",
      contactNumber: "+1-555-0129",
    },
    status: "cancelled",
    payRate: {
      amount: 17.0,
      rateType: "hourly",
    },
    timeSlots: [
      {
        date: "2025-06-30",
        startTime: "09:00",
        endTime: "17:00",
        peopleNeeded: 5,
        peopleAssigned: 0,
      },
    ],
    location: {
      address: "Remote/Work from home",
      city: "Toronto",
      postalCode: "M5S 1A1",
    },
    requirements: {
      skills: ["Customer Service", "Phone Communication", "Problem Solving"],
      experience: "Customer service experience preferred",
      equipment: ["Reliable internet", "Quiet workspace", "Headset"],
    },
    applicationDeadline: "2025-06-25T23:59:59.000Z",
    applicants: [
      {
        user: "user_008",
        status: "rejected",
        appliedAt: "2025-06-20T13:15:00.000Z",
        timeSlots: ["2025-06-30"],
        coverLetter:
          "I have experience in customer service and a quiet home office setup.",
      },
    ],
    createdAt: "2025-06-18T08:00:00.000Z",
    updatedAt: "2025-06-21T10:30:00.000Z",
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j8",
    title: "Research Assistant - Psychology Department",
    description:
      "Assist with data collection and analysis for ongoing psychology research studies. Must be detail-oriented and comfortable working with statistical software. Great for psychology students!",
    category: "Administrative",
    employer: {
      _id: "emp_008",
      companyName: "Psychology Research Lab",
      email: "research@psych.university.edu",
      contactNumber: "+1-555-0130",
    },
    status: "open",
    payRate: {
      amount: 20.0,
      rateType: "hourly",
    },
    timeSlots: [
      {
        date: "2025-07-25",
        startTime: "13:00",
        endTime: "17:00",
        peopleNeeded: 2,
        peopleAssigned: 1,
      },
      {
        date: "2025-07-26",
        startTime: "13:00",
        endTime: "17:00",
        peopleNeeded: 2,
        peopleAssigned: 0,
      },
    ],
    location: {
      address: "Psychology Building, Lab 301",
      city: "Toronto",
      postalCode: "M5S 1A1",
    },
    requirements: {
      skills: ["Data Analysis", "SPSS", "Research Methods", "Statistics"],
      experience: "Psychology coursework preferred",
      equipment: ["Laptop will be provided"],
      dressCode: "Business casual",
    },
    applicationDeadline: "2025-07-20T23:59:59.000Z",
    applicants: [
      {
        user: "user_009",
        status: "accepted",
        appliedAt: "2025-06-19T11:20:00.000Z",
        timeSlots: ["2025-07-25"],
        coverLetter:
          "I'm a psychology major with experience in SPSS and research methodology.",
      },
    ],
    createdAt: "2025-06-16T12:30:00.000Z",
    updatedAt: "2025-06-20T08:15:00.000Z",
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j9",
    title: "Pet Care Assistant - Veterinary Clinic",
    description:
      "Help care for animals at busy veterinary clinic. Duties include feeding, cleaning, and basic animal handling. Must love animals and not be squeamish around medical procedures.",
    category: "Other",
    employer: {
      _id: "emp_009",
      companyName: "Downtown Veterinary Clinic",
      email: "jobs@downtownvet.com",
      contactNumber: "+1-555-0131",
    },
    status: "open",
    payRate: {
      amount: 16.75,
      rateType: "hourly",
    },
    timeSlots: [
      {
        date: "2025-07-12",
        startTime: "08:00",
        endTime: "12:00",
        peopleNeeded: 2,
        peopleAssigned: 0,
      },
      {
        date: "2025-07-13",
        startTime: "08:00",
        endTime: "12:00",
        peopleNeeded: 2,
        peopleAssigned: 1,
      },
    ],
    location: {
      address: "456 Queen Street East",
      city: "Toronto",
      postalCode: "M5A 1T8",
    },
    requirements: {
      skills: ["Animal Handling", "Compassion", "Physical Fitness"],
      experience: "No experience required, training provided",
      equipment: ["Scrubs provided", "Comfortable shoes"],
      dressCode: "Scrubs (provided), closed-toe shoes",
    },
    applicationDeadline: "2025-07-08T23:59:59.000Z",
    applicants: [
      {
        user: "user_010",
        status: "pending",
        appliedAt: "2025-06-20T15:45:00.000Z",
        timeSlots: ["2025-07-13"],
        coverLetter:
          "I volunteer at the animal shelter and love working with animals.",
      },
    ],
    createdAt: "2025-06-19T14:20:00.000Z",
    updatedAt: "2025-06-20T16:30:00.000Z",
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0k0",
    title: "Tech Support Intern",
    description:
      "Provide technical support to students and staff. Help with computer troubleshooting, software installation, and basic IT maintenance. Great opportunity to gain IT experience!",
    category: "Administrative",
    employer: {
      _id: "emp_010",
      companyName: "IT Services Department",
      email: "it-jobs@university.edu",
      contactNumber: "+1-555-0132",
    },
    status: "draft",
    payRate: {
      amount: 18.0,
      rateType: "hourly",
    },
    timeSlots: [
      {
        date: "2025-08-01",
        startTime: "09:00",
        endTime: "17:00",
        peopleNeeded: 3,
        peopleAssigned: 0,
      },
      {
        date: "2025-08-02",
        startTime: "09:00",
        endTime: "17:00",
        peopleNeeded: 3,
        peopleAssigned: 0,
      },
    ],
    location: {
      address: "IT Services Building, Help Desk",
      city: "Toronto",
      postalCode: "M5S 1A1",
    },
    requirements: {
      skills: [
        "Computer Troubleshooting",
        "Customer Service",
        "Problem Solving",
      ],
      experience: "Basic IT knowledge required",
      equipment: ["Tools and software provided"],
      dressCode: "Business casual",
    },
    applicationDeadline: "2025-07-25T23:59:59.000Z",
    applicants: [],
    createdAt: "2025-06-20T10:00:00.000Z",
    updatedAt: "2025-06-20T10:00:00.000Z",
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0k1",
    title: "Photography Assistant - Graduation Ceremony",
    description:
      "Assist main photographer during graduation ceremonies. Help set up equipment, manage lighting, and coordinate with graduates for photos. Photography experience preferred.",
    category: "Event Staff",
    employer: {
      _id: "emp_011",
      companyName: "University Photography Services",
      email: "photo@university.edu",
      contactNumber: "+1-555-0133",
    },
    status: "in_progress",
    payRate: {
      amount: 22.0,
      rateType: "hourly",
    },
    timeSlots: [
      {
        date: "2025-06-22",
        startTime: "08:00",
        endTime: "18:00",
        peopleNeeded: 2,
        peopleAssigned: 2,
      },
    ],
    location: {
      address: "Convocation Hall, Main Campus",
      city: "Toronto",
      postalCode: "M5S 1A1",
    },
    requirements: {
      skills: ["Photography", "Equipment Handling", "Customer Service"],
      experience: "Photography experience preferred",
      equipment: ["Professional camera equipment provided"],
      dressCode: "All black attire, comfortable shoes",
    },
    applicationDeadline: "2025-06-18T23:59:59.000Z",
    applicants: [
      {
        user: "user_011",
        status: "accepted",
        appliedAt: "2025-06-15T09:30:00.000Z",
        timeSlots: ["2025-06-22"],
        coverLetter: "I have photography experience and my own equipment.",
      },
      {
        user: "user_012",
        status: "accepted",
        appliedAt: "2025-06-16T14:20:00.000Z",
        timeSlots: ["2025-06-22"],
        coverLetter: "Photography student with event experience.",
      },
    ],
    createdAt: "2025-06-14T11:45:00.000Z",
    updatedAt: "2025-06-20T13:22:00.000Z",
  },
];

/**
 * Simulate API delay for realistic frontend behavior
 */
const simulateApiDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Gigs API operations
 * All functions follow consistent patterns with proper error handling
 */
// In-memory dummy data store for frontend-only operations
let gigsData = [...DUMMY_GIGS];

export const gigsApi = {
  /**
   * Get all gigs - using dummy data only (frontend-only)
   */
  getAll: async (): Promise<ApiResponse<Gig[]>> => {
    await simulateApiDelay(500);

    const response = {
      success: true,
      data: gigsData,
      message: "Gigs loaded from frontend dummy data",
      count: gigsData.length,
      total: gigsData.length,
    };

    return response;
  },

  /**
   * Get gig by ID - using dummy data only (frontend-only)
   */
  getById: async (id: string): Promise<ApiResponse<Gig>> => {
    await simulateApiDelay(300);

    const gig = gigsData.find((g) => g._id === id);

    if (!gig) {
      throw new ApiError(`Gig with ID ${id} not found in dummy data`);
    }

    return {
      success: true,
      data: gig,
      message: "Gig retrieved from frontend dummy data",
    };
  },

  /**
   * Search gigs by category - using dummy data only (frontend-only)
   */
  getByCategory: async (category: string): Promise<ApiResponse<Gig[]>> => {
    await simulateApiDelay(400);

    const filteredGigs = gigsData.filter(
      (gig) => gig.category.toLowerCase() === category.toLowerCase()
    );

    return {
      success: true,
      data: filteredGigs,
      message: `Found ${filteredGigs.length} gigs in ${category} category`,
      count: filteredGigs.length,
      total: filteredGigs.length,
    };
  },

  /**
   * Search gigs by status - using dummy data only (frontend-only)
   */
  getByStatus: async (status: string): Promise<ApiResponse<Gig[]>> => {
    await simulateApiDelay(350);

    const filteredGigs = gigsData.filter((gig) => gig.status === status);

    return {
      success: true,
      data: filteredGigs,
      message: `Found ${filteredGigs.length} gigs with ${status} status`,
      count: filteredGigs.length,
      total: filteredGigs.length,
    };
  },

  /**
   * Search gigs by location - using dummy data only (frontend-only)
   */
  getByLocation: async (city: string): Promise<ApiResponse<Gig[]>> => {
    await simulateApiDelay(400);

    const filteredGigs = gigsData.filter(
      (gig) => gig.location.city.toLowerCase() === city.toLowerCase()
    );

    return {
      success: true,
      data: filteredGigs,
      message: `Found ${filteredGigs.length} gigs in ${city}`,
      count: filteredGigs.length,
      total: filteredGigs.length,
    };
  },

  /**
   * Update gig status - using dummy data only (frontend-only)
   */
  updateStatus: async (
    id: string,
    status: string
  ): Promise<ApiResponse<Gig>> => {
    await simulateApiDelay(400);

    const gigIndex = gigsData.findIndex((g) => g._id === id);

    if (gigIndex === -1) {
      throw new ApiError(`Gig with ID ${id} not found in dummy data`);
    }

    // Update the gig status
    gigsData[gigIndex] = {
      ...gigsData[gigIndex],
      status: status as Gig["status"],
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: gigsData[gigIndex],
      message: `Gig status updated to ${status} (frontend dummy data)`,
    };
  },

  /**
   * Create new gig - using dummy data only (frontend-only)
   */
  create: async (
    gigData: Omit<Gig, "_id" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<Gig>> => {
    await simulateApiDelay(600);

    const newGig: Gig = {
      ...gigData,
      _id: `dummy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    gigsData.unshift(newGig); // Add to beginning of array

    return {
      success: true,
      data: newGig,
      message: "Gig created successfully (frontend dummy data)",
    };
  },

  /**
   * Update gig data - using dummy data only (frontend-only)
   */
  update: async (id: string, data: Partial<Gig>): Promise<ApiResponse<Gig>> => {
    await simulateApiDelay(400);

    const gigIndex = gigsData.findIndex((g) => g._id === id);

    if (gigIndex === -1) {
      throw new ApiError(`Gig with ID ${id} not found in dummy data`);
    }

    // Update the gig with new data
    gigsData[gigIndex] = {
      ...gigsData[gigIndex],
      ...data,
      _id: id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: gigsData[gigIndex],
      message: "Gig updated successfully (frontend dummy data)",
    };
  },

  /**
   * Delete gig - using dummy data only (frontend-only)
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    await simulateApiDelay(300);

    const gigIndex = gigsData.findIndex((g) => g._id === id);

    if (gigIndex === -1) {
      throw new ApiError(`Gig with ID ${id} not found in dummy data`);
    }

    // Remove the gig from the array
    gigsData.splice(gigIndex, 1);

    return {
      success: true,
      message: "Gig deleted successfully (frontend dummy data)",
    };
  },

  /**
   * Apply to gig - using dummy data only (frontend-only)
   */
  applyToGig: async (
    gigId: string,
    applicationData: { timeSlots: string[]; coverLetter?: string }
  ): Promise<ApiResponse<Gig>> => {
    await simulateApiDelay(500);

    const gigIndex = gigsData.findIndex((g) => g._id === gigId);

    if (gigIndex === -1) {
      throw new ApiError(`Gig with ID ${gigId} not found in dummy data`);
    }

    const newApplication = {
      user: `user_${Date.now()}`,
      status: "pending" as const,
      appliedAt: new Date().toISOString(),
      timeSlots: applicationData.timeSlots,
      coverLetter: applicationData.coverLetter,
    };

    gigsData[gigIndex] = {
      ...gigsData[gigIndex],
      applicants: [...gigsData[gigIndex].applicants, newApplication],
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: gigsData[gigIndex],
      message: "Application submitted successfully (frontend dummy data)",
    };
  },

  /**
   * Get user's applications - using dummy data only (frontend-only)
   */
  getUserApplications: async (
    userId: string = "current_user"
  ): Promise<ApiResponse<Gig[]>> => {
    await simulateApiDelay(400);

    // For demo purposes, return gigs where user has applied
    const appliedGigs = gigsData.filter((gig) =>
      gig.applicants.some((app) => app.user === userId)
    );

    return {
      success: true,
      data: appliedGigs,
      message: `Found ${appliedGigs.length} applications (frontend dummy data)`,
      count: appliedGigs.length,
      total: appliedGigs.length,
    };
  },

  /**
   * Approve gig - using dummy data only (frontend-only)
   */
  approve: async (id: string): Promise<ApiResponse<Gig>> => {
    return gigsApi.updateStatus(id, "open");
  },

  /**
   * Reject gig - using dummy data only (frontend-only)
   */
  reject: async (id: string): Promise<ApiResponse<Gig>> => {
    return gigsApi.updateStatus(id, "cancelled");
  },

  /**
   * Reset dummy data to original state (frontend-only utility)
   */
  resetDummyData: async (): Promise<ApiResponse<void>> => {
    await simulateApiDelay(200);

    gigsData = [...DUMMY_GIGS];

    return {
      success: true,
      message: "Dummy data reset to original state",
    };
  },
};

export default gigsApi;
