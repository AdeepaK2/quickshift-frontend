import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Mock successful verification
    return NextResponse.json({
      success: true,
      message: `User ${id} verified successfully`,
      data: {
        id,
        status: "active",
        verified: true,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error verifying user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
