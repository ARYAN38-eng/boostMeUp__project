// app/api/creators/route.js
import connectDb from "@/db/connectDb";
import User from "@/models/User";
import Stats from "@/models/user_stats"
import {getToken} from "next-auth/jwt"
export async function GET(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }
  await connectDb();

  try {
    const views = await Stats.find({views: {$gt: 1000}},{username: 1 , _id: 0}).sort({views: -1});
    const creators = await User.find({creator:true});
    const highViewUsernames = new Set(views.map(v => v.username));

// Filter creators whose username exists in the highViewUsernames set
    const topCreators = creators.filter(creator => highViewUsernames.has(creator.username));
    return Response.json(topCreators, {status:200}); 
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to fetch creators" }), {
      status: 500,
    });
  }
}
