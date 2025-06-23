"use client";
import React, { useEffect, useState } from "react";
import Script from "next/script";
import { useSession } from "next-auth/react";
import {
  fetchuser,
  fetchpayments,
  fetch_all_payments,
  initiate,
} from "@/actions/useractions";
import { useSearchParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Bounce } from "react-toastify";
import { useRouter } from "next/navigation";
import Image from "next/image";

const PaymentPage = ({ username, creators }) => {
  const [paymentform, setPaymentform] = useState({
    name: "",
    message: "",
    amount: "",
  });
  const [currentUser, setcurrentUser] = useState({});
  const [creatordb, setcreatordb] = useState({});
  const [payments, setPayments] = useState([]);
  const [Allpayments, setAllPayments] = useState([]);
  const [SearchedVideos, setSearchedVideos] = useState([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [hasPaid, setHasPaid] = useState(false);

  useEffect(() => {
    if (searchParams.get("paymentdone") == "true") {
      toast("Thanks for your donation!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
    setTimeout(()=>{
      router.replace(`/Member/${username}/${creators}`);
    },2000)
    
  }, []);

  const handleChange = (e) => {
    setPaymentform({ ...paymentform, [e.target.name]: e.target.value });
  };

  const getData = async () => {
    let u = await fetchuser(username);
    setcurrentUser(u);
    let dbpayments = await fetchpayments(creators);
    setPayments(dbpayments);
    let db_all_payments = await fetch_all_payments(creators);
    setAllPayments(db_all_payments);
    const creatorUsername = creators;
    const hasPaidForThisCreator = db_all_payments.some(
      (payment) => payment.to_user === creatorUsername && payment.from_user === username
    );

    setHasPaid(hasPaidForThisCreator);
  };

  useEffect(() => {
    getData();
    userdata();
  }, []);

  const pay = async (amount) => {
    // Get the order Id
    let a = await initiate(amount, username, creators, paymentform);
    let orderId = a.id;
    var options = {
      key: currentUser.razorpayid, 
      amount: amount, 
      currency: "INR",
      name: "BoostMeUp!", 
      description: "Test Transaction",
      image: "https://example.com/your_logo",
      order_id: orderId, 
      callback_url: `${process.env.NEXT_PUBLIC_URL}/api/razorpay`,
      prefill: {
        name: "Gaurav Kumar", 
        email: "gaurav.kumar@example.com",
        contact: "9000090000", 
      },
      notes: {
        address: "Razorpay Corporate Office",
      },
      theme: {
        color: "#3399cc",
      },
    };

    var rzp1 = new Razorpay(options);
    rzp1.open();
  };
  let creator = { username: creators };

  useEffect(() => {
    const loadVideos = async () => {
      const res = await fetch(`https://boost-me-up-project.vercel.app/api/videos/${creators}`, {
        cache: "no-store",
      });
      const data = await res.json();
      setSearchedVideos(data.files);
    };
    if (creators) loadVideos();
  }, [creators]);

  const userdata = async () => {
    const data = await fetch("https://boost-me-up-project.vercel.app/api/all_creators", {
      cache: "no-store",
    });
    const allCreators = await data.json();
    const matchedCreators = allCreators.find(
      (creator) => creator.username === creators
    );
    setcreatordb(matchedCreators);
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
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {/* Same as */}
      <ToastContainer />
      <Script src="https://checkout.razorpay.com/v1/checkout.js"></Script>

      <div className="cover w-full bg-red-50 relative">
        <Image height={192}
          className="object-cover w-full h-48 md:h-[350px] shadow-blue-700 shadow-sm"
          src={
            creatordb && creatordb.coverpic && creatordb.coverpic !== ""
              ? creatordb.coverpic?.trim()
              : null
          }
          alt=""
        />
        <div className="absolute -bottom-20 right-[33%] md:right-[46%] border-white overflow-hidden border-2 rounded-full size-36">
          <Image
            className="rounded-full object-cover size-36"
            width={128}
            height={128}
            src={
              creatordb && creatordb.profilepic && creatordb.profilepic !== null
                ? creatordb.profilepic?.trim()
                : null
            }
            alt=""
          />
        </div>
      </div>
      <div className="info flex justify-center items-center my-24 mb-32 flex-col gap-2">
        <div className="font-bold text-lg">@{creators}</div>
        <div className="text-slate-400">Lets help {creators} get a butter!</div>
        <div className="text-slate-400">
          {Allpayments.length} Payments . ₹
          {Allpayments.reduce((a, b) => a + b.amount, 0)} raised
        </div>

        <div className="payment flex gap-3 w-[80%] mt-11 flex-col md:flex-row">
          <div className="supporters w-full md:w-1/2 bg-slate-900 rounded-lg text-white px-2 md:p-10">
            {/* Show list of all the supporters as a leaderboard  */}
            <h2 className="text-2xl font-bold my-5"> Top 10 Supporters</h2>
            <ul className="mx-5 text-lg">
              {payments.length == 0 && <li>No payments yet</li>}
              {payments.map((p, i) => {
                return (
                  <li key={i} className="my-4 flex gap-2 items-center">
                    <Image width={33} height={33} src="/avatar.gif" alt="useravatar" />
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

          <div className="makePayment w-full md:w-1/2 bg-slate-900 rounded-lg text-white px-2 md:p-10">
            <h2 className="text-2xl font-bold my-5">Make a Payment</h2>
            <div className="flex gap-2 flex-col">
              {/* input for name and message   */}
              <div>
                <input
                  onChange={handleChange}
                  value={paymentform.name}
                  name="name"
                  type="text"
                  className="w-full p-3 rounded-lg bg-slate-800"
                  placeholder="Enter Name"
                />
              </div>
              <input
                onChange={handleChange}
                value={paymentform.message}
                name="message"
                type="text"
                className="w-full p-3 rounded-lg bg-slate-800"
                placeholder="Enter Message"
              />

              <input
                onChange={handleChange}
                value={paymentform.amount}
                name="amount"
                type="text"
                className="w-full p-3 rounded-lg bg-slate-800"
                placeholder="Enter Amount"
              />

              <button
                onClick={() => pay(Number.parseInt(paymentform.amount) * 100)}
                type="button"
                className="text-white bg-gradient-to-br from-purple-900 to-blue-900 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 disabled:bg-slate-600 disabled:from-purple-100"
                disabled={
                  paymentform.name?.length < 3 ||
                  paymentform.message?.length < 4 ||
                  paymentform.amount?.length < 1
                }
              >
                Pay
              </button>
            </div>
            {/* Or choose from these amounts  */}
            <div className="flex flex-col md:flex-row gap-2 mt-5">
              <button
                className="bg-slate-800 p-3 rounded-lg"
                onClick={() => pay(1000)}
              >
                Pay ₹10
              </button>
              <button
                className="bg-slate-800 p-3 rounded-lg"
                onClick={() => pay(2000)}
              >
                Pay ₹20
              </button>
              <button
                className="bg-slate-800 p-3 rounded-lg"
                onClick={() => pay(3000)}
              >
                Pay ₹30
              </button>
            </div>
          </div>
        </div>

        <div>
          {hasPaid ? (
            <div className="uploaded-videos my-10">
              <h2 className="text-5xl font-semibold text-center mb-10">
                Uploaded Videos
              </h2>
              {SearchedVideos.length === 0 && (
                <p className="text-center text-gray-500">
                  No videos uploaded yet.
                </p>
              )}
              <div className="flex-col place-items-center max-h-150 space-y-5 overflow-y-auto ">
                {SearchedVideos.map((video, index) => (
                  <div
                    key={index}
                    className="video-container bg-slate-900  p-10 rounded-lg shadow-lg w-[50%]"
                  >
                    <video controls className="rounded-lg w-full">
                      <source src={video} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <h1>Title: </h1>
                    <h2>Published on: </h2>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xl text-red-500 font-semibold mt-5">
               {`Please make a payment to unlock ${creator.username}'s videos.`}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default PaymentPage;
