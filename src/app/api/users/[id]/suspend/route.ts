import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Mock successful suspension
    return NextResponse.json({
      success: true,
      message: `User ${id} suspended successfully`,
      data: {
        id,
        status: "suspended",
        verified: false,
        suspendedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error suspending user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to suspend user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
