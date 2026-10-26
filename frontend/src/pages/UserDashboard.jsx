
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  Pencil,
  Plus,
  Trash2,
  UserRound,
  Flower2,
  Sparkles,
  LayoutDashboard,
  Feather,
  CalendarDays,
  Heart,
  Home,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API = "http://127.0.0.1:8000";

// CSRF COOKIE HELPER
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

// POST STATUS COLORS
function getStatusStyle(status) {
  switch (status) {
    case "approved":
      return "bg-[#E7F5ED] text-[#357B56] border-[#CDE8D7]";

    case "pending":
      return "bg-[#FFF3DF] text-[#A77730] border-[#F3DFB8]";

    case "rejected":
      return "bg-[#FDEBEC] text-[#B75C68] border-[#F4CDD2]";

    default:
      return "bg-[#F2EDF5] text-[#887B8F] border-[#E6DDEB]";
  }
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

// IMAGE HELPER
function getImageUrl(image) {
  if (!image || typeof image !== "string") {
    return null;
  }

  if (image.startsWith("http")) {
    return image;
  }

  return `${API}${image.startsWith("/") ? "" : "/"}${image}`;
}

// SIDEBAR LINK
function SidebarLink({ to, icon: Icon, children, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
        active
          ? "bg-[#8C6AA7] text-white shadow-[0_8px_20px_rgba(140,106,167,0.18)]"
          : "text-[#81728A] hover:bg-[#F2E8F6] hover:text-[#76538F]"
      }`}
    >
      <Icon size={19} />
      {children}
    </Link>
  );
}

// STATISTICS CARD
function StatCard({ label, value, icon: Icon, color, background, loading }) {
  return (
    <div className="rounded-[26px] border border-[#E9DFEF] bg-white p-6 shadow-[0_10px_35px_rgba(105,83,125,0.045)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(105,83,125,0.1)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#94869C]">
            {label}
          </p>

          <h3 className="mt-4 font-serif text-4xl font-semibold text-[#43394B]">
            {loading ? "..." : value}
          </h3>
        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${background}`}
        >
          <Icon size={25} className={color} />
        </div>
      </div>

      <div className="mt-5 h-1 w-12 rounded-full bg-[#E7D8ED]" />
    </div>
  );
}

export default function UserDashboard() {
  const { user, loading } = useAuth();

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  // FETCH USER POSTS
  async function fetchMyPosts() {
    try {
      setPostsLoading(true);
      setError("");

      const response = await fetch(
        `${API}/api/my-posts/`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load your posts.");
      }

      const data = await response.json();

      setPosts(
        Array.isArray(data) ? data : data.results || []
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setPostsLoading(false);
    }
  }

  useEffect(() => {
    if (loading) return;

    if (!user) {
      setPostsLoading(false);
      return;
    }

    fetchMyPosts();
  }, [user, loading]);

  // DELETE POST
  async function handleDelete(post) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${post.title}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(post.id);
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

      const csrfData = await csrfResponse.json();

      const csrfToken =
        getCookie("csrftoken") ||
        csrfData.csrfToken;

      if (!csrfToken) {
        throw new Error(
          "CSRF token missing. Please refresh the page."
        );
      }

      // DELETE REQUEST
      const response = await fetch(
        `${API}/api/my-posts/${post.id}/`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "X-CSRFToken": csrfToken,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete post.");
      }

      setPosts((previous) =>
        previous.filter(
          (item) => item.id !== post.id
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  // LOADING SCREEN
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFCF9]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#EADCF1] border-t-[#8C6AA7]" />

          <p className="text-sm text-[#887B8F]">
            Loading dashboard...
          </p>
        </div>
      </main>
    );
  }

  // NOT LOGGED IN
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFCF9] px-5">
        <div className="w-full max-w-lg rounded-[30px] border border-[#E9DFEF] bg-white p-10 text-center shadow-[0_20px_60px_rgba(105,83,125,0.08)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#F0E5F5]">
            <UserRound
              size={35}
              className="text-[#9D79B6]"
            />
          </div>

          <h2 className="mt-7 font-serif text-3xl font-semibold">
            Please Log In
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#918398]">
            Sign in to manage your stories and
            continue your writing journey.
          </p>

          <Link
            to="/login"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#8C6AA7] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#75538F]"
          >
            Go to Login
            <ArrowRight size={17} />
          </Link>
        </div>
      </main>
    );
  }

  // STATISTICS
  const approvedPosts = posts.filter(
    (post) => post.approval_status === "approved"
  ).length;

  const pendingPosts = posts.filter(
    (post) => post.approval_status === "pending"
  ).length;

  const rejectedPosts = posts.filter(
    (post) => post.approval_status === "rejected"
  ).length;

  const stats = [
    {
      label: "Total Stories",
      value: posts.length,
      icon: FileText,
      background: "bg-[#F0E5F5]",
      color: "text-[#8C6AA7]",
    },
    {
      label: "Published",
      value: approvedPosts,
      icon: CheckCircle2,
      background: "bg-[#E7F5ED]",
      color: "text-[#357B56]",
    },
    {
      label: "Pending Review",
      value: pendingPosts,
      icon: Clock3,
      background: "bg-[#FFF3DF]",
      color: "text-[#A77730]",
    },
    {
      label: "Rejected",
      value: rejectedPosts,
      icon: AlertCircle,
      background: "bg-[#FDEBEC]",
      color: "text-[#B75C68]",
    },
  ];

  return (
    <main className="min-h-screen bg-[#FFFCF9] text-[#43394B]">

      <div className="flex min-h-screen">

        {/* DESKTOP SIDEBAR */}
        <aside className="sticky top-0 hidden h-screen w-[270px] shrink-0 flex-col border-r border-[#E9DFEF] bg-white px-5 py-8 lg:flex">

          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-3 px-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0E5F5] text-[#8C6AA7]">
              <Flower2 size={26} />
            </div>

            <span className="font-serif text-2xl font-bold">
              My
              <span className="text-[#9C79B5]">
                Blog.
              </span>
            </span>
          </Link>

          {/* SIDEBAR NAVIGATION */}
          <div className="mt-12">
            <p className="mb-5 px-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#B2A4BA]">
              Workspace
            </p>

            <nav className="space-y-2">
              <SidebarLink
                to="/dashboard"
                icon={LayoutDashboard}
                active
              >
                Overview
              </SidebarLink>

              <SidebarLink
                to="/create-post"
                icon={Feather}
              >
                Write a Story
              </SidebarLink>

              <SidebarLink
                to="/profile"
                icon={UserRound}
              >
                My Profile
              </SidebarLink>

              <SidebarLink
                to="/"
                icon={Home}
              >
                Explore Blog
              </SidebarLink>
            </nav>
          </div>

          {/* SIDEBAR BOTTOM CARD */}
          <div className="mt-auto">
            <div className="rounded-[24px] bg-gradient-to-br from-[#F0E5F5] to-[#FFF0E8] p-5">
              <Sparkles
                size={24}
                className="text-[#9D79B6]"
              />

              <p className="mt-4 font-serif text-lg font-semibold">
                Keep creating!
              </p>

              <p className="mt-2 text-xs leading-6 text-[#918398]">
                Every beautiful story begins
                with a single thought.
              </p>

              <Link
                to="/create-post"
                className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#8C6AA7]"
              >
                Start Writing
                <ArrowRight size={15} />
              </Link>
            </div>

            <p className="mt-7 text-center text-xs text-[#B0A2B7]">
              © {new Date().getFullYear()} MyBlog
            </p>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="min-w-0 flex-1">

          {/* TOP BAR */}
          <header className="border-b border-[#E9DFEF] bg-white px-5 py-5 sm:px-8 lg:px-10">
            <div className="flex flex-wrap items-center justify-between gap-4">

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A58CB6]">
                  Writer Workspace
                </p>

                <h2 className="mt-1 font-serif text-xl font-semibold">
                  My Dashboard
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/"
                  className="hidden items-center gap-2 text-sm font-semibold text-[#887B8F] transition hover:text-[#8C6AA7] sm:inline-flex"
                >
                  <ArrowLeft size={17} />
                  Home
                </Link>

                <Link
                  to="/profile"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F0E5F5] font-bold text-[#8C6AA7]"
                  title="My Profile"
                >
                  {user.username?.charAt(0).toUpperCase()}
                </Link>
              </div>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">

            {/* MOBILE NAVIGATION */}
            <nav className="mb-7 flex flex-wrap gap-2 lg:hidden">
              <Link
                to="/dashboard"
                className="rounded-full bg-[#8C6AA7] px-4 py-2.5 text-xs font-bold text-white"
              >
                Overview
              </Link>

              <Link
                to="/create-post"
                className="rounded-full bg-[#F0E5F5] px-4 py-2.5 text-xs font-bold text-[#8C6AA7]"
              >
                Write a Story
              </Link>

              <Link
                to="/profile"
                className="rounded-full bg-[#F0E5F5] px-4 py-2.5 text-xs font-bold text-[#8C6AA7]"
              >
                My Profile
              </Link>

              <Link
                to="/"
                className="rounded-full bg-[#F0E5F5] px-4 py-2.5 text-xs font-bold text-[#8C6AA7]"
              >
                Explore Blog
              </Link>
            </nav>

            {/* WELCOME BANNER */}
            <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A889BE] via-[#9C7BB6] to-[#81609B] px-7 py-10 text-white sm:px-10 sm:py-12">

              <div className="pointer-events-none absolute -right-10 -top-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />

              <div className="pointer-events-none absolute bottom-5 right-12 hidden text-white/15 md:block">
                <Flower2
                  size={150}
                  strokeWidth={0.8}
                />
              </div>

              <div className="relative z-10 max-w-xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-xs font-bold backdrop-blur-sm">
                  <Sparkles size={15} />
                  Your Creative Space
                </span>

                <h1 className="mt-6 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
                  Welcome back,
                  <br />
                  {user.username}!
                </h1>

                <p className="mt-5 text-sm leading-8 text-[#F4E8F8]">
                  Your stories have the power to
                  inspire. Keep sharing your ideas
                  and let your creativity bloom.
                </p>

                <Link
                  to="/create-post"
                  className="mt-7 inline-flex items-center gap-3 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#8C6AA7] transition-all hover:-translate-y-0.5 hover:bg-[#F7EFFA]"
                >
                  <Plus size={18} />
                  Create New Post
                  <ArrowRight size={17} />
                </Link>
              </div>
            </section>

            {/* STATISTICS */}
            <section className="mt-9">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0E5F5] text-[#8C6AA7]">
                  <LayoutDashboard size={20} />
                </div>

                <div>
                  <h2 className="font-serif text-2xl font-semibold">
                    Your Overview
                  </h2>

                  <p className="mt-1 text-xs text-[#918398]">
                    A quick look at your writing journey.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <StatCard
                    key={stat.label}
                    {...stat}
                    loading={postsLoading}
                  />
                ))}
              </div>
            </section>

            {/* MY POSTS SECTION */}
            <section className="mt-10 overflow-hidden rounded-[30px] border border-[#E9DFEF] bg-white shadow-[0_12px_40px_rgba(105,83,125,0.045)]">

              {/* POSTS HEADER */}
              <div className="flex flex-wrap items-center justify-between gap-5 border-b border-[#F0E8F2] px-6 py-7 sm:px-8">

                <div>
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#9D79B6]">
                    <Feather size={15} />
                    Your Writing
                  </span>

                  <h2 className="mt-3 font-serif text-2xl font-semibold sm:text-3xl">
                    My Blog Posts
                  </h2>

                  <p className="mt-2 text-sm text-[#918398]">
                    View, edit, and manage your stories.
                  </p>
                </div>

                <Link
                  to="/create-post"
                  className="inline-flex items-center gap-2 rounded-full border border-[#DCC6E8] bg-[#F7F0FA] px-5 py-3 text-sm font-bold text-[#8C6AA7] transition hover:bg-[#EDE0F3]"
                >
                  <Plus size={17} />
                  New Post
                </Link>
              </div>

              {/* POSTS CONTENT */}
              <div className="p-5 sm:p-8">

                {/* ERROR MESSAGE */}
                {error && (
                  <div
                    role="alert"
                    className="mb-7 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
                  >
                    <AlertCircle
                      size={20}
                      className="shrink-0"
                    />
                    {error}
                  </div>
                )}

                {/* LOADING SKELETON */}
                {postsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="h-32 animate-pulse rounded-2xl bg-[#F3EBF7]"
                      />
                    ))}
                  </div>
                ) : posts.length === 0 ? (
                  /* EMPTY STATE */
                  <div className="rounded-[26px] bg-[#FCF8FD] px-6 py-16 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#F0E5F5]">
                      <BookOpen
                        size={36}
                        className="text-[#9D79B6]"
                      />
                    </div>

                    <h3 className="mt-6 font-serif text-2xl font-semibold">
                      Your Story Starts Here
                    </h3>

                    <p className="mx-auto mt-4 max-w-md text-sm leading-8 text-[#918398]">
                      You haven't created any blog posts yet.
                      Start writing and share your first
                      story with the MyBlog community.
                    </p>

                    <Link
                      to="/create-post"
                      className="mt-7 inline-flex items-center gap-3 rounded-full bg-[#8C6AA7] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#75538F]"
                    >
                      <Plus size={17} />
                      Write Your First Post
                    </Link>
                  </div>
                ) : (
                  /* POST LIST */
                  <div className="space-y-5">
                    {posts.map((post) => {
                      const image = getImageUrl(
                        post.image_url || post.image
                      );

                      return (
                        <article
                          key={post.id}
                          className="group overflow-hidden rounded-[24px] border border-[#E9DFEF] bg-[#FFFCFE] transition-all duration-300 hover:border-[#D7BCE5] hover:shadow-[0_12px_35px_rgba(105,83,125,0.07)]"
                        >
                          <div className="flex flex-col gap-5 p-5 sm:p-6 md:flex-row md:items-start">

                            {/* POST THUMBNAIL */}
                            <div className="flex h-36 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#E9DDF1] to-[#FFF0E8] md:h-32 md:w-44">
                              {image ? (
                                <img
                                  src={image}
                                  alt={post.title}
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              ) : (
                                <Flower2
                                  size={42}
                                  strokeWidth={1.2}
                                  className="text-[#B69AC8]"
                                />
                              )}
                            </div>

                            {/* POST DETAILS */}
                            <div className="min-w-0 flex-1">

                              {/* TITLE AND STATUS */}
                              <div className="flex flex-wrap items-start gap-3">
                                <h3 className="min-w-0 break-words font-serif text-xl font-semibold leading-snug text-[#43394B] sm:text-[23px]">
                                  {post.title}
                                </h3>

                                <span
                                  className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-[11px] font-bold capitalize ${getStatusStyle(
                                    post.approval_status
                                  )}`}
                                >
                                  {post.approval_status || "Unknown"}
                                </span>
                              </div>

                              {/* META DETAILS */}
                              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#918398]">
                                <span className="inline-flex items-center gap-2">
                                  <BookOpen
                                    size={15}
                                    className="text-[#A887BE]"
                                  />
                                  {post.category_name || "General"}
                                </span>

                                {post.created_at && (
                                  <span className="inline-flex items-center gap-2">
                                    <CalendarDays
                                      size={15}
                                      className="text-[#A887BE]"
                                    />
                                    {formatDate(post.created_at)}
                                  </span>
                                )}
                              </div>

                              {/* REJECTION REASON */}
                              {post.rejection_reason && (
                                <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                                  <p className="text-sm leading-6 text-red-700">
                                    <span className="font-bold">
                                      Reason:{" "}
                                    </span>
                                    {post.rejection_reason}
                                  </p>
                                </div>
                              )}

                              {/* ACTION BUTTONS */}
                              <div className="mt-5 flex flex-wrap items-center gap-3">
                                {post.approval_status === "approved" && (
                                  <Link
                                    to={`/posts/${post.id}`}
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#F0E5F5] px-4 py-2.5 text-xs font-bold text-[#8C6AA7] transition hover:bg-[#E6D5EF]"
                                  >
                                    <Eye size={15} />
                                    View
                                  </Link>
                                )}

                                <Link
                                  to={`/edit-post/${post.id}`}
                                  className="inline-flex items-center gap-2 rounded-xl border border-[#E0CFE9] bg-white px-4 py-2.5 text-xs font-bold text-[#8C6AA7] transition hover:bg-[#F7F0FA]"
                                >
                                  <Pencil size={15} />
                                  Edit
                                </Link>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(post)
                                  }
                                  disabled={deletingId === post.id}
                                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <Trash2 size={15} />
                                  {deletingId === post.id
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* BOTTOM MESSAGE */}
            <div className="mt-10 flex flex-col items-center justify-between gap-5 rounded-[26px] bg-[#F3E9F7] px-7 py-7 text-center sm:flex-row sm:text-left">
              <div className="flex items-center gap-3">
                <Heart
                  size={23}
                  className="shrink-0 text-[#9D79B6]"
                />

                <p className="text-sm font-medium text-[#765F83]">
                  Keep writing. Your words matter.
                </p>
              </div>

              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#8C6AA7] transition hover:text-[#694B84]"
              >
                Explore Stories
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
