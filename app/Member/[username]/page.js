"use client";
import React, { useRef, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
const Page = () => {
  let genres = [
    "All",
    "pop culture",
    "comedy",
    "role playing games",
    "true crime",
    "art tutorials",
    "handicrafts",
    "musical institutions",
    "illustrations",
    "education",
    "indian games",
    "podcasts",
    "reactions",
  ];
  const [creators, setCreators] = useState([]);
  const [all_creators, set_all_creators] = useState([]);
  const [activeGenre, setActiveGenre] = useState("All");
  const [filteredCreators, setFilteredCreators] = useState([]);
  const [all_filteredCreators, set_all_FilteredCreators] = useState([]);

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
        setFilteredCreators(data);
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
        set_all_FilteredCreators(data);
      } catch (err) {
        console.error("Error fetching creators:", err);
      }
    };

    fetch_all_creators();
  }, []);

  useEffect(() => {
    if (activeGenre === "All") {
      setFilteredCreators(creators);
      set_all_FilteredCreators(all_creators);
    } else {
      const filtered = creators.filter((creator) =>
        creator.genre?.toLowerCase().includes(activeGenre.toLowerCase())
      );
      const all_filtered = all_creators.filter((all_creator) =>
        all_creator.genre?.toLowerCase().includes(activeGenre.toLowerCase())
      );
      setFilteredCreators(filtered);
      set_all_FilteredCreators(all_filtered);
    }
  }, [activeGenre, creators, all_creators]);

  const categories = [
    "Podcasts & shows",
    "Visual arts",
    "Tabletop games",
    "Video games",
    "Music",
    "Lifestyle",
    "Writing",
    "Handicrafts",
    "Apps & software",
    "Social impact",
  ];

  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
  ];

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

  const router = useRouter();
  const [count, setCount] = useState(5);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session) {
      const interval = setInterval(() => {
        setCount((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [session]);

  useEffect(() => {
    if (!session && count <= 0) {
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
                    height={48}
                    width={48}
                    src={
                      creator.profilepic && creator.profilepic !== ""
                        ? creator.profilepic?.trim()
                        : "default-profile.jpg"
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

      <div className="flex justify-center">
        <div className="flex  overflow-x-auto w-[90%] sm:w-[1300px] scrollbar-hide">
          {genres.map((genre, i) => {
            return (
              <button
                key={i}
                className={`rounded-lg h-10 px-4 m-2 mt-10 whitespace-nowrap ${
                  activeGenre === genre
                    ? "bg-white text-black"
                    : "bg-gray-700 text-white"
                }`}
                onClick={() => setActiveGenre(genre)}
              >
                {genre}
              </button>
            );
          })}
        </div>
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
            { length: Math.ceil(filteredCreators.length / 9) },
            (_, sectionIndex) => (
              <div
                key={sectionIndex}
                className="grid grid-cols-3 grid-rows-3 gap-6 min-w-[1400px]"
              >
                {filteredCreators
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
                        height={72}
                        width={72}
                        src={
                          creator.profilepic && creator.profilepic !== ""
                            ? creator.profilepic?.trim()
                            : "default-profile.jpg"
                        }
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

        <h2 className="text-3xl font-semibold mt-5">Explore topics</h2>
        <div className="grid grid-cols-2 lg:flex flex-wrap mt-10 ml-3 gap-4">
          {categories.map((category, i) => {
            return (
              <button
                key={i}
                className={`${
                  colors[i % colors.length]
                } rounded-lg h-24 w-full sm:w-full lg:w-64 px-4 cursor-pointer`}
                onClick={() =>
                  router.push(
                    `/Member/${encodeURIComponent(
                      session.user.name
                    )}/explore_topics/${encodeURIComponent(category)}`
                  )
                }
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center mb-4 ">
        <h2 className="text-3xl font-semibold mt-5 ml-14">New on BoostMeUp</h2>
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
          {all_filteredCreators.map((newCreator, i) => {
            return (
              <Link
                href={`/Member/${encodeURIComponent(
                  session.user.name
                )}/${encodeURIComponent(newCreator.username)}`}
                key={i}
                className="flex flex-col"
              >
                <Image
                  height={192}
                  width={192}
                  className="max-h-48 max-w-48 rounded-lg object-contain"
                  src={
                    newCreator.profilepic && newCreator.profilepic !== ""
                      ? newCreator.profilepic?.trim()
                      : "default-profile.jpg"
                  }
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
          <h2 className="text-md text-gray-500  mt-5 ml-14">Top Creators</h2>
          <h2 className="text-3xl font-semibold  ml-14">Pop Culture</h2>
        </div>
        <div className="flex space-x-2 mr-5">
          <button
            onClick={() => scrollBy(2)}
            className="p-2 bg-gray-800 rounded-full"
          >
            &#9665;
          </button>
          <button
            onClick={() => scrollBy(2)}
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
          {all_filteredCreators.map((newCreator, i) => {
            return (
              <Link
                href={`/Member/${encodeURIComponent(
                  session.user.name
                )}/${encodeURIComponent(newCreator.username)}`}
                key={i}
                className="flex flex-col"
              >
                <Image
                  height={192}
                  width={192}
                  className="max-h-48 max-w-48 rounded-lg object-contain"
                  src={
                    newCreator.profilepic && newCreator.profilepic !== ""
                      ? newCreator.profilepic?.trim()
                      : "default-profile.jpg"
                  }
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
          <h2 className="text-md text-gray-500  mt-5 ml-14">Top Creators</h2>
          <h2 className="text-3xl font-semibold  ml-14">Role playing games</h2>
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
          {all_filteredCreators.map((newCreator, i) => {
            return (
              <Link
                href={`/Member/${encodeURIComponent(
                  session.user.name
                )}/${encodeURIComponent(newCreator.username)}`}
                key={i}
                className="flex flex-col"
              >
                <Image
                  height={192}
                  width={192}
                  className="max-h-48 max-w-48 rounded-lg object-contain"
                  src={
                    newCreator.profilepic && newCreator.profilepic !== ""
                      ? newCreator.profilepic?.trim()
                      : "default-profile.jpg"
                  }
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

export default Page;
