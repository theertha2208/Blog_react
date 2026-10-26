import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Feather,
  Heart,
  LockKeyhole,
  MessageCircle,
  MessageSquareText,
  Send,
  Sparkles,
  UserRound,
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

// FORMAT COMMENT DATE
function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Comments({ postId }) {
  const { user, loading: authLoading } = useAuth();

  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");

  // FETCH APPROVED COMMENTS
  async function loadComments(signal) {
    try {
      setLoading(true);
      setLoadError("");

      const response = await fetch(
        `${API}/api/posts/${postId}/comments/`,
        {
          credentials: "include",
          signal,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Unable to load comments (HTTP ${response.status}).`
        );
      }

      const data = await response.json();

      if (signal?.aborted) return;

      setComments(
        Array.isArray(data)
          ? data
          : data.results || []
      );
    } catch (err) {
      if (err.name !== "AbortError") {
        setLoadError(
          err.message || "Unable to load comments."
        );
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }

  // LOAD COMMENTS WHEN POST CHANGES
  useEffect(() => {
    const controller = new AbortController();

    setComments([]);
    setContent("");
    setSuccess("");
    setSubmitError("");

    loadComments(controller.signal);

    return () => {
      controller.abort();
    };
  }, [postId]);

  // SUBMIT COMMENT
  async function handleSubmit(event) {
    event.preventDefault();

    const body = content.trim();

    if (body.length < 3) {
      setSubmitError(
        "Comment must contain at least 3 characters."
      );
      return;
    }

    if (body.length > 2000) {
      setSubmitError(
        "Comment cannot exceed 2000 characters."
      );
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");
      setSuccess("");

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
          "CSRF token missing. Please refresh and log in again."
        );
      }

      // CREATE COMMENT
      const response = await fetch(
        `${API}/api/posts/${postId}/comments/create/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({
            body,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        const firstError = Object.values(data)[0];

        const message =
          typeof data.detail === "string"
            ? data.detail
            : Array.isArray(firstError)
              ? firstError.join(" ")
              : typeof firstError === "string"
                ? firstError
                : "Unable to submit comment.";

        throw new Error(
          `${message} (HTTP ${response.status})`
        );
      }

      setContent("");

      setSuccess(
        data.message ||
          "Comment submitted for admin approval."
      );

      await loadComments();
    } catch (err) {
      setSubmitError(
        err.message || "Unable to submit comment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const remainingCharacters = 2000 - content.length;

  return (
    <section className="mt-14 border-t border-[#E9DFEF] pt-12 text-[#43394B]">

      {/* SECTION HEADING */}
      <div className="mb-9">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#F0E5F5] px-4 py-2 text-xs font-bold text-[#8C6AA7]">
          <MessageCircle size={15} />
          Reader Conversations
        </span>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <h2 className="font-serif text-3xl font-semibold sm:text-4xl">
            Comments
          </h2>

          {!loading && !loadError && (
            <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-[#E9DDF1] px-3 text-sm font-bold text-[#8C6AA7]">
              {comments.length}
            </span>
          )}
        </div>

        <p className="mt-4 max-w-2xl text-sm leading-8 text-[#918398]">
          Join the conversation, share your perspective,
          and connect with other readers.
        </p>
      </div>

      {/* COMMENTS LIST */}
      <div className="space-y-5">

        {/* LOADING STATE */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-[24px] bg-[#F3E9F7]"
              />
            ))}
          </div>
        ) : loadError ? (
          /* LOAD ERROR */
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-7 text-red-700"
          >
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />
            <span>{loadError}</span>
          </div>
        ) : comments.length === 0 ? (
          /* EMPTY COMMENTS */
          <div className="rounded-[28px] border border-[#E9DFEF] bg-white px-6 py-14 text-center shadow-[0_8px_30px_rgba(105,83,125,0.035)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#F0E5F5] text-[#9D79B6]">
              <MessageSquareText size={34} />
            </div>

            <h3 className="mt-6 font-serif text-2xl font-semibold">
              No Comments Yet
            </h3>

            <p className="mx-auto mt-4 max-w-md text-sm leading-8 text-[#918398]">
              No approved comments have been posted yet.
              Be the first to start a conversation!
            </p>
          </div>
        ) : (
          /* COMMENT CARDS */
          comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-[26px] border border-[#E9DFEF] bg-white p-6 shadow-[0_8px_30px_rgba(105,83,125,0.035)] transition hover:border-[#D7BCE5] hover:shadow-[0_15px_35px_rgba(105,83,125,0.065)] sm:p-7"
            >
              <div className="flex items-start gap-4">

                {/* COMMENT AVATAR */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F0E5F5] text-[#8C6AA7]">
                  <UserRound size={23} />
                </div>

                {/* COMMENT DETAILS */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="break-words text-sm font-bold text-[#43394B] sm:text-base">
                        {comment.username || "Reader"}
                      </h3>

                      <span className="mt-1 inline-flex items-center gap-1 text-xs text-[#A58CB6]">
                        <Sparkles size={12} />
                        MyBlog Reader
                      </span>
                    </div>

                    {comment.created_at && (
                      <time
                        dateTime={comment.created_at}
                        className="inline-flex items-center gap-2 text-xs text-[#918398]"
                      >
                        <CalendarDays size={15} />
                        {formatDate(comment.created_at)}
                      </time>
                    )}
                  </div>

                  {/* COMMENT CONTENT */}
                  <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-8 text-[#65566D]">
                    {comment.body}
                  </p>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* COMMENT FORM */}
      <div className="mt-11 overflow-hidden rounded-[30px] border border-[#E9DFEF] bg-white shadow-[0_12px_40px_rgba(105,83,125,0.045)]">

        {/* FORM HEADER */}
        <div className="flex items-center gap-4 border-b border-[#E9DFEF] bg-[#F8F2FB] px-6 py-7 sm:px-9">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E9DDF1] text-[#8C6AA7]">
            <MessageSquareText size={23} />
          </div>

          <div>
            <h3 className="font-serif text-2xl font-semibold">
              Leave a Comment
            </h3>

            <p className="mt-2 text-xs leading-6 text-[#918398]">
              We'd love to hear what you think.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-9">

          {/* SUBMISSION ERROR */}
          {submitError && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-7 text-red-700"
            >
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0"
              />
              <span>{submitError}</span>
            </div>
          )}

          {/* SUBMISSION SUCCESS */}
          {success && (
            <div
              role="status"
              className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm leading-7 text-green-700"
            >
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0"
              />
              <span>{success}</span>
            </div>
          )}

          {/* AUTH LOADING */}
          {authLoading ? (
            <p className="text-sm text-[#918398]">
              Checking your account...
            </p>
          ) : !user ? (
            /* LOGIN REQUIRED */
            <div className="rounded-[24px] border border-[#E9DFEF] bg-gradient-to-br from-[#F8F2FB] to-[#FFF8F4] p-7 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E9DDF1] text-[#8C6AA7]">
                <LockKeyhole size={24} />
              </div>

              <h4 className="mt-5 font-serif text-xl font-semibold">
                Want to Join the Conversation?
              </h4>

              <p className="mx-auto mt-3 max-w-md text-sm leading-8 text-[#918398]">
                Please log in to share your thoughts
                and connect with other readers.
              </p>

              <Link
                to="/login"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#8C6AA7] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#75538F]"
              >
                Log In to Comment
                <ArrowRight size={17} />
              </Link>
            </div>
          ) : (
            /* COMMENT SUBMISSION FORM */
            <form onSubmit={handleSubmit}>

              {/* CURRENT USER */}
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F0E5F5] text-[#8C6AA7]">
                  <UserRound size={20} />
                </div>

                <div>
                  <p className="text-xs text-[#918398]">
                    Commenting as
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#43394B]">
                    {user.username}
                  </p>
                </div>
              </div>

              {/* COMMENT TEXTAREA */}
              <label
                htmlFor={`comment-body-${postId}`}
                className="mb-3 flex items-center gap-2 text-sm font-bold text-[#43394B]"
              >
                <Feather
                  size={17}
                  className="text-[#9D79B6]"
                />
                Your Comment
              </label>

              <textarea
                id={`comment-body-${postId}`}
                value={content}
                onChange={(event) => {
                  setContent(event.target.value);
                  setSubmitError("");
                }}
                placeholder="Share your thoughts about this story..."
                rows={6}
                maxLength={2000}
                required
                className="w-full resize-y rounded-2xl border border-[#E4D7EA] bg-[#FFFCFE] px-5 py-4 text-sm leading-8 text-[#43394B] outline-none transition placeholder:text-[#B4A5BA] focus:border-[#A889BE] focus:ring-4 focus:ring-[#EDE0F3]/60"
              />

              {/* CHARACTER COUNTER */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-[#918398]">
                  Minimum 3 characters.
                </p>

                <p
                  className={`text-xs font-semibold ${
                    remainingCharacters < 100
                      ? "text-orange-600"
                      : "text-[#8C6AA7]"
                  }`}
                >
                  {remainingCharacters} characters remaining
                </p>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={
                  submitting ||
                  content.trim().length < 3
                }
                className="mt-7 inline-flex items-center justify-center gap-3 rounded-full bg-[#8C6AA7] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#75538F] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={18} />

                {submitting
                  ? "Submitting..."
                  : "Post Comment"}
              </button>

              {/* MODERATION NOTE */}
              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[#F8F2FB] px-5 py-4">
                <LockKeyhole
                  size={17}
                  className="mt-1 shrink-0 text-[#9D79B6]"
                />

                <p className="text-xs leading-7 text-[#918398]">
                  Comments are reviewed by an administrator
                  before appearing publicly. Your comment
                  will be visible once approved.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* BOTTOM MESSAGE */}
      <div className="mt-8 flex items-center justify-center gap-2 text-center text-xs font-medium text-[#A58CB6]">
        <Heart size={15} />
        Every thoughtful conversation makes our community better.
      </div>
    </section>
  );
}