"use client";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [xhrInstance, setXhrInstance] = useState(null);
  const [isFileSelected, setIsFileSelected] = useState(false);
  const router = useRouter();

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFile(files);
    setIsFileSelected(files.length > 0);
  };

  const loadVideos = async () => {
    try {
      const res = await fetch(
        `https://boost-me-up-project.vercel.app/api/videos/${username}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (res.ok) {
        setUploadedVideos(data.files || []);
      } else {
        console.error("Error loading videos:", data.error);
      }
    } catch (err) {
      console.error("Failed to fetch videos:", err);
      setUploadedVideos([]);
    }
  };

    const formatFileSize = (bytes) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    } else if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    } else if (bytes >= 1024) {
      return (bytes / 1024).toFixed(2) + " KB";
    } else {
      return bytes + " bytes";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || selectedFile.length === 0) {
      toast.warn("Please select a video first!");
      return;
    }


    const file = selectedFile[0];
    if (file.size > 100 * 1024 * 1024) {
      toast.warn(`Your video is ${formatFileSize(file.size)} and exceeds the 100MB limit.`);
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    );
    formData.append("folder", `boostMeUp/${username}`);

    const xhr = new XMLHttpRequest();
    setXhrInstance(xhr);
    setIsUploading(true);
    setUploadProgress(0);
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`
    );

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(percent);
      }
    });

    xhr.onload = async () => {
      setIsUploading(false);
      setUploadProgress(0);
      setXhrInstance(null);
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        console.log("Uploaded to Cloudinary:", data.secure_url);
        setUploadedVideos((prev) => [...prev, data.secure_url]);
        setSelectedFile(null);

        await fetch("/api/save-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: data.secure_url,username: username, name:selectedFile[0].name,fileSize:formatFileSize(file.size)}),
        });
      } else {
        console.error("Cloudinary error:", xhr.responseText);
      }
    };

    xhr.onerror = () => {
      console.error("Upload failed.");
      setIsUploading(false);
      setUploadProgress(0);
      setXhrInstance(null);
    };

    xhr.send(formData);
    setIsFileSelected(false);
  };
  const handleCancelUpload = () => {
    if (xhrInstance) {
      xhrInstance.abort();
      setIsUploading(false);
      setUploadProgress(0);
      setXhrInstance(null);
      setSelectedFile(null);
      setIsFileSelected(false);
      toast.warn("Upload cancelled.");
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
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <div className="cover w-full bg-red-50 relative">
        <Image
          className="object-cover w-full h-48 md:h-[350px] shadow-blue-700 shadow-sm"
          src={currentUser.coverpic?.trim() || "/default-cover.png"}
          width={1920}
          height={350}
          alt="Cover Image"
        />
        <div className="absolute -bottom-20 right-[33%] md:right-[46%] border-white overflow-hidden border-2 rounded-full size-36">
          <Image
            className="rounded-full object-cover size-36"
            width={128}
            height={128}
            src={currentUser.profilepic?.trim() || "/default-profile.jpg"}
            alt="Profile Image"
          />
        </div>
      </div>

      <div className="info flex justify-center items-center my-24 mb-32 flex-col gap-2">
        <div className="font-bold text-lg">@{username}</div>
        <div className="text-slate-400">{`Let's help ${username} get a chai!`}</div>
        {Allpayments?.length ? (
          <div className="text-slate-400">
            {Allpayments.length} Payments • ₹
            {Allpayments.reduce((a, b) => a + b.amount, 0)} raised
          </div>
        ) : (
          <div className="text-slate-400">Loading payment data...</div>
        )}

        <div className="payment flex gap-3 w-[80%] mt-11 flex-col md:flex-row">
          <div className="supporters w-full md:w-1/2 bg-slate-900 rounded-lg text-white px-2 md:p-10">
            <h2 className="text-2xl font-bold my-5">Top 10 Supporters</h2>
            <ul className="mx-5 text-lg">
              {payments.length === 0 && <li>No payments yet</li>}
              {payments.map((p, i) => (
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
              ))}
            </ul>
          </div>

          <div className="bg-white shadow-2xl sm:w-96 sm:h-96 mx-auto rounded-xl p-4 flex flex-col items-center gap-3">
            <h1 className="text-black font-semibold text-xl text-center mb-3">
              Upload Your New Content Here
            </h1>
            <label className="border-dashed border-2 border-blue-800 flex justify-center h-48 w-64 mx-auto items-center cursor-pointer relative">
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
            {selectedFile && selectedFile.length > 0 && (
              <p className="text-black">Video Name: {selectedFile[0].name}</p>
            )}{" "}
            {uploadProgress > 0 && (
              <div className="w-64">
                <div className="bg-gray-300 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-600 h-3 transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-center text-xs text-blue-700 mt-1">
                  {uploadProgress}%
                </p>
              </div>
            )}
            <div className="flex gap-3 w-full px-4">
              <button
                onClick={handleUpload}
                disabled={!selectedFile}
                className="bg-blue-600 w-full text-white px-4 py-4 mt-6 rounded-md hover:bg-blue-700"
              >
                Upload Video
              </button>
              {isUploading && (
                <button
                  onClick={handleCancelUpload}
                  className="bg-red-500 text-white px-4 py-4 mt-6 rounded-md hover:bg-red-600"
                >
                  Cancel
                </button>
              )}
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
              className="video-container bg-slate-900 p-10 rounded-lg shadow-lg w-[50%] mx-auto"
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
