
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Heart,
  Search,
  Menu,
  X,
  PenLine,
  UserRound,
  LogOut,
  Sparkles,
  Feather,
  CalendarDays,
  Flower2,
  ChevronDown,
  PenTool,
  Coffee,
  Star,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API = "http://127.0.0.1:8000";

// IMAGE HELPER
function getPostImage(post) {
  const image = post.image_url || post.image;

  if (!image || typeof image !== "string") {
    return null;
  }

  if (image.startsWith("http")) {
    return image;
  }

  return `${API}${image.startsWith("/") ? "" : "/"}${image}`;
}

// AUTHOR HELPER
function getAuthorName(post) {
  if (post.author && typeof post.author === "object") {
    const fullName = [
      post.author.first_name,
      post.author.last_name,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      fullName ||
      post.author.username ||
      post.author_name ||
      "Unknown Author"
    );
  }

  return (
    post.author_name ||
    (typeof post.author === "string"
      ? post.author
      : null) ||
    "Unknown Author"
  );
}

// CATEGORY HELPER
function getCategoryName(post) {
  return (
    post.category_name ||
    (typeof post.category === "object"
      ? post.category?.name
      : null) ||
    "General"
  );
}

// DATE HELPER
function formatDate(date) {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// BLOG CARD
function ArticleCard({ post, index }) {
  const image = getPostImage(post);
  const authorId = post.author?.id;
  const authorName = getAuthorName(post);

  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-[#E9E0EF] bg-white shadow-[0_8px_30px_rgba(105,83,125,0.05)] transition-all duration-500 hover:-translate-y-2 hover:border-[#D8C2E6] hover:shadow-[0_22px_55px_rgba(105,83,125,0.14)]"
      style={{
        animation: `lavenderFadeUp 0.65s ease ${
          index * 0.08
        }s both`,
      }}
    >
      {/* IMAGE */}
      <Link
        to={`/posts/${post.id}`}
        className="relative block h-60 overflow-hidden bg-[#F0E5F4]"
      >
        {image ? (
          <img
            src={image}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#E9DDF1] via-[#F6EAF4] to-[#FFF1E7]">
            <Flower2
              size={52}
              strokeWidth={1.2}
              className="text-[#B69AC8]"
            />
          </div>
        )}

        {/* CATEGORY BADGE */}
        <span className="absolute left-5 top-5 rounded-full border border-white/70 bg-white/95 px-4 py-2 text-xs font-bold text-[#84649B] shadow-sm backdrop-blur-md">
          {getCategoryName(post)}
        </span>

        {/* HOVER ARROW */}
        <span className="absolute bottom-5 right-5 flex h-11 w-11 translate-y-3 items-center justify-center rounded-full bg-[#8C6AA7] text-white opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight size={20} />
        </span>
      </Link>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 text-xs font-medium text-[#A194AA]">
          <CalendarDays size={14} />
          {formatDate(post.created_at)}
        </div>

        <Link to={`/posts/${post.id}`}>
          <h3 className="mt-4 font-serif text-[24px] font-semibold leading-snug text-[#43394B] transition-colors duration-300 group-hover:text-[#936CB0]">
            {post.title}
          </h3>
        </Link>

        {/* AUTHOR */}
        <div className="mt-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#E9D8F2] to-[#F7E8EF] text-sm font-bold text-[#8665A0]">
            {authorName.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="text-[11px] text-[#A99EAE]">
              Written by
            </p>

            {authorId ? (
              <Link
                to={`/authors/${authorId}`}
                className="text-sm font-semibold text-[#67596F] transition hover:text-[#936CB0]"
              >
                {authorName}
              </Link>
            ) : (
              <p className="text-sm font-semibold text-[#67596F]">
                {authorName}
              </p>
            )}
          </div>
        </div>

        {/* CARD FOOTER */}
        <div className="mt-auto flex items-center justify-between border-t border-[#F0E8F2] pt-5">
          <Link
            to={`/posts/${post.id}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#8C6AA7] transition-all hover:gap-3 hover:text-[#694B84]"
          >
            Read Story
            <ArrowRight size={17} />
          </Link>

          <span className="flex items-center gap-1.5 text-sm text-[#9E90A6]">
            <Heart
              size={17}
              className="text-[#C89EBE]"
            />
            {post.likes_count ?? 0}
          </span>
        </div>
      </div>
    </article>
  );
}

// FEATURED ARTICLE
function FeaturedArticle({ post }) {
  if (!post) return null;

  const image = getPostImage(post);

  return (
    <div className="grid overflow-hidden rounded-[34px] border border-[#E8DDEF] bg-white shadow-[0_25px_70px_rgba(112,85,134,0.1)] lg:grid-cols-2">
      {/* IMAGE */}
      <Link
        to={`/posts/${post.id}`}
        className="relative block min-h-[320px] overflow-hidden bg-[#EBDDF1] lg:min-h-[470px]"
      >
        {image ? (
          <img
            src={image}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#E5D6EF] via-[#F3E5F1] to-[#FFF1E7]">
            <Flower2
              size={85}
              strokeWidth={1}
              className="text-[#B395C7]"
            />
          </div>
        )}

        <span className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full bg-white/95 px-5 py-2.5 text-xs font-bold text-[#8863A4] shadow-lg">
          <Star size={14} fill="currentColor" />
          Featured Story
        </span>
      </Link>

      {/* FEATURED CONTENT */}
      <div className="flex flex-col justify-center bg-gradient-to-br from-white to-[#FCF8FD] px-7 py-12 sm:px-10 lg:px-14">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#9D7AB6]">
          <Sparkles size={16} />
          A Story Worth Reading
        </div>

        <h2 className="mt-6 font-serif text-3xl font-semibold leading-tight text-[#43394B] sm:text-4xl lg:text-[43px]">
          {post.title}
        </h2>

        <p className="mt-6 text-sm leading-8 text-[#897D90]">
          Take a little moment for yourself and
          discover something inspiring. Explore
          thoughtful stories, fresh perspectives,
          and ideas that make everyday life more beautiful.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3 text-xs text-[#9C8EA4]">
          <span className="rounded-full bg-[#F0E5F5] px-4 py-2 font-semibold text-[#8765A0]">
            {getCategoryName(post)}
          </span>

          <span>{formatDate(post.created_at)}</span>
        </div>

        <div className="mt-10">
          <Link
            to={`/posts/${post.id}`}
            className="inline-flex items-center gap-3 rounded-full bg-[#8C6AA7] px-8 py-4 text-sm font-bold text-white shadow-[0_10px_25px_rgba(140,106,167,0.2)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#75538F]"
          >
            Read Full Story
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// MAIN HOME COMPONENT
export default function Home() {
  const { user, loading, logout } = useAuth();

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  // FETCH CATEGORIES
  useEffect(() => {
    const controller = new AbortController();

    async function fetchCategories() {
      try {
        const response = await fetch(
          `${API}/api/categories/`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load categories."
          );
        }

        const data = await response.json();

        if (!controller.signal.aborted) {
          setCategories(
            Array.isArray(data)
              ? data
              : data.results || []
          );
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
        }
      }
    }

    fetchCategories();

    return () => controller.abort();
  }, []);

  // FETCH BLOG POSTS
  useEffect(() => {
    const controller = new AbortController();

    async function fetchPosts() {
      try {
        setLoadingPosts(true);
        setError("");

        const params = new URLSearchParams();

        if (search.trim()) {
          params.set(
            "search",
            search.trim()
          );
        }

        if (category) {
          params.set(
            "category",
            category
          );
        }

        const query = params.toString();

        const response = await fetch(
          `${API}/api/posts/${
            query ? `?${query}` : ""
          }`,
          {
            credentials: "include",
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load blog posts."
          );
        }

        const data = await response.json();

        if (!controller.signal.aborted) {
          setPosts(
            Array.isArray(data)
              ? data
              : data.results || []
          );
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingPosts(false);
        }
      }
    }

    const timer = setTimeout(
      fetchPosts,
      300
    );

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, category]);

  const dashboardPath = user?.is_staff
    ? "/admin/dashboard"
    : "/dashboard";

  const featuredPost =
    !search &&
    !category &&
    posts.length > 0
      ? posts[0]
      : null;

  const displayedPosts = featuredPost
    ? posts.slice(1)
    : posts;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#FFFCF9] text-[#43394B]">

      {/* CUSTOM ANIMATIONS */}
      <style>
        {`
          @keyframes lavenderFadeUp {
            from {
              opacity: 0;
              transform: translateY(22px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes lavenderFloat {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-12px);
            }
          }

          @keyframes lavenderGlow {
            0%, 100% {
              opacity: 0.4;
            }
            50% {
              opacity: 0.8;
            }
          }

          html {
            scroll-behavior: smooth;
          }

          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}
      </style>

      {/* ANNOUNCEMENT BAR */}
      <div className="bg-[#8C6AA7] px-4 py-2.5 text-center text-xs font-medium tracking-wide text-white">
        ✦ A cozy corner for beautiful stories,
        little thoughts, and big dreams ✦
      </div>

      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-[#EEE5F0] bg-[#FFFCF9]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-5 md:px-8">

          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-2.5"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEE2F4] text-[#8C6AA7]">
              <Flower2 size={25} />
            </span>

            <span className="font-serif text-3xl font-bold tracking-tight text-[#43394B]">
              My
              <span className="text-[#9C79B5]">
                Blog.
              </span>
            </span>
          </Link>

          {/* DESKTOP LINKS */}
          <nav className="hidden items-center gap-9 lg:flex">
            <a
              href="#stories"
              className="text-sm font-semibold text-[#76697D] transition hover:text-[#936CB0]"
            >
              Explore Stories
            </a>

            <a
              href="#about"
              className="text-sm font-semibold text-[#76697D] transition hover:text-[#936CB0]"
            >
              About Us
            </a>
          </nav>

          {/* AUTH LINKS */}
          <div className="hidden items-center gap-4 lg:flex">
            {!loading &&
              (user ? (
                <>
                  <span className="text-sm text-[#918398]">
                    Hi, {user.username}
                  </span>

                  <Link
                    to={dashboardPath}
                    className="text-sm font-semibold text-[#65566D] hover:text-[#936CB0]"
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/profile"
                    className="text-sm font-semibold text-[#65566D] hover:text-[#936CB0]"
                  >
                    My Profile
                  </Link>

                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex items-center gap-2 rounded-full border border-[#DFCEE9] bg-white px-5 py-2.5 text-sm font-semibold text-[#8765A0] transition hover:bg-[#F4EBF8]"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-semibold text-[#65566D] hover:text-[#936CB0]"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 rounded-full bg-[#8C6AA7] px-6 py-3 text-sm font-bold text-white shadow-[0_6px_20px_rgba(140,106,167,0.15)] transition hover:bg-[#75538F]"
                  >
                    Get Started
                    <ArrowRight size={16} />
                  </Link>
                </>
              ))}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            className="rounded-xl border border-[#E7D9ED] bg-white p-2.5 text-[#75538F] lg:hidden"
            aria-label={
              menuOpen
                ? "Close menu"
                : "Open menu"
            }
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>
        </div>

        {/* MOBILE NAVIGATION */}
        {menuOpen && (
          <nav className="border-t border-[#EEE5F0] bg-white px-6 py-6 lg:hidden">
            <div className="flex flex-col gap-5">
              <a
                href="#stories"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="text-sm font-semibold text-[#65566D]"
              >
                Explore Stories
              </a>

              <a
                href="#about"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="text-sm font-semibold text-[#65566D]"
              >
                About Us
              </a>

              {!loading &&
                (user ? (
                  <>
                    <span className="text-sm text-[#918398]">
                      Hi, {user.username}
                    </span>

                    <Link
                      to={dashboardPath}
                      onClick={() =>
                        setMenuOpen(false)
                      }
                      className="flex items-center gap-2 text-sm font-semibold text-[#65566D]"
                    >
                      <PenLine size={17} />
                      Dashboard
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() =>
                        setMenuOpen(false)
                      }
                      className="flex items-center gap-2 text-sm font-semibold text-[#65566D]"
                    >
                      <UserRound size={17} />
                      My Profile
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2 text-sm font-semibold text-[#8C6AA7]"
                    >
                      <LogOut size={17} />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() =>
                        setMenuOpen(false)
                      }
                      className="text-sm font-semibold text-[#65566D]"
                    >
                      Login
                    </Link>

                    <Link
                      to="/register"
                      onClick={() =>
                        setMenuOpen(false)
                      }
                      className="inline-flex w-fit items-center gap-2 rounded-full bg-[#8C6AA7] px-6 py-3 text-sm font-bold text-white"
                    >
                      Get Started
                      <ArrowRight size={16} />
                    </Link>
                  </>
                ))}
            </div>
          </nav>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#F5EBF8] via-[#FBF3FA] to-[#FFF1E8]">

        {/* DECORATIVE CIRCLES */}
        <div className="pointer-events-none absolute -left-28 top-10 h-80 w-80 rounded-full bg-[#E4CEF0]/50 blur-3xl" />

        <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[#F3DDEB]/60 blur-3xl" />

        <div className="pointer-events-none absolute left-[15%] top-[22%] hidden text-[#C5A6D7]/40 md:block">
          <Flower2
            size={55}
            strokeWidth={1}
            style={{
              animation:
                "lavenderFloat 6s ease-in-out infinite",
            }}
          />
        </div>

        <div className="pointer-events-none absolute right-[13%] top-[25%] hidden text-[#C9ADD9]/50 md:block">
          <Sparkles
            size={40}
            strokeWidth={1}
            style={{
              animation:
                "lavenderFloat 5s ease-in-out infinite",
            }}
          />
        </div>

        {/* HERO CONTENT */}
        <div className="relative mx-auto max-w-7xl px-5 py-24 text-center md:px-8 md:py-32">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E3D1EB] bg-white/80 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.17em] text-[#916EAA] shadow-sm">
            <Flower2 size={15} />
            Welcome to MyBlog
          </span>

          <h1 className="mx-auto mt-9 max-w-5xl font-serif text-5xl font-semibold leading-[1.15] tracking-tight text-[#43394B] sm:text-6xl lg:text-[76px]">
            A little space for
            <br />
            <span className="italic text-[#9D79B6]">
              beautiful stories.
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-[#887B8F] md:text-lg">
            Slow down, get inspired, and explore
            stories that make you feel something.
            A welcoming place for readers,
            dreamers, and creative minds.
          </p>

          {/* HERO BUTTONS */}
          <div className="mt-11 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#stories"
              className="inline-flex items-center gap-3 rounded-full bg-[#8C6AA7] px-9 py-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(140,106,167,0.22)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#75538F]"
            >
              Explore Stories
              <ArrowRight size={18} />
            </a>

            {!loading && (
              <Link
                to={
                  user
                    ? dashboardPath
                    : "/register"
                }
                className="inline-flex items-center gap-3 rounded-full border border-[#DCC6E8] bg-white/80 px-9 py-4 text-sm font-bold text-[#8765A0] transition-all duration-300 hover:-translate-y-1 hover:bg-white"
              >
                {user
                  ? "My Dashboard"
                  : "Start Writing"}
                <PenLine size={17} />
              </Link>
            )}
          </div>

          {/* SMALL DECORATIVE TEXT */}
          <div className="mt-16 flex items-center justify-center gap-3 text-sm text-[#A08DAA]">
            <Feather
              size={17}
              className="text-[#B393C6]"
            />
            Read. Write. Dream.
            <Feather
              size={17}
              className="text-[#B393C6]"
            />
          </div>

          <a
            href="#featured"
            className="mt-10 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#A08DAA] transition hover:text-[#8765A0]"
          >
            Scroll to discover
            <ChevronDown size={16} />
          </a>
        </div>
      </section>

      {/* FEATURED STORY */}
      {!loadingPosts &&
        !error &&
        featuredPost && (
          <section
            id="featured"
            className="mx-auto max-w-7xl scroll-mt-28 px-5 pt-20 md:px-8"
          >
            <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#9875B1]">
                  <Star size={15} />
                  Handpicked For You
                </span>

                <h2 className="mt-4 font-serif text-3xl font-semibold text-[#43394B] md:text-4xl">
                  Featured Story
                  <span className="text-[#B69AC8]">
                    .
                  </span>
                </h2>

                <p className="mt-3 text-sm text-[#928598]">
                  A little inspiration to brighten your day.
                </p>
              </div>

              <a
                href="#stories"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#8C6AA7] hover:text-[#694B84]"
              >
                Browse All Stories
                <ArrowRight size={17} />
              </a>
            </div>

            <FeaturedArticle
              post={featuredPost}
            />
          </section>
        )}

      {/* LATEST STORIES */}
      <section
        id="stories"
        className="mx-auto max-w-7xl scroll-mt-28 px-5 py-20 md:px-8 md:py-24"
      >
        {/* SECTION HEADING */}
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#9875B1]">
              <Sparkles size={15} />
              From Our Community
            </span>

            <h2 className="mt-4 font-serif text-4xl font-semibold text-[#43394B] md:text-5xl">
              Latest Stories
              <span className="text-[#B69AC8]">
                .
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-[#928598]">
              Discover meaningful thoughts,
              creative ideas, and lovely stories
              shared by our writers.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[#E8DDEF] bg-white px-5 py-3 text-xs font-semibold text-[#9471AD]">
            <BookOpen size={16} />
            Stories to explore
          </div>
        </div>

        {/* SEARCH AND FILTER PANEL */}
        <div className="mb-11 rounded-[28px] border border-[#E9DFEF] bg-white p-5 shadow-[0_12px_40px_rgba(105,83,125,0.05)]">
          <div className="grid gap-4 md:grid-cols-[1fr_240px]">

            {/* SEARCH */}
            <div className="relative">
              <Search
                size={20}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-[#AC99B7]"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search for something inspiring..."
                className="w-full rounded-2xl border border-[#E9DFEF] bg-[#FCF8FD] py-4 pl-14 pr-5 text-sm text-[#43394B] placeholder:text-[#AA9CAF] outline-none transition focus:border-[#B69AC8] focus:ring-2 focus:ring-[#B69AC8]/20"
                aria-label="Search stories"
              />
            </div>

            {/* CATEGORY SELECT */}
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="w-full cursor-pointer rounded-2xl border border-[#E9DFEF] bg-[#FCF8FD] px-5 py-4 text-sm font-medium text-[#65566D] outline-none transition focus:border-[#B69AC8] focus:ring-2 focus:ring-[#B69AC8]/20"
              aria-label="Filter by category"
            >
              <option value="">
                All Categories
              </option>

              {categories.map((item) => (
                <option
                  key={item.id}
                  value={item.slug}
                >
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* CATEGORY BUTTONS */}
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setCategory("")
              }
              className={`rounded-full px-5 py-2.5 text-xs font-bold transition ${
                category === ""
                  ? "bg-[#8C6AA7] text-white"
                  : "bg-[#F3EBF7] text-[#8969A0] hover:bg-[#EADDF1]"
              }`}
            >
              All Stories
            </button>

            {categories.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setCategory(item.slug)
                }
                className={`rounded-full px-5 py-2.5 text-xs font-bold transition ${
                  category === item.slug
                    ? "bg-[#8C6AA7] text-white"
                    : "bg-[#F3EBF7] text-[#8969A0] hover:bg-[#EADDF1]"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <p
            role="alert"
            className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {/* LOADING SKELETON */}
        {loadingPosts ? (
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <div
                  key={item}
                  className="h-[440px] animate-pulse rounded-[28px] bg-[#EEE4F3]"
                />
              )
            )}
          </div>
        ) : posts.length === 0 ? (
          /* EMPTY STATE */
          <div className="rounded-[30px] border border-[#E9DFEF] bg-white px-6 py-20 text-center">
            <Flower2
              size={50}
              className="mx-auto mb-6 text-[#B69AC8]"
            />

            <h3 className="font-serif text-3xl font-semibold text-[#43394B]">
              No stories found
            </h3>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#928598]">
              Try another search or category.
              Only approved and published posts
              appear here.
            </p>

            {(search || category) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("");
                }}
                className="mt-7 rounded-full bg-[#8C6AA7] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#75538F]"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : displayedPosts.length === 0 ? (
          <div className="rounded-[30px] border border-[#E9DFEF] bg-white px-6 py-16 text-center">
            <Flower2
              size={35}
              className="mx-auto mb-4 text-[#B69AC8]"
            />

            <p className="text-sm text-[#928598]">
              You're all caught up!
              Explore our featured story above.
            </p>
          </div>
        ) : (
          /* BLOG GRID */
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {displayedPosts.map(
              (post, index) => (
                <ArticleCard
                  key={post.id}
                  post={post}
                  index={index}
                />
              )
            )}
          </div>
        )}
      </section>

      {/* COMMUNITY SECTION */}
      <section className="border-y border-[#E9DFEF] bg-[#F8F1FA]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-3 md:px-8">

          {/* FEATURE 1 */}
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#9D79B6] shadow-sm">
              <BookOpen size={25} />
            </div>

            <h3 className="mt-5 font-serif text-xl font-semibold text-[#43394B]">
              Discover Stories
            </h3>

            <p className="mt-3 text-sm leading-7 text-[#918398]">
              Explore interesting articles
              and discover fresh perspectives.
            </p>
          </div>

          {/* FEATURE 2 */}
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#9D79B6] shadow-sm">
              <PenTool size={25} />
            </div>

            <h3 className="mt-5 font-serif text-xl font-semibold text-[#43394B]">
              Share Your Voice
            </h3>

            <p className="mt-3 text-sm leading-7 text-[#918398]">
              Express your ideas and
              share meaningful experiences.
            </p>
          </div>

          {/* FEATURE 3 */}
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#9D79B6] shadow-sm">
              <Heart size={25} />
            </div>

            <h3 className="mt-5 font-serif text-xl font-semibold text-[#43394B]">
              Connect & Inspire
            </h3>

            <p className="mt-3 text-sm leading-7 text-[#918398]">
              Be part of a community
              that values every story.
            </p>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section
        id="about"
        className="relative overflow-hidden bg-gradient-to-br from-[#F2E6F7] via-[#FBF3FA] to-[#FFF0E8]"
      >
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#E2CBEF]/50 blur-3xl" />

        <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[#F1D7E8]/50 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-5 py-24 text-center md:px-8 md:py-28">
          <span className="inline-flex h-18 w-18 items-center justify-center rounded-full bg-white p-5 text-[#9D79B6] shadow-md">
            <Flower2
              size={32}
              strokeWidth={1.4}
            />
          </span>

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.25em] text-[#9875B1]">
            A Place To Belong
          </p>

          <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight text-[#43394B] md:text-5xl">
            Every story deserves
            <br />
            to be{" "}
            <span className="italic text-[#9D79B6]">
              heard.
            </span>
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-[#887B8F]">
            MyBlog is a cozy digital space
            where creativity blooms, ideas grow,
            and every voice matters.
            Whether you love reading or writing,
            there's always a place for you here.
          </p>

          <div className="mt-10">
            <Link
              to={
                user
                  ? dashboardPath
                  : "/register"
              }
              className="inline-flex items-center gap-3 rounded-full bg-[#8C6AA7] px-9 py-4 text-sm font-bold text-white shadow-[0_10px_25px_rgba(140,106,167,0.2)] transition-all hover:-translate-y-1 hover:bg-[#75538F]"
            >
              {user
                ? "Go to Dashboard"
                : "Join Our Community"}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#493B55] text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-3 md:px-8">

          {/* BRAND */}
          <div>
            <Link
              to="/"
              className="flex items-center gap-2 font-serif text-3xl font-bold"
            >
              <Flower2
                size={25}
                className="text-[#D8BCE7]"
              />
              My
              <span className="text-[#D8BCE7]">
                Blog.
              </span>
            </Link>

            <p className="mt-6 max-w-xs text-sm leading-8 text-[#D6C9DE]">
              A little corner of the internet
              for thoughtful words,
              beautiful stories,
              and creative souls.
            </p>
          </div>

          {/* EXPLORE */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.17em] text-[#E5CFF0]">
              Explore
            </h3>

            <div className="mt-6 flex flex-col gap-4 text-sm text-[#D6C9DE]">
              <a
                href="#stories"
                className="transition hover:text-white"
              >
                Latest Stories
              </a>

              <a
                href="#about"
                className="transition hover:text-white"
              >
                About MyBlog
              </a>

              <Link
                to={
                  user
                    ? dashboardPath
                    : "/register"
                }
                className="transition hover:text-white"
              >
                Start Writing
              </Link>
            </div>
          </div>

          {/* PHILOSOPHY */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.17em] text-[#E5CFF0]">
              A Little Reminder
            </h3>

            <p className="mt-6 text-sm leading-8 text-[#D6C9DE]">
              Every great story starts
              with a single thought.
              Keep dreaming, keep writing,
              and keep sharing your world.
            </p>

            <div className="mt-5 flex items-center gap-2 text-[#D8BCE7]">
              <Coffee size={17} />
              <span className="text-xs">
                Made for curious minds.
              </span>
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-white/15">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-6 text-center text-xs text-[#D6C9DE] md:flex-row md:px-8">
            <p>
              © {new Date().getFullYear()} MyBlog.
              Made with love for stories that matter.
            </p>

            <a
              href="#stories"
              className="inline-flex items-center gap-2 transition hover:text-white"
            >
              Back to Stories
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
