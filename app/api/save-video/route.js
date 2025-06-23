// /app/api/save-video/route.js
import { NextResponse } from 'next/server';
import connectDb from "@/db/connectDb"
import Video from '@/models/video';     

export async function POST(req) {
  try {
    const body = await req.json();
    const { url, username } = body;

    if (!url || !username) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    await connectDb();

    const newVideo = new Video({
      creator: username,
      videoUrl: url,
      uploadedAt: new Date(),
    });

    await newVideo.save();

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('Error saving video:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
