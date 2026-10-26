
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  UserRound,
  Flower2,
  Feather,
  Sparkles,
  Heart,
  MessageCircle,
  Quote,
} from "lucide-react";

import Comments from "../components/Comments";
import LikeButton from "../components/LikeButton";

const API = "http://127.0.0.1:8000";

// IMAGE URL HELPER
function getImageUrl(image) {
  if (!image || typeof image !== "string") {
    return null;
  }

  if (image.startsWith("http")) {
    return image;
  }

  return `${API}${image.startsWith("/") ? "" : "/"}${image}`;
}

// DATE FORMAT HELPER
function formatDate(date) {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogDetail() {
  const { id } = useParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // FETCH BLOG DETAILS
  useEffect(() => {
    const controller = new AbortController();

    async function fetchPost() {
      try {
        setLoading(true);
        setError("");
        setPost(null);

        const response = await fetch(
          `${API}/api/posts/${id}/`,
          {
            credentials: "include",
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(
              "This blog post was not found or has not been approved."
            );
          }

          throw new Error(
            "Unable to load this blog post."
          );
        }

        const data = await response.json();

        if (!controller.signal.aborted) {
          setPost(data);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message ||
              "Something went wrong."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchPost();

    return () => controller.abort();
  }, [id]);

  // LOADING SCREEN
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFCF9]">
        <div className="flex flex-col items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#F0E5F5]">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#E3D1EB] border-t-[#8C6AA7]" />
          </div>

          <p className="text-sm font-medium text-[#887B8F]">
            Preparing your story...
          </p>
        </div>
      </main>
    );
  }

  // ERROR SCREEN
  if (error || !post) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFCF9] px-5">
        <div className="w-full max-w-lg rounded-[30px] border border-[#E9DFEF] bg-white p-10 text-center shadow-[0_20px_60px_rgba(105,83,125,0.08)]">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#F0E5F5]">
            <BookOpen
              size={35}
              className="text-[#9D79B6]"
            />
          </div>

          <h2 className="mt-7 font-serif text-3xl font-semibold text-[#43394B]">
            Story Unavailable
          </h2>

          <p className="mt-4 text-sm leading-8 text-[#918398]">
            {error ||
              "This article is currently unavailable."}
          </p>

          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#8C6AA7] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#75538F]"
          >
            <ArrowLeft size={17} />
            Back to Stories
          </Link>
        </div>
      </main>
    );
  }

  const image = getImageUrl(
    post.image_url || post.image
  );

  const author =
    post.author &&
    typeof post.author === "object"
      ? post.author
      : null;

  const authorName = author
    ? [author.first_name, author.last_name]
        .filter(Boolean)
        .join(" ") ||
      author.username ||
      "Unknown Author"
    : post.author_name ||
      (typeof post.author === "string"
        ? post.author
        : "Unknown Author");

  const authorImage = getImageUrl(
    author?.profile_picture_url
  );

  const categoryName =
    post.category_name ||
    (typeof post.category === "object"
      ? post.category?.name
      : null) ||
    "General";

  return (
    <main className="min-h-screen overflow-hidden bg-[#FFFCF9] text-[#43394B]">

      {/* DECORATIVE ARTICLE HEADER */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#F4EAF8] via-[#FCF6FB] to-[#FFF0E8]">

        {/* BACKGROUND DECORATIONS */}
        <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-[#E4CEF0]/40 blur-3xl" />

        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#F3DDEB]/50 blur-3xl" />

        <div className="pointer-events-none absolute right-[10%] top-[20%] hidden text-[#D7BFE5]/50 md:block">
          <Flower2
            size={75}
            strokeWidth={0.9}
          />
        </div>

        {/* HEADER CONTENT */}
        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-10 text-center md:px-8 md:pb-20 md:pt-14">

          {/* BACK LINK */}
          <div className="mb-12 flex justify-start">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#8C6AA7] transition hover:text-[#694B84]"
            >
              <ArrowLeft size={17} />
              Back to All Stories
            </Link>
          </div>

          {/* CATEGORY */}
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E3D1EB] bg-white/90 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-[#916EAA] shadow-sm">
            <BookOpen size={15} />
            {categoryName}
          </span>

          {/* TITLE */}
          <h1 className="mx-auto mt-8 max-w-4xl font-serif text-4xl font-semibold leading-[1.2] tracking-tight text-[#43394B] sm:text-5xl md:text-6xl">
            {post.title}
          </h1>

          {/* DECORATIVE DIVIDER */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className="h-px w-14 bg-[#D8C2E6]" />
            <Flower2
              size={20}
              className="text-[#B69AC8]"
            />
            <span className="h-px w-14 bg-[#D8C2E6]" />
          </div>

          {/* AUTHOR AND DATE */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-4 text-sm text-[#887B8F]">

            {/* AUTHOR */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#E9DDF1]">
                {authorImage ? (
                  <img
                    src={authorImage}
                    alt={authorName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound
                    size={20}
                    className="text-[#8C6AA7]"
                  />
                )}
              </div>

              {author?.id ? (
                <Link
                  to={`/authors/${author.id}`}
                  className="font-bold text-[#76578F] transition hover:text-[#9D79B6]"
                >
                  {authorName}
                </Link>
              ) : (
                <span className="font-semibold">
                  {authorName}
                </span>
              )}
            </div>

            {/* DATE */}
            {post.created_at && (
              <div className="flex items-center gap-2">
                <CalendarDays
                  size={17}
                  className="text-[#A887BE]"
                />

                <span>
                  {formatDate(post.created_at)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* COVER IMAGE */}
      {image && (
        <div className="relative mx-auto -mt-5 max-w-6xl px-5 md:px-8">
          <div className="overflow-hidden rounded-[30px] border-4 border-white bg-[#E9DDF1] shadow-[0_25px_70px_rgba(105,83,125,0.13)]">
            <img
              src={image}
              alt={post.title}
              className="max-h-[550px] w-full object-cover"
            />
          </div>
        </div>
      )}

      {/* MAIN ARTICLE AREA */}
      <div className="mx-auto max-w-5xl px-5 pb-24 pt-14 md:px-8 md:pt-20">

        {/* READING INTRO */}
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F0E5F5] text-[#8C6AA7]">
            <Feather size={21} />
          </div>

          <div>
            <p className="text-sm font-bold text-[#65566D]">
              Enjoy the read
            </p>

            <p className="text-xs text-[#A99BAF]">
              Take a moment for yourself.
            </p>
          </div>
        </div>

        {/* ARTICLE CONTENT */}
        <article className="overflow-hidden rounded-[30px] border border-[#E9DFEF] bg-white px-6 py-10 shadow-[0_15px_50px_rgba(105,83,125,0.05)] sm:px-10 sm:py-12 md:px-16 md:py-16">

          <div
            className="
              blog-content
              text-[#554A5B]
              [&_p]:mb-6
              [&_p]:text-[16px]
              [&_p]:leading-[1.95]
              [&_h2]:mb-5
              [&_h2]:mt-10
              [&_h2]:font-serif
              [&_h2]:text-3xl
              [&_h2]:font-semibold
              [&_h2]:text-[#43394B]
              [&_h3]:mb-4
              [&_h3]:mt-8
              [&_h3]:font-serif
              [&_h3]:text-2xl
              [&_h3]:font-semibold
              [&_h3]:text-[#43394B]
              [&_a]:font-semibold
              [&_a]:text-[#8C6AA7]
              [&_a]:underline
              [&_blockquote]:my-8
              [&_blockquote]:rounded-2xl
              [&_blockquote]:border-l-4
              [&_blockquote]:border-[#B69AC8]
              [&_blockquote]:bg-[#F8F1FA]
              [&_blockquote]:px-6
              [&_blockquote]:py-5
              [&_blockquote]:font-serif
              [&_blockquote]:text-xl
              [&_img]:my-7
              [&_img]:h-auto
              [&_img]:max-w-full
              [&_img]:rounded-2xl
              [&_ul]:my-5
              [&_ul]:list-disc
              [&_ul]:pl-6
              [&_ol]:my-5
              [&_ol]:list-decimal
              [&_ol]:pl-6
              [&_li]:mb-2
            "
            dangerouslySetInnerHTML={{
              __html: post.content || "",
            }}
          />

          {/* END OF ARTICLE DECORATION */}
          <div className="mt-12 flex items-center justify-center gap-4 border-t border-[#F0E8F2] pt-9">
            <span className="h-px w-12 bg-[#E2D2E9]" />

            <Flower2
              size={24}
              className="text-[#B69AC8]"
            />

            <span className="h-px w-12 bg-[#E2D2E9]" />
          </div>
        </article>

        {/* ABOUT THE AUTHOR */}
        {author?.id && (
          <section className="mt-10 overflow-hidden rounded-[30px] border border-[#E8DDEF] bg-gradient-to-br from-[#F4EAF8] to-[#FFF2EB] p-7 sm:p-10">

            {/* SECTION HEADING */}
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#8C6AA7]">
                <UserRound size={20} />
              </div>

              <h2 className="font-serif text-2xl font-semibold text-[#43394B]">
                Meet the Author
              </h2>
            </div>

            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">

              {/* PROFILE PICTURE */}
              <Link
                to={`/authors/${author.id}`}
                className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#E9DDF1] shadow-md"
              >
                {authorImage ? (
                  <img
                    src={authorImage}
                    alt={authorName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound
                    size={34}
                    className="text-[#8C6AA7]"
                  />
                )}
              </Link>

              {/* AUTHOR INFORMATION */}
              <div className="flex-1">
                <Link
                  to={`/authors/${author.id}`}
                  className="font-serif text-2xl font-semibold text-[#43394B] transition hover:text-[#8C6AA7]"
                >
                  {authorName}
                </Link>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-8 text-[#887B8F]">
                  {author.bio ||
                    "This author has not added a bio yet."}
                </p>

                <Link
                  to={`/authors/${author.id}`}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#8C6AA7] transition hover:gap-3 hover:text-[#694B84]"
                >
                  View Author Profile
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* LIKE SECTION */}
        <section className="mt-10 rounded-[30px] border border-[#E9DFEF] bg-white p-7 shadow-[0_10px_35px_rgba(105,83,125,0.04)] sm:p-10">
          <div className="mb-7 flex flex-wrap items-start justify-between gap-5">

            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#9D79B6]">
                <Heart size={15} />
                Spread the Love
              </span>

              <h2 className="mt-3 font-serif text-2xl font-semibold text-[#43394B] sm:text-3xl">
                Enjoyed this story?
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#918398]">
                A little appreciation means
                a lot to the writer.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5EAF8] text-[#A47DBD]">
              <Heart size={27} />
            </div>
          </div>

          {/* EXISTING LIKE COMPONENT */}
          <LikeButton
            postId={post.id}
            initialLikes={post.likes_count ?? 0}
            initialIsLiked={post.is_liked ?? false}
          />
        </section>

        {/* COMMENTS SECTION */}
        <section className="mt-10 rounded-[30px] border border-[#E9DFEF] bg-white p-7 shadow-[0_10px_35px_rgba(105,83,125,0.04)] sm:p-10">

          {/* COMMENTS HEADING */}
          <div className="mb-8 border-b border-[#F0E8F2] pb-7">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#9D79B6]">
              <MessageCircle size={15} />
              Let's Connect
            </span>

            <h2 className="mt-3 font-serif text-2xl font-semibold text-[#43394B] sm:text-3xl">
              Join the Conversation
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#918398]">
              Share your thoughts and connect
              with fellow readers.
            </p>
          </div>

          {/* EXISTING COMMENTS COMPONENT */}
          <Comments postId={id} />
        </section>

        {/* EXPLORE MORE */}
        <div className="mt-14 flex flex-col items-center justify-between gap-5 rounded-[28px] bg-[#F4EAF8] px-7 py-8 text-center sm:flex-row sm:text-left">

          <div>
            <p className="font-serif text-xl font-semibold text-[#43394B]">
              More stories await you.
            </p>

            <p className="mt-2 text-sm text-[#918398]">
              There's always something new to discover.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-3 rounded-full bg-[#8C6AA7] px-7 py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#75538F]"
          >
            <ArrowLeft size={17} />
            Explore Stories
          </Link>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-[#E9DFEF] bg-[#493B55] px-5 py-9 text-center text-white">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-serif text-2xl font-bold"
        >
          <Flower2
            size={23}
            className="text-[#D8BCE7]"
          />
          MyBlog.
        </Link>

        <p className="mt-4 text-xs text-[#D6C9DE]">
          © {new Date().getFullYear()} MyBlog.
          A little space for beautiful stories.
        </p>
      </footer>
    </main>
  );
}
