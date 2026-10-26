import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  HeartHandshake,
  LogIn,
  AlertCircle,
  Sparkles,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const API = "http://127.0.0.1:8000";

// GET CSRF COOKIE
function getCookie(name) {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  return cookie
    ? decodeURIComponent(
        cookie.split("=").slice(1).join("=")
      )
    : "";
}

export default function LikeButton({
  postId,
  initialLikes = 0,
  initialIsLiked = false,
}) {
  const { user, loading: authLoading } = useAuth();

  const [likesCount, setLikesCount] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // RESET LIKE STATE WHEN POST CHANGES
  useEffect(() => {
    setLikesCount(initialLikes);
    setIsLiked(initialIsLiked);
    setError("");
  }, [postId, initialLikes, initialIsLiked]);

  // LIKE OR UNLIKE POST
  async function handleLike() {
    if (!user || submitting) return;

    try {
      setSubmitting(true);
      setError("");

      // INITIALIZE CSRF
      const csrfResponse = await fetch(
        `${API}/api/auth/csrf/`,
        {
          credentials: "include",
        }
      );

      if (!csrfResponse.ok) {
        throw new Error(
          "Unable to initialize CSRF protection."
        );
      }

      const csrfData = await csrfResponse
        .json()
        .catch(() => ({}));

      const csrfToken =
        getCookie("csrftoken") ||
        csrfData.csrfToken ||
        csrfData.csrf_token;

      if (!csrfToken) {
        throw new Error(
          "CSRF token missing. Please refresh the page."
        );
      }

      // SEND LIKE REQUEST
      const response = await fetch(
        `${API}/api/posts/${postId}/like/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "X-CSRFToken": csrfToken,
          },
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            `Unable to update like (HTTP ${response.status}).`
        );
      }

      // UPDATE LIKE STATE
      setIsLiked(data.is_liked);
      setLikesCount(data.likes_count);
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-9">

      {/* LIKE SECTION */}
      <div className="flex flex-wrap items-center gap-4">

        {/* AUTHENTICATION LOADING */}
        {authLoading ? (
          <div className="h-12 w-40 animate-pulse rounded-full bg-[#F0E5F5]" />
        ) : !user ? (

          /* LOGIN REQUIRED */
          <Link
            to="/login"
            className="group inline-flex items-center gap-3 rounded-full border border-[#DCC6E8] bg-[#F8F2FB] px-6 py-3.5 text-sm font-bold text-[#8C6AA7] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C5A5D8] hover:bg-[#F0E5F5] hover:shadow-md"
          >
            <Heart
              size={19}
              className="transition-transform duration-300 group-hover:scale-110"
            />

            <span>Like this Post</span>

            <LogIn
              size={16}
              className="opacity-70"
            />
          </Link>
        ) : (

          /* LIKE / UNLIKE BUTTON */
          <button
            type="button"
            onClick={handleLike}
            disabled={submitting}
            aria-pressed={isLiked}
            aria-label={
              isLiked
                ? "Unlike this post"
                : "Like this post"
            }
            className={`
              group inline-flex items-center gap-3
              rounded-full border px-7 py-3.5
              text-sm font-bold shadow-sm
              transition-all duration-300
              hover:-translate-y-0.5 hover:shadow-md
              disabled:cursor-not-allowed
              disabled:opacity-60
              disabled:hover:translate-y-0
              ${
                isLiked
                  ? "border-[#D9B8E8] bg-[#E9DDF1] text-[#76518F] hover:bg-[#E2D0ED]"
                  : "border-[#DCC6E8] bg-[#F8F2FB] text-[#8C6AA7] hover:bg-[#F0E5F5]"
              }
            `}
          >
            <Heart
              size={20}
              fill={isLiked ? "currentColor" : "none"}
              className={`
                transition-transform duration-300
                group-hover:scale-110
                ${
                  isLiked
                    ? "text-[#8C6AA7]"
                    : ""
                }
              `}
            />

            <span>
              {submitting
                ? "Updating..."
                : isLiked
                  ? "Liked"
                  : "Like this Post"}
            </span>

            {isLiked && !submitting && (
              <Sparkles
                size={16}
                className="text-[#9D79B6]"
              />
            )}
          </button>
        )}

        {/* LIKE COUNTER */}
        <div className="inline-flex items-center gap-3 rounded-full border border-[#E9DFEF] bg-white px-5 py-3 shadow-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F0E5F5]">
            <HeartHandshake
              size={17}
              className="text-[#9D79B6]"
            />
          </div>

          <span className="text-sm font-bold text-[#43394B]">
            {likesCount}
          </span>

          <span className="text-sm text-[#918398]">
            {likesCount === 1 ? "like" : "likes"}
          </span>
        </div>
      </div>

      {/* LOGIN MESSAGE */}
      {!authLoading && !user && (
        <p className="mt-4 text-xs leading-6 text-[#918398]">
          <Link
            to="/login"
            className="font-bold text-[#8C6AA7] transition hover:text-[#694B84] hover:underline"
          >
            Log in
          </Link>{" "}
          to show some love for this article.
        </p>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-7 text-red-700"
        >
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0"
          />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}