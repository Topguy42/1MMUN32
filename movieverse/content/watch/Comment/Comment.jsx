"use client";

import { useEffect, useState } from "react";
import { getReviews } from "@/lib/MoviesFunctions";
import { FaComment } from "react-icons/fa6";

const IMAGE_BASE = "https://image.tmdb.org/t/p/w500/";

const avatars = [
  "/images/waifus/2.png",
  "/images/waifus/sexy sword.png",
  "/images/waifus/praise samuri.png",
];

const Comments = ({ MovieId, type }) => {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(false);
  const [avatarMap, setAvatarMap] = useState({});
  const [showReviews, setShowReviews] = useState(false);

  useEffect(() => {
    if (!showReviews || !MovieId) return;

    const fetchReviews = async () => {
      setLoading(true);

      const data = await getReviews(MovieId, type, page);
      const results = data?.results || [];

      setReviews(results);
      setTotalPages(data?.total_pages || 1);
      setExpanded({});

      const newAvatarMap = {};
      results.forEach((review) => {
        if (!review.author_details?.avatar_path) {
          newAvatarMap[review.id] =
            avatars[Math.floor(Math.random() * avatars.length)];
        }
      });

      setAvatarMap((prev) => ({ ...prev, ...newAvatarMap }));
      setLoading(false);
    };

    fetchReviews();
  }, [MovieId, type, page, showReviews]);

  const getSentimentClass = (rating) => {
    if (rating >= 7) return "text-green-400";
    if (rating <= 4) return "text-red-400";
    return "text-yellow-400";
  };

  const getAvatar = (review) => {
    const avatarPath = review.author_details?.avatar_path;
    if (!avatarPath) return avatarMap[review.id];
    if (avatarPath.startsWith("/https")) return avatarPath.slice(1);
    return IMAGE_BASE + avatarPath;
  };

  return (
    <div className="text-white bg-[#242735] border border-[#39374b] rounded-md pb-4 w-full h-fit">

      {/* Header */}
      <div className="py-4 px-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaComment />
          <span className="text-[#ffffffd3] text-[18px] font-medium">
            Reviews
          </span>
        </div>

        <button
          onClick={() => setShowReviews((prev) => !prev)}
          className="px-4 py-2 text-sm bg-[#1f2230] border border-[#39374b] rounded"
        >
          {showReviews ? "Hide Reviews" : "View Reviews"}
        </button>
      </div>

      {/* Center message when hidden */}
      {!showReviews && (
        <div className="px-3 py-10 text-sm text-[#ffffffa7] text-center">
          Click "View Reviews" to show reviews
        </div>
      )}

      {showReviews && loading && (
        <div className="px-3 py-4 text-sm text-[#ffffffa7]">
          Loading reviews...
        </div>
      )}

      {showReviews && !loading && reviews.length === 0 && (
        <div className="px-3 py-4 text-sm text-[#ffffffa7]">
          No reviews available.
        </div>
      )}

      {/* Reviews */}
      {showReviews && (
        <div className="px-3 space-y-4">
          {reviews.map((review) => {
            const isExpanded = expanded[review.id];
            const rating = review.author_details?.rating;
            const avatar = getAvatar(review);

            return (
              <div
                key={review.id}
                className="border border-[#39374b] rounded-md p-3 bg-[#1f2230]"
              >
                {/* Author */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img
                      src={avatar}
                      alt={review.author}
                      className="w-10 h-10 rounded-full object-cover border border-[#39374b]"
                    />
                    <p className="text-sm font-semibold">
                      {review.author}
                    </p>
                  </div>

                  {rating !== null && rating !== undefined && (
                    <span
                      className={`text-xs px-2 py-1 rounded ${getSentimentClass(
                        rating
                      )}`}
                    >
                      ⭐ {rating}/10
                    </span>
                  )}
                </div>

                {/* Content */}
                <p
                  className="text-sm text-[#ffffffa7] mt-3 whitespace-pre-line overflow-hidden transition-all duration-300"
                  style={{
                    maxHeight: isExpanded ? "1000px" : "7.5em",
                  }}
                >
                  {review.content}
                </p>

                {review.content.length > 300 && (
                  <button
                    onClick={() =>
                      setExpanded((prev) => ({
                        ...prev,
                        [review.id]: !prev[review.id],
                      }))
                    }
                    className="text-blue-400 text-xs mt-2"
                  >
                    {isExpanded ? "Read less" : "Read more"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {showReviews && totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 bg-[#1f2230] border border-[#39374b] rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span className="text-sm text-[#ffffffa7]">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 bg-[#1f2230] border border-[#39374b] rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Comments;
