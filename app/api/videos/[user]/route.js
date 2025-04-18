import fs from "fs";
import path from "node:path";
import { NextResponse } from "next/server";
import {getToken} from "next-auth/jwt"
export async function GET(req, { params }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
  const user = params.user;

  if (!user) {
    return NextResponse.json({ error: "User not specified" }, { status: 400 });
  }

  const dirPath = path.join(process.cwd(), "public", "uploads", user);

  if (!fs.existsSync(dirPath)) {
    return NextResponse.json({ files: [] }, { status: 200 });
  }

  const files = fs
    .readdirSync(dirPath)
    .map((filename) => `/uploads/${user}/${filename}`);

  return NextResponse.json({ files }, { status: 200 });
}
