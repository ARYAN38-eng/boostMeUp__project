// /app/api/save-video/route.js
import { NextResponse } from 'next/server';
import connectDb from "@/db/connectDb"
import Video from '@/models/videos';     

export async function POST(req) {
  try {
    const body = await req.json();
    const { url, username,name,fileSize } = body;

    if (!url || !username) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    await connectDb();

    const newVideo = new Video({
      creator: username,
      name: name,
      fileSize:fileSize,
      videoUrl: url,
      uploadedAt: new Date().toISOString(),
    });

    await newVideo.save();

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('Error saving video:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
