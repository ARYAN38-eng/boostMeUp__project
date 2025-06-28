import { NextResponse } from "next/server";
import connectDb from "@/db/connectDb";
import Video from "@/models/videos"; // ✅ Import the model
import https from "https";

export async function GET(req, { params }) {
  const range = req.headers.get("range");
  if (!range) {
    return new NextResponse("Range header required", { status: 400 });
  }

  const videoID = params.id;

  try {
    await connectDb(); 
    const video = await Video.findById(videoID); 

    if (!video || !video.videoUrl) {
      return new NextResponse("Video not found", { status: 404 });
    }

    const videoUrl = video.videoUrl;

    return new Promise((resolve) => {
      https.get(videoUrl, (cloudRes) => {
        const headers = {
          "Content-Range": cloudRes.headers["content-range"] || range,
          "Accept-Ranges": "bytes",
          "Content-Length": cloudRes.headers["content-length"],
          "Content-Type": "video/mp4",
        };
        resolve(
          new NextResponse(cloudRes, {
            status: 206,
            headers,
          })
        );
      });
    });
  } catch (err) {
    console.error("Streaming error", err);
    return new NextResponse("Error streaming video", { status: 500 });
  }
}
