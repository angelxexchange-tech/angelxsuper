import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Admin from "@/lib/models/Admin";
import { verifyAdminCookie } from "@/lib/adminAuth";
import bcrypt from "bcryptjs";

export async function GET(req) {
  try {
    const admin = verifyAdminCookie(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const record = await Admin.findOne({ email: admin.email });
    if (!record) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

    return NextResponse.json({ success: true, admin: { email: record.email, id: record._id } });
  } catch (err) {
    console.error("Error fetching admin profile:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const admin = verifyAdminCookie(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { currentPassword, newPassword, newEmail } = body || {};

    if (!currentPassword) {
      return NextResponse.json({ error: "Current password is required" }, { status: 400 });
    }

    await dbConnect();
    const record = await Admin.findOne({ email: admin.email });
    if (!record) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

    const valid = await bcrypt.compare(currentPassword, record.password);
    if (!valid) return NextResponse.json({ error: "Invalid current password" }, { status: 401 });

    const updateData = {};
    if (newPassword) {
      if (newPassword.length < 8) return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
      updateData.password = await bcrypt.hash(newPassword, 10);
    }
    if (newEmail) {
      updateData.email = newEmail.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const updated = await Admin.findByIdAndUpdate(record._id, updateData, { new: true });

    const changedEmail = updated.email !== record.email;

    return NextResponse.json({ success: true, admin: { email: updated.email }, emailChanged: changedEmail });
  } catch (err) {
    console.error("Error updating admin profile:", err);
    // MongoDB duplicate key error code is 11000
    if (err?.code === 11000) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
