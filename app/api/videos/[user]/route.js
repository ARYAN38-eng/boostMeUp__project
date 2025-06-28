import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req, context) {
  const username = context.params.user;

  if (!username) {
    return NextResponse.json({ error: "Username not provided" }, { status: 400 });
  }

  try {
    const result = await cloudinary.search
      .expression(`folder:boostMeUp/${username} AND resource_type:video`)
      .sort_by("created_at", "desc")
      .execute();

    const files = result?.resources?.map((file) => ({
      url: file.secure_url,
      name: file.original_filename,
      createdAt:file.created_at,
    })) || [];

    return NextResponse.json({ files}, { status: 200 });
  } catch (err) {
    console.error("Cloudinary fetch failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
