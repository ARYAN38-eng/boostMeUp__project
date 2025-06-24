import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req, { params }) {
  const username = params.user;

  try {
    const result = await cloudinary.search
      .expression(`folder:boostMeUp/${username} AND resource_type:video`)
      .sort_by("created_at", "desc")
      .max_results(20)
      .execute();

    const urls = result.resources.map((file) => file.secure_url);

    return NextResponse.json({ files: urls }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
