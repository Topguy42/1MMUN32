"use client"
import { useEffect, useState } from "react";
import { GoPlus } from "react-icons/go";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { addMovie } from "@/firebase/movies";
import { useUserInfoContext } from "@/context/UserInfoContext";

const AddToList = ({ movieInfo, isMovieExists }) => {
  const [isOpened, setIsOpened] = useState(false);
  const { userInfo, isUserLoggedIn } = useUserInfoContext()
  const [status_, setStatus_] = useState(isMovieExists?.status)

  useEffect(() => {
    setStatus_(isMovieExists?.status)
  }, [isMovieExists])

  const categories = [
    { title: "Watching", id: "CURRENT" },
    { title: "To Watch", id: "PLANNING" },
    { title: "Watched", id: "COMPLETED" },
    { title: "On Hold", id: "PAUSED" },
    { title: "Dropped", id: "DROPPED" },
  ];

  const handleSubmit = async (status = "CURRENT") => {
    const uid = userInfo?.uid


    const movieData = {
      id: movieInfo?.id,
      imdb_id: movieInfo?.imdb_id || movieInfo?.id,
      adult: movieInfo?.adult,
      backdrop_path: movieInfo?.backdrop_path,
      original_language: movieInfo?.original_language,
      original_title: movieInfo?.original_title || movieInfo?.original_name,
      popularity: movieInfo?.popularity,
      poster_path: movieInfo?.poster_path,
      release_date: movieInfo?.release_date || movieInfo?.first_air_date,
      status: movieInfo?.status,
      title: movieInfo?.title || movieInfo?.name,
      type: movieInfo?.type,
    }


    const data = await addMovie(uid, movieData, isUserLoggedIn, status)
    if (data?.success) {
      setStatus_(status)
    }
  };
  return (
    <div className="relative">
      <div className="flex items-center gap-1 cursor-pointer" onClick={() => setIsOpened((prev) => !prev)}>
        <span className="text-xl"><GoPlus /></span>
        Add to List
      </div>

      {isOpened && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          className="absolute bg-[#484460] border border-[#5c5778] w-full text-center left-0 top-7 py-1 rounded-md overflow-hidden"
        >
          {categories.map((item) => (
            <div
              key={item.id}
              className="px-2 py-1 z-50 cursor-pointer hover:bg-[#363346]"
              style={{ background: status_ === item.id ? "#605b91" : "" }}
              onClick={() => handleSubmit(item?.id)}
            >
              {item.title}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default AddToList;
