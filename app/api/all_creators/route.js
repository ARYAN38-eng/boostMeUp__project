// app/api/creators/route.js
import connectDb from "@/db/connectDb";
import User from "@/models/User";
import { getToken } from "next-auth/jwt";

export async function GET(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  await connectDb();

  try {
    const all_creators = await User.find({ creator: true });
    return Response.json(all_creators, { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to fetch creators" }), {
      status: 500,
    });
  }
}
