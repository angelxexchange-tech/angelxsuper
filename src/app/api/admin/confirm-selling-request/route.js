// POST /api/admin/confirm-selling-request
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Transaction from "@/lib/models/Transaction";
import Wallet from "@/lib/models/Wallet";
import { verifyAdminCookie } from "@/lib/adminAuth";

export async function POST(req) {
  try {
    // admin guard
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

    const wallet = await Wallet.findOneAndUpdate(
      { userId: tx.userId },
      {
        $inc: {
          usdtAvailable: -tx.amount,
          usdtWithdrawn: tx.amount,
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    tx.status = "SUCCESS";
    await tx.save();

    return NextResponse.json({ success: true, wallet });
  } catch (err) {
    console.error("Error confirming selling request:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
