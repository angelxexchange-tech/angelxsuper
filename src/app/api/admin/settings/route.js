import dbConnect from '@/lib/db';
import Settings from '@/lib/models/Settings';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

function getAdminFromCookie(req) {
  try {
    const token = req.cookies.get('adminToken')?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(req) {
  try {
    const admin = getAdminFromCookie(req);
    if (!admin) {
      console.error('Admin auth failed - no token or invalid token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        rate: 102, 
        withdrawMin: 50, 
        depositMin: 100,
        trc20Address: "TU7f7jwJr56owuutyzbJEwVqF3ii4KCiPV",
        erc20Address: "0x78845f99b319b48393fbcde7d32fcb7ccd6661bf",
        trc20QrUrl: "images/trc20.png",
        erc20QrUrl: "images/erc20.png"
      });
    }

    return NextResponse.json({ settings });
  } catch (err) {
    console.error('Admin get settings error:', err.message || err);
    return NextResponse.json({ error: 'Server error: ' + (err.message || 'Unknown') }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const admin = getAdminFromCookie(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { 
      rate, depositMin, withdrawMin,
      trc20Address, erc20Address,
      trc20QrUrl, erc20QrUrl
    } = body;

    console.log('Received POST payload:', body);

    // basic validation
    const r = parseFloat(rate);
    const d = parseFloat(depositMin);
    const w = parseFloat(withdrawMin);

    if (Number.isNaN(r) || Number.isNaN(d) || Number.isNaN(w)) {
      return NextResponse.json({ error: 'Invalid values' }, { status: 400 });
    }

    // Validate crypto addresses are not empty
    if (!trc20Address || !erc20Address) {
      return NextResponse.json({ error: 'Crypto addresses cannot be empty' }, { status: 400 });
    }

    await dbConnect();
    const current = await Settings.findOne();
    
    // Prepare safe data - convert all to strings and handle empty values
    const updateData = {
      rate: r,
      depositMin: d,
      withdrawMin: w,
      trc20Address: String(trc20Address || "").trim() || "TU7f7jwJr56owuutyzbJEwVqF3ii4KCiPV",
      erc20Address: String(erc20Address || "").trim() || "0x78845f99b319b48393fbcde7d32fcb7ccd6661bf",
      trc20QrUrl: String(trc20QrUrl || "images/trc20.png").trim(),
      erc20QrUrl: String(erc20QrUrl || "images/erc20.png").trim()
    };

    console.log('Sending to Mongoose:', updateData);

    if (current) {
      const updated = await Settings.findByIdAndUpdate(current._id, updateData, { new: true });
      console.log('Settings updated successfully:', updated._id);
      return NextResponse.json({ settings: updated });
    } else {
      const created = await Settings.create(updateData);
      console.log('Settings created successfully:', created._id);
      return NextResponse.json({ settings: created });
    }
  } catch (err) {
    console.error('Admin set settings error:', err.message || err);
    return NextResponse.json({ error: 'Server error: ' + (err.message || 'Unknown') }, { status: 500 });
  }
}
