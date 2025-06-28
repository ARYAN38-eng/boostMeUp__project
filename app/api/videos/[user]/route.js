import { NextResponse } from "next/server";
import { connectDb } from "@/db/connectDb"; 
import Video from "@/models/videos"; 

export async function GET(req, context) {
  const username = context.params.user;

  if (!username) {
    return NextResponse.json({ error: "Username not provided" }, { status: 400 });
  }

  try {
    await connectDb();

    const videos = await Video.find({ username }).sort({ createdAt: -1 });

    const files = videos.map((video) => ({
      url: video.videoUrl,
      name: video.name,
      createdAt: video.uploadedAt,
    }));

    return NextResponse.json({ files }, { status: 200 });
  } catch (err) {
    console.error("MongoDB fetch failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
