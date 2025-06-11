import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`Local API: PATCH /api/employers/${id}/suspend called`);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    return NextResponse.json({
      success: true,
      data: { _id: id, verified: false, isVerified: false, suspended: true },
      message: `Employer ${id} suspended successfully (local API)`,
    });
  } catch (error) {
    console.error("Local employer suspend API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to suspend employer",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
