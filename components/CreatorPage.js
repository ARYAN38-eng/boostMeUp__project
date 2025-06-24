"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  fetchuser,
  fetchpayments,
  fetch_all_payments,
} from "@/actions/useractions";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const CreatorPage = ({ username }) => {
  const [currentUser, setcurrentUser] = useState({});
  const [payments, setPayments] = useState([]);
  const [Allpayments, setAllPayments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [UploadedVideos, setUploadedVideos] = useState([]);
  const router = useRouter();

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFile(files);
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
    }, 1500);
  };

  const loadVideos = async () => {
    try {
      const res = await fetch(
        `https://boost-me-up-project.vercel.app/api/videos/${username}`,
        {
          cache: "no-store",
        }
      );
      const data = await res.json();
      if (res.ok) {
        setUploadedVideos(data.files || []);
      } else {
        console.error("Error loading videos:", data.error);
      }
    } catch (err) {
      console.error("Failed to fetch videos:", err);
      setUploadedVideos([]); // fallback
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || selectedFile.length === 0) {
      alert("Please select a video first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile[0]);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    );
    formData.append("folder", `boostMeUp/${username}`);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (res.ok) {
        console.log("Uploaded to Cloudinary:", data.secure_url);
        setSelectedFile(null);
        setUploadedVideos((prev) => [...prev, data.secure_url]);
        await fetch("/api/save-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: data.secure_url, username }),
        });
      } else {
        console.error("Cloudinary error:", data.error);
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  useEffect(() => {
    getData();
    loadVideos();
  }, []);

  const getData = async () => {
    let u = await fetchuser(username);
    setcurrentUser(u);
    let dbpayments = await fetchpayments(username);
    setPayments(dbpayments);
    let db_all_payments = await fetch_all_payments(username);
    setAllPayments(db_all_payments);
  };

  const { data: session } = useSession();
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (!session) {
      const interval = setInterval(() => {
        setCount((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
    return () => {};
  }, [session]);

  useEffect(() => {
    if (!session && count < 1) {
      router.push("/login");
    }
  }, [count, session, router]);

  if (!session) {
    return (
      <div className="text-center">
        <p>You are not logged in. Please log in first.</p>
        <p>Redirecting in {count} seconds...</p>
      </div>
    );
  }

  return (
    <>
      <div className="cover w-full bg-red-50 relative">
        {currentUser.coverpic ? (
          <Image
            className="object-cover w-full h-48 md:h-[350px] shadow-blue-700 shadow-sm"
            src={currentUser.coverpic?.trim()}
            width={1920} // Provide reasonable default
            height={350}
            alt="Cover Image"
          />
        ) : (
          <div className="bg-gray-300 w-full h-48 md:h-[350px]"></div>
        )}
        <div className="absolute -bottom-20 right-[33%] md:right-[46%] border-white overflow-hidden border-2 rounded-full size-36">
          <Image
            className="rounded-full object-cover size-36"
            width={128}
            height={128}
            src={currentUser.profilepic?.trim() || null}
            alt=""
          />
        </div>
      </div>
      <div className="info flex justify-center items-center my-24 mb-32 flex-col gap-2">
        <div className="font-bold text-lg">@{username}</div>
        <div className="text-slate-400">Lets help {username} get a chai!</div>
        {Allpayments?.length ? (
          <div className="text-slate-400">
            {Allpayments.length} Payments . ₹
            {Allpayments.reduce((a, b) => a + b.amount, 0)} raised
          </div>
        ) : (
          <div className="text-slate-400">Loading payment data...</div>
        )}

        <div className="payment flex gap-3 w-[80%] mt-11 flex-col md:flex-row">
          <div className="supporters w-full md:w-1/2 bg-slate-900 rounded-lg text-white px-2 md:p-10">
            {/* Show list of all the supporters as a leaderboard  */}
            <h2 className="text-2xl font-bold my-5"> Top 10 Supporters</h2>
            <ul className="mx-5 text-lg">
              {payments.length == 0 && <li>No payments yet</li>}
              {payments.map((p, i) => {
                return (
                  <li key={i} className="my-4 flex gap-2 items-center">
                    <Image
                      width={33}
                      height={33}
                      src="/avatar.gif"
                      alt="user avatar"
                    />
                    <span>
                      {`${i + 1}. `}
                      {p.name} donated{" "}
                      <span className="font-bold">₹{p.amount}</span> with a
                      message &quot;{p.message}&quot;
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="bg-white shadow-2xl w-96 h-80 mx-auto rounded-xl">
            <div className="flex justify-center mt-5">
              <h1 className="text-black font-semibold text-xl">
                Upload Your New Content Here
              </h1>
            </div>
            <div className="flex justify-center mt-5">
              <label className="border-dashed border-2 border-blue-800 flex justify-center h-48 w-64 items-center cursor-pointer relative ">
                <input
                  className="absolute h-full w-full opacity-0 cursor-pointer"
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleFileChange}
                />
                <motion.img
                  width={80}
                  height={80}
                  className="mb-2"
                  src="/upload.png"
                  alt="upload icon"
                  animate={isUploading ? { rotate: 360 } : {}}
                  transition={{
                    duration: 1,
                    ease: "easeInOut",
                    repeat: isUploading ? Infinity : 0,
                  }}
                  whileHover={{ scale: 1.1 }}
                />
              </label>
            </div>
            <div className="flex jusitfy-center  mt-20">
              <button
                onClick={handleUpload}
                disabled={!selectedFile}
                className="bg-blue-600 w-full text-white px-4 py-4 rounded-md hover:bg-blue-700"
              >
                Upload Video
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="uploaded-videos my-10">
        <h2 className="text-5xl font-semibold text-center mb-10">
          Uploaded Videos
        </h2>
        {UploadedVideos.length === 0 && (
          <p className="text-center text-gray-500">No videos uploaded yet.</p>
        )}
        <div className="flex-col place-items-center max-h-150 space-y-5 overflow-y-auto ">
          {UploadedVideos.map((video, index) => (
            <div
              key={index}
              className="video-container bg-slate-900  p-10 rounded-lg shadow-lg w-[50%]"
            >
              <video controls className="rounded-lg w-full">
                <source src={video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CreatorPage;
