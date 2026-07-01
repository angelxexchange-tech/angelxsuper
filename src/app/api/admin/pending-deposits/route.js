import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Transaction from "@/lib/models/Transaction";
import User from "@/lib/models/User"; // import to allow populate to work
import { verifyAdminCookie } from "@/lib/adminAuth";

export async function GET(req) {
  try {
    const admin = verifyAdminCookie(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const deposits = await Transaction.find({ status: "PENDING", type: "DEPOSIT" })
      .populate('userId') // include user details
      .sort({ createdAt: -1 })
      .lean();

    // Map `userId` to `user` to keep API response format consistent with Prisma
    const formattedDeposits = deposits.map(d => {
      const { userId, ...rest } = d;
      return { ...rest, user: userId };
    });

    return NextResponse.json({ deposits: formattedDeposits });
  } catch (err) {
    console.error("Fetch deposits error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
