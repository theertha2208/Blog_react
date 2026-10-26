
import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  MessageSquare,
  Users,
  LogOut,
  ArrowUpRight,
  ArrowRight,
  Menu,
  X,
  BookOpen,
  Clock3,
  UserRound,
  Flower2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Feather,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/api";

// ADMIN NAVIGATION
const navigation = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
  },
  {
    label: "Manage Posts",
    icon: FileText,
    path: "/admin/posts",
  },
  {
    label: "Categories",
    icon: FolderOpen,
    path: "/admin/categories",
  },
  {
    label: "Comments",
    icon: MessageSquare,
    path: "/admin/comments",
  },
  {
    label: "Users",
    icon: Users,
    path: "/admin/users",
  },
];

// STAT CARD
function StatCard({
  label,
  value,
  icon: Icon,
  background,
  iconColor,
  loading,
}) {
  return (
    <div className="group rounded-[26px] border border-[#E9DFEF] bg-white p-6 shadow-[0_10px_35px_rgba(105,83,125,0.045)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(105,83,125,0.1)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#94869C]">
            {label}
          </p>

          <h3 className="mt-5 font-serif text-4xl font-semibold text-[#43394B]">
            {loading ? "..." : value}
          </h3>
        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${background}`}
        >
          <Icon size={25} className={iconColor} />
        </div>
      </div>

      <div className="mt-6 h-1 w-12 rounded-full bg-[#E7D8ED]" />
    </div>
  );
}

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // LOAD ADMIN STATISTICS
  useEffect(() => {
    if (!user?.is_staff) {
      setStatsLoading(false);
      return;
    }

    let active = true;

    async function loadStats() {
      try {
        setStatsLoading(true);
        setError("");

        const data = await apiRequest(
          "/api/admin/stats/"
        );

        if (active) {
          setStats(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err.message ||
              "Unable to load dashboard statistics."
          );
        }
      } finally {
        if (active) {
          setStatsLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      active = false;
    };
  }, [user?.id, user?.is_staff]);

  // LOGOUT
  async function handleLogout() {
    try {
      setLoggingOut(true);
      setError("");

      await logout();

      navigate("/login", {
        replace: true,
      });
    } catch (err) {
      setError(
        err.message || "Unable to log out."
      );
    } finally {
      setLoggingOut(false);
    }
  }

  // LOADING
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

  // ADMIN PROTECTION
  if (!user?.is_staff) {
    return <Navigate to="/login" replace />;
  }

  const cards = [
    {
      label: "Total Posts",
      value: stats?.total_posts ?? "—",
      icon: FileText,
      background: "bg-[#F0E5F5]",
      iconColor: "text-[#8C6AA7]",
    },
    {
      label: "Pending Posts",
      value: stats?.pending_posts ?? "—",
      icon: Clock3,
      background: "bg-[#FFF3DF]",
      iconColor: "text-[#A77730]",
    },
    {
      label: "Total Users",
      value: stats?.total_users ?? "—",
      icon: Users,
      background: "bg-[#E7F5ED]",
      iconColor: "text-[#357B56]",
    },
    {
      label: "Total Comments",
      value: stats?.total_comments ?? "—",
      icon: MessageSquare,
      background: "bg-[#F8E8F2]",
      iconColor: "text-[#A36A97]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFFCF9] text-[#43394B]">

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-[270px] flex-col border-r border-[#E9DFEF] bg-white shadow-[5px_0_30px_rgba(105,83,125,0.03)] transition-transform duration-300 lg:translate-x-0 ${
          menuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* LOGO */}
        <div className="flex items-center justify-between border-b border-[#F0E8F2] px-6 py-7">
          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F0E5F5] text-[#8C6AA7]">
              <Flower2 size={25} />
            </div>

            <span className="font-serif text-2xl font-bold">
              My
              <span className="text-[#9C79B5]">
                Blog.
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="rounded-xl p-2 text-[#887B8F] hover:bg-[#F2E8F6] lg:hidden"
          >
            <X size={21} />
          </button>
        </div>

        {/* SIDEBAR NAVIGATION */}
        <div className="flex-1 overflow-y-auto px-5 py-8">
          <p className="px-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#B2A4BA]">
            Administration
          </p>

          <nav className="mt-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active =
                item.path === "/admin/dashboard";

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() =>
                    setMenuOpen(false)
                  }
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all ${
                    active
                      ? "bg-[#8C6AA7] text-white shadow-[0_8px_20px_rgba(140,106,167,0.18)]"
                      : "text-[#81728A] hover:bg-[#F2E8F6] hover:text-[#76538F]"
                  }`}
                >
                  <Icon size={19} />

                  <span>{item.label}</span>

                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* WEBSITE LINK */}
          <div className="mt-9 border-t border-[#F0E8F2] pt-7">
            <p className="mb-4 px-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#B2A4BA]">
              Website
            </p>

            <Link
              to="/"
              onClick={() =>
                setMenuOpen(false)
              }
              className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold text-[#81728A] transition hover:bg-[#F2E8F6] hover:text-[#76538F]"
            >
              <BookOpen size={19} />
              View Website

              <ArrowUpRight
                size={16}
                className="ml-auto"
              />
            </Link>
          </div>

          {/* SIDEBAR DECORATIVE CARD */}
          <div className="mt-10 rounded-[24px] bg-gradient-to-br from-[#F0E5F5] to-[#FFF0E8] p-5">
            <Sparkles
              size={24}
              className="text-[#9D79B6]"
            />

            <h3 className="mt-4 font-serif text-lg font-semibold">
              A Creative Space
            </h3>

            <p className="mt-2 text-xs leading-6 text-[#918398]">
              Keep your community inspiring,
              welcoming, and full of beautiful stories.
            </p>
          </div>
        </div>

        {/* SIDEBAR FOOTER */}
        <div className="border-t border-[#F0E8F2] p-5">
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-[#F8F3FA] p-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E9DDF1] text-[#8C6AA7]">
              <UserRound size={21} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold">
                {user.username}
              </p>

              <p className="mt-1 text-xs text-[#94869C]">
                Administrator
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-[#887B8F] transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={19} />
            {loggingOut
              ? "Logging out..."
              : "Logout"}
          </button>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {menuOpen && (
        <button
          type="button"
          onClick={() =>
            setMenuOpen(false)
          }
          aria-label="Close navigation"
          className="fixed inset-0 z-20 bg-[#43394B]/40 lg:hidden"
        />
      )}

      {/* MAIN CONTENT */}
      <div className="lg:ml-[270px]">

        {/* TOP HEADER */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E9DFEF] bg-white/95 px-5 py-5 backdrop-blur-xl sm:px-8 lg:px-10">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                setMenuOpen(true)
              }
              aria-label="Open menu"
              className="rounded-xl p-2 text-[#43394B] hover:bg-[#F2E8F6] lg:hidden"
            >
              <Menu size={23} />
            </button>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A58CB6]">
                Administration
              </p>

              <h2 className="mt-1 font-serif text-xl font-semibold">
                Dashboard Overview
              </h2>
            </div>
          </div>

          <Link
            to="/profile"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F0E5F5] font-bold text-[#8C6AA7]"
            title="My Profile"
          >
            {user.username?.charAt(0).toUpperCase()}
          </Link>
        </header>

        {/* DASHBOARD CONTENT */}
        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">

          {/* WELCOME BANNER */}
          <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A889BE] via-[#9C7BB6] to-[#81609B] px-7 py-10 text-white sm:px-10 sm:py-12">
            <div className="pointer-events-none absolute -right-12 -top-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />

            <div className="pointer-events-none absolute bottom-3 right-12 hidden text-white/15 md:block">
              <Flower2
                size={150}
                strokeWidth={0.8}
              />
            </div>

            <div className="relative z-10 max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-xs font-bold backdrop-blur-sm">
                <ShieldCheck size={15} />
                Admin Workspace
              </span>

              <h1 className="mt-6 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
                Welcome back,
                <br />
                {user.username}!
              </h1>

              <p className="mt-5 text-sm leading-8 text-[#F4E8F8]">
                Manage your blogging community,
                review new submissions, and
                keep MyBlog a beautiful place
                for sharing ideas.
              </p>

              <Link
                to="/admin/posts"
                className="mt-7 inline-flex items-center gap-3 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#8C6AA7] transition-all hover:-translate-y-0.5 hover:bg-[#F7EFFA]"
              >
                <FileText size={18} />
                Manage Posts
                <ArrowRight size={17} />
              </Link>
            </div>
          </section>

          {/* ERROR MESSAGE */}
          {error && (
            <div
              role="alert"
              className="mt-7 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
            >
              <AlertCircle
                size={20}
                className="shrink-0"
              />
              {error}
            </div>
          )}

          {/* STATISTICS */}
          <section className="mt-10">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F0E5F5] text-[#8C6AA7]">
                <LayoutDashboard size={21} />
              </div>

              <div>
                <h2 className="font-serif text-2xl font-semibold">
                  Community Overview
                </h2>

                <p className="mt-1 text-xs text-[#918398]">
                  A quick look at your website activity.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {cards.map((card) => (
                <StatCard
                  key={card.label}
                  {...card}
                  loading={statsLoading}
                />
              ))}
            </div>
          </section>

          {/* QUICK MANAGEMENT */}
          <section className="mt-10 rounded-[30px] border border-[#E9DFEF] bg-white p-6 shadow-[0_12px_40px_rgba(105,83,125,0.045)] sm:p-8">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#9D79B6]">
                <Sparkles size={15} />
                Administration Tools
              </span>

              <h2 className="mt-3 font-serif text-2xl font-semibold sm:text-3xl">
                Quick Management
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#918398]">
                Everything you need to manage
                your blog in one place.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {navigation.slice(1).map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="group rounded-[22px] border border-[#E9DFEF] bg-[#FFFCFE] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#D7BCE5] hover:bg-[#F8F2FB]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0E5F5] text-[#8C6AA7]">
                        <Icon size={23} />
                      </div>

                      <ArrowUpRight
                        size={19}
                        className="text-[#B69AC8] transition group-hover:translate-x-1 group-hover:-translate-y-1"
                      />
                    </div>

                    <h3 className="mt-6 font-serif text-lg font-semibold">
                      {item.label}
                    </h3>

                    <p className="mt-2 text-xs leading-6 text-[#918398]">
                      {item.label === "Manage Posts"
                        ? "Review and manage blog submissions."
                        : item.label === "Categories"
                          ? "Organize stories into categories."
                          : item.label === "Comments"
                            ? "Manage reader conversations."
                            : "Manage your blog community."}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* PENDING POSTS */}
          <section className="mt-9 overflow-hidden rounded-[30px] border border-[#E6D8EE] bg-gradient-to-br from-[#F4EAF8] to-[#FFF2EB] p-7 sm:p-9">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">

              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#8C6AA7] shadow-sm">
                  <Clock3 size={25} />
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#9D79B6]">
                    Content Review
                  </span>

                  <h2 className="mt-2 font-serif text-2xl font-semibold">
                    Posts Awaiting Review
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-[#918398]">
                    {statsLoading
                      ? "Checking pending submissions..."
                      : stats?.pending_posts === 0
                        ? "All caught up! There are no pending posts."
                        : `${stats?.pending_posts ?? "Some"} posts are waiting for approval.`}
                  </p>
                </div>
              </div>

              <Link
                to="/admin/posts"
                className="inline-flex shrink-0 items-center gap-3 rounded-full bg-[#8C6AA7] px-7 py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#75538F]"
              >
                Review Posts
                <ArrowRight size={17} />
              </Link>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#E9DFEF] pt-7 text-center sm:flex-row sm:text-left">
            <p className="text-xs text-[#B0A2B7]">
              © {new Date().getFullYear()} MyBlog.
              Administrator Workspace.
            </p>

            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#8C6AA7] hover:text-[#694B84]"
            >
              View Website
              <ArrowUpRight size={15} />
            </Link>
          </footer>
        </main>
      </div>
    </div>
  );
}
