// POST /api/admin/reject-selling-request
import dbConnect from "@/lib/db";
import Transaction from "@/lib/models/Transaction";
import { NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/adminAuth";

export async function POST(req) {
  try {
    const admin = verifyAdminCookie(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { transactionId } = await req.json();
    if (!transactionId) {
      return NextResponse.json({ error: "Missing transactionId" }, { status: 400 });
    }

    await dbConnect();
    const tx = await Transaction.findById(transactionId);
    if (!tx || tx.status !== "PENDING") {
      return NextResponse.json({ error: "Transaction not found or already processed" }, { status: 404 });
    }

    tx.status = "FAILED";
    await tx.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error rejecting selling request:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
