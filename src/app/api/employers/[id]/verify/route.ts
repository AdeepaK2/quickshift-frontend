import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`Local API: PATCH /api/employers/${id}/verify called`);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    return NextResponse.json({
      success: true,
      data: { _id: id, verified: true, isVerified: true },
      message: `Employer ${id} verified successfully (local API)`,
    });
  } catch (error) {
    console.error("Local employer verify API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify employer",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
