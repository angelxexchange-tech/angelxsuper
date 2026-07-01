// GET /api/admin/pending-selling-requests
import dbConnect from "@/lib/db";
import Transaction from "@/lib/models/Transaction";
import User from "@/lib/models/User";
import { NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/adminAuth";

export async function GET(req) {
  try {
    const admin = verifyAdminCookie(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const requests = await Transaction.find({ status: "PENDING", type: "SELL" })
      .populate({
        path: 'userId',
        select: 'email fullName'
      })
      .sort({ createdAt: -1 })
      .lean();

    // Map `userId` to `user` to keep API response format consistent with Prisma
    const formattedRequests = requests.map(r => {
      const { userId, ...rest } = r;
      // map _id to id in populated user
      if (userId && userId._id) {
          userId.id = userId._id;
      }
      return { ...rest, user: userId };
    });

    return NextResponse.json({ requests: formattedRequests });
  } catch (err) {
    console.error("Error fetching pending selling requests:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
