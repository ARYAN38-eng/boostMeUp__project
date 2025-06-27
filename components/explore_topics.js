"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
const ExploreTopicPage = ({ category }) => {
  const router = useRouter();
  const [creators, setCreators] = useState([]);
  const [all_creators, set_all_creators] = useState([]);
  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const res = await fetch(
          "https://boost-me-up-project.vercel.app/api/popularcreators",
          {
            cache: "no-store",
          }
        );
        if (!res.ok) {
          return notFound();
        }
        const data = await res.json();
        setCreators(data);
      } catch (err) {
        console.error("Error fetching creators:", err);
      }
    };

    fetchCreators();
  }, []);

  useEffect(() => {
    const fetch_all_creators = async () => {
      try {
        const res = await fetch(
          "https://boost-me-up-project.vercel.app/api/all_creators",
          {
            cache: "no-store",
          }
        );
        if (!res.ok) {
          return notFound();
        }
        const data = await res.json();
        set_all_creators(data);
      } catch (err) {
        console.error("Error fetching creators:", err);
      }
    };

    fetch_all_creators();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const scrollRef0 = useRef(null);
  const scrollRef1 = useRef(null);
  const scrollRef2 = useRef(null);
  const scrollRef3 = useRef(null);

  const scrollRefs = [scrollRef0, scrollRef1, scrollRef2, scrollRef3];

  const scrollBy = (index, direction) => {
    const ref = scrollRefs[index]?.current;
    if (ref) {
      ref.scrollBy({
        left: direction === "left" ? -1800 : 1800,
        behavior: "smooth",
      });
    }
  };

  const { data: session } = useSession();
  if (!session) {
    return <p>Loading....</p>;
  }
  return (
    <>
      <div className="search flex justify-center">
        <div className="w-[80%] sm:w-1/2 relative">
          <svg
            className="absolute top-12 left-3 size-7 text-gray-500"
            data-tag="IconSearch"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="m20.006 17.354-.804-.804-.804-.804c-.661-.661-.988-.967-1.079-1.33-.09-.364.054-.785.336-1.677A7.422 7.422 0 0 0 18 10.5c0-2.071-.84-3.946-2.197-5.303A7.477 7.477 0 0 0 10.5 3c-2.071 0-3.946.84-5.303 2.197A7.477 7.477 0 0 0 3 10.5c0 2.071.84 3.946 2.197 5.303a7.477 7.477 0 0 0 7.543 1.852c.89-.282 1.312-.427 1.675-.336.364.091.67.418 1.331 1.079l.804.803.804.805c.663.662.994.994 1.326.994.331 0 .663-.332 1.326-.994.663-.663.994-.995.994-1.326 0-.332-.331-.663-.994-1.326M10.5 15.75a5.233 5.233 0 0 1-3.712-1.538A5.234 5.234 0 0 1 5.25 10.5c0-1.45.588-2.762 1.538-3.712A5.234 5.234 0 0 1 10.5 5.25c1.45 0 2.762.588 3.712 1.538A5.234 5.234 0 0 1 15.75 10.5c0 1.45-.588 2.762-1.538 3.712A5.234 5.234 0 0 1 10.5 15.75"
            ></path>
          </svg>
          <input
            className="bg-gray-800 mt-10 w-full rounded-full  h-10 pl-12  focus:outline-none placeholder:px-2"
            type="text"
            placeholder="Search for creators or topics..."
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value;
              setSearchTerm(value);
              if (value.length > 0) {
                const matches = all_creators.filter((creator) =>
                  `${creator.name} ${creator.desc}`
                    .toLowerCase()
                    .includes(value.toLowerCase())
                );
                setSuggestions(matches.slice(0, 5));
                setShowSuggestions(true);
              } else {
                setSuggestions([]);
                setShowSuggestions(false);
              }
            }}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 100);
            }}
          />

          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-gray-900 border border-gray-700 rounded-lg mt-1 max-h-48 overflow-y-hidden">
              {suggestions.map((creator, index) => (
                <li
                  key={`${creator.name}-${index}`}
                  className="flex gap-2 items-center p-2 hover:bg-gray-700 text-white cursor-pointer"
                  onMouseDown={() => {
                    setSearchTerm(creator.name);
                    setShowSuggestions(false);
                    router.push(
                      `/Member/${encodeURIComponent(
                        session.user.name
                      )}/${encodeURIComponent(creator.username)}`
                    );
                  }}
                >
                  <Image
                    width={48}
                    height={48}
                    src={
                      creator.profilepic && creator.profilepic !== ""
                        ? creator.profilepic?.trim()
                        : null
                    }
                    alt={creator.name}
                    className="w-12 h-12 "
                  />
                  <span>{creator.name}</span>
                  <span className="text-gray-600">{creator.desc}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="text-white flex justify-center p-8 text-4xl font-bold">
        Explore/ {decodeURIComponent(category)}
      </div>

      <div className="text-white p-5 sm:ml-10">
        <div className="flex justify-between items-center mb-4 ">
          <h2 className="text-3xl font-semibold">Popular this week</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => scrollBy(0, "left")}
              className="p-2 bg-gray-800 rounded-full"
            >
              &#9665;
            </button>
            <button
              onClick={() => scrollBy(0, "right")}
              className="p-2 bg-gray-800 rounded-full"
            >
              &#9655;
            </button>
          </div>
        </div>

        <div
          ref={scrollRefs[0]}
          className="flex gap-4 overflow-x-auto sm:w-[1400px] scrollbar-hide"
        >
          {Array.from(
            { length: Math.ceil(creators.length / 9) },
            (_, sectionIndex) => (
              <div
                key={sectionIndex}
                className="grid grid-cols-3 grid-rows-3 gap-6 min-w-[1400px]"
              >
                {creators
                  .slice(sectionIndex * 9, (sectionIndex + 1) * 9)
                  .map((creator, index) => (
                    <Link
                      href={`/Member/${encodeURIComponent(
                        session.user.name
                      )}/${encodeURIComponent(creator.username)}`}
                      key={index}
                      className="bg-gray-900 p-4 rounded-lg flex items-center space-x-4"
                    >
                      <Image
                        width={72}
                        height={72}
                        src={creator.profilepic?.trim()}
                        alt={creator.name}
                        className="w-18 h-18 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-semibold">{creator.name}</h3>
                        <p className="text-sm text-gray-400">{creator.desc}</p>
                      </div>
                    </Link>
                  ))}
              </div>
            )
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-4 ">
        <h2 className="text-3xl font-semibold mt-5 ml-5 sm:ml-14">New on BoostMeUp</h2>
        <div className="flex space-x-2 mr-5">
          <button
            onClick={() => scrollBy(1, "left")}
            className="p-2 bg-gray-800 rounded-full"
          >
            &#9665;
          </button>
          <button
            onClick={() => scrollBy(1, "right")}
            className="p-2 bg-gray-800 rounded-full"
          >
            &#9655;
          </button>
        </div>
      </div>
      <div className="flex justify-center">
        <div
          ref={scrollRefs[1]}
          className="flex gap-4 overflow-x-auto w-[1370px] mt-5 scrollbar-hide"
        >
          {all_creators.map((newCreator, i) => {
            return (
              <Link
                href={`/Member/${encodeURIComponent(
                  session.user.name
                )}/${encodeURIComponent(newCreator.username)}`}
                key={i}
                className="flex flex-col"
              >
                <Image
                  width={192}
                  height={192}
                  className="max-h-48 max-w-48 rounded-lg object-contain"
                  src={newCreator.profilepic?.trim()}
                  alt="creatorImage"
                />
                <h3 className="font-bold">{newCreator.name}</h3>
                <p className="text-gray-500">{newCreator.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center mb-4 ">
        <div>
          <h2 className="text-md text-gray-500  mt-5 ml-5 sm:ml-14">Top Creators</h2>
          <h2 className="text-3xl font-semibold  ml-5 sm:ml-14">Educational</h2>
        </div>
        <div className="flex space-x-2 mr-5">
          <button
            onClick={() => scrollBy(2, "left")}
            className="p-2 bg-gray-800 rounded-full"
          >
            &#9665;
          </button>
          <button
            onClick={() => scrollBy(2, "right")}
            className="p-2 bg-gray-800 rounded-full"
          >
            &#9655;
          </button>
        </div>
      </div>
      <div className="flex justify-center">
        <div
          ref={scrollRefs[2]}
          className="flex gap-4 overflow-x-auto w-[1370px] mt-5 scrollbar-hide"
        >
          {all_creators.map((newCreator, i) => {
            return (
              <Link
                href={`/Member/${encodeURIComponent(
                  session.user.name
                )}/${encodeURIComponent(newCreator.username)}`}
                key={i}
                className="flex flex-col"
              >
                <Image
                  width={192}
                  height={192}
                  className="max-h-48 max-w-48 rounded-lg object-contain"
                  src={newCreator.profilepic?.trim()}
                  alt="creatorImage"
                />
                <h3 className="font-bold">{newCreator.name}</h3>
                <p className="text-gray-500">{newCreator.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center mb-4 ">
        <div>
          <h2 className="text-md text-gray-500  mt-5 ml-5 sm:ml-14">Top Creators</h2>
          <h2 className="text-3xl font-semibold  ml-5 sm:ml-14">Paranormal</h2>
        </div>
        <div className="flex space-x-2 mr-5">
          <button
            onClick={() => scrollBy(3, "left")}
            className="p-2 bg-gray-800 rounded-full"
          >
            &#9665;
          </button>
          <button
            onClick={() => scrollBy(3, "right")}
            className="p-2 bg-gray-800 rounded-full"
          >
            &#9655;
          </button>
        </div>
      </div>
      <div className="flex justify-center">
        <div
          ref={scrollRefs[3]}
          className="flex gap-4 overflow-x-auto w-[1370px] mt-5 scrollbar-hide"
        >
          {all_creators.map((newCreator, i) => {
            return (
              <Link
                href={`/Member/${encodeURIComponent(
                  session.user.name
                )}/${encodeURIComponent(newCreator.username)}`}
                key={i}
                className="flex flex-col"
              >
                <Image
                  width={192}
                  height={192}
                  className="max-h-48 max-w-48 rounded-lg object-contain"
                  src={newCreator.profilepic?.trim()}
                  alt="creatorImage"
                />
                <h3 className="font-bold">{newCreator.name}</h3>
                <p className="text-gray-500">{newCreator.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ExploreTopicPage;
