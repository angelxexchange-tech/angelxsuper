import dbConnect from '@/lib/db';
import Settings from '@/lib/models/Settings';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        rate: 102, withdrawMin: 50, depositMin: 100 
      });
    }

    return NextResponse.json({ settings });
  } catch (err) {
    console.error('Error fetching settings:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
