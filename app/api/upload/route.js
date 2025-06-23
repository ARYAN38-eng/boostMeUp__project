import formidable from "formidable";
import { Readable } from "stream";
import { getToken } from "next-auth/jwt";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const dynamic = "force-dynamic";

export async function POST(request) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const contentType = request.headers.get("content-type") || "";
  const creator = request.headers.get("x-creator-name");

  if (!contentType.startsWith("multipart/form-data") || !creator) {
    return NextResponse.json(
      { error: "Invalid request" },
      {
        status: 400,
      }
    );
  }

  const form = formidable({
    multiples: true,
  });

  // Convert the request body into a Node-style readable stream
  const reader = request.body.getReader();
  const stream = new Readable({
    async read() {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          this.push(null);
          break;
        }
        this.push(Buffer.from(value));
      }
    },
  });

  stream.headers = {
    "content-type": contentType,
    "content-length": request.headers.get("content-length") || "0",
  };

  return new Promise((resolve, reject) => {
    form.parse(stream, async (err, fields, files) => {
      if (err) {
        console.error("Formidable error:", err);
        return reject(
          NextResponse.json(
            { error: "Upload failed" },
            {
              status: 500,
            }
          )
        );
      }

      try {
        const uploadedFiles = [];
        const fileArray = Array.isArray(files.file) ? files.file : [files.file];
        for (const file of fileArray) {
          const result = await cloudinary.uploader.upload(file.filepath, {
            resource_type: "video",
            folder: `boostMeUp/${creator}`,
          });
          uploadedFiles.push(result.secure_url);
        }

        resolve(
          NextResponse.json(
            { success: true, files: uploadedFiles },
            { status: 200 }
          )
        );
      } catch (uploadError) {
        console.error("Cloudinary upload error: ", uploadError);
        reject(
          NextResponse.json(
            { error: "Cloudinary upload failed" },
            { status: 500 }
          )
        );
      }
    });
  });
}
