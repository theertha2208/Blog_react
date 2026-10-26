
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  UserRound,
  BookOpen,
  Flower2,
  Sparkles,
  Feather,
  Heart,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await register(form);

      navigate("/login", {
        replace: true,
        state: { registered: true },
      });
    } catch (err) {
      const details = err.data;

      if (details && typeof details === "object") {
        const firstError = Object.values(details)[0];

        setError(
          Array.isArray(firstError)
            ? firstError.join(" ")
            : String(firstError)
        );
      } else {
        setError(err.message || "Registration failed.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFCF9]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#EADCF1] border-t-[#8C6AA7]" />
          <p className="text-sm text-[#887B8F]">
            Loading MyBlog...
          </p>
        </div>
      </main>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="min-h-screen bg-[#FFFCF9] text-[#43394B]">
      <style>
        {`
          @keyframes registerFloat {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-12px);
            }
          }

          @keyframes registerFade {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .register-animation {
              animation: none !important;
            }
          }
        `}
      </style>

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT SIDE - WELCOME PANEL */}
        <section className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-[#B69AC8] via-[#9C7BB6] to-[#74538E] px-12 py-12 text-white lg:flex lg:flex-col xl:px-20">

          {/* DECORATIVE BACKGROUND */}
          <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 -right-20 h-96 w-96 rounded-full bg-[#E9D5F2]/20 blur-3xl" />

          <div className="pointer-events-none absolute left-[15%] top-[24%] text-white/20">
            <Flower2
              size={90}
              strokeWidth={0.8}
              className="register-animation"
              style={{
                animation:
                  "registerFloat 6s ease-in-out infinite",
              }}
            />
          </div>

          <div className="pointer-events-none absolute right-[13%] top-[19%] text-white/20">
            <Sparkles
              size={52}
              strokeWidth={1}
              className="register-animation"
              style={{
                animation:
                  "registerFloat 5s ease-in-out infinite",
              }}
            />
          </div>

          <div className="pointer-events-none absolute bottom-[15%] right-[15%] text-white/15">
            <Feather
              size={80}
              strokeWidth={1}
              className="register-animation"
              style={{
                animation:
                  "registerFloat 7s ease-in-out infinite",
              }}
            />
          </div>

          {/* LOGO */}
          <Link
            to="/"
            className="relative z-10 flex w-fit items-center gap-3"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-white/20 backdrop-blur-md">
              <Flower2 size={27} />
            </span>

            <span className="font-serif text-3xl font-bold tracking-tight">
              MyBlog.
            </span>
          </Link>

          {/* WELCOME CONTENT */}
          <div className="relative z-10 flex flex-1 flex-col justify-center py-16">
            <div
              className="register-animation"
              style={{
                animation:
                  "registerFade 0.8s ease both",
              }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-md">
                <Sparkles size={15} />
                Join Our Community
              </span>

              <h1 className="mt-9 max-w-xl font-serif text-5xl font-semibold leading-[1.2] xl:text-6xl">
                Every great
                <br />
                story starts
                <br />
                <span className="italic text-[#F8EAFD]">
                  with you.
                </span>
              </h1>

              <p className="mt-8 max-w-md text-base leading-9 text-[#F4E8F8]">
                Create your little corner of MyBlog.
                Share meaningful ideas, discover
                beautiful stories, and connect with
                people who love creativity.
              </p>

              {/* FEATURE CARDS */}
              <div className="mt-12 grid max-w-lg grid-cols-2 gap-4">
                <div className="rounded-[24px] border border-white/20 bg-white/15 p-6 backdrop-blur-md">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
                    <BookOpen size={22} />
                  </div>

                  <h3 className="mt-5 text-sm font-bold">
                    Discover
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-[#F4E8F8]">
                    Read stories and explore
                    inspiring perspectives.
                  </p>
                </div>

                <div className="rounded-[24px] border border-white/20 bg-white/15 p-6 backdrop-blur-md">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
                    <Feather size={22} />
                  </div>

                  <h3 className="mt-5 text-sm font-bold">
                    Create
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-[#F4E8F8]">
                    Share your thoughts and
                    express your creativity.
                  </p>
                </div>
              </div>

              {/* SMALL MESSAGE */}
              <div className="mt-10 flex items-center gap-2 text-sm text-[#F4E8F8]">
                <CheckCircle2 size={18} />
                Your writing journey begins here.
              </div>
            </div>
          </div>

          {/* LEFT FOOTER */}
          <div className="relative z-10 flex items-center justify-between border-t border-white/20 pt-7">
            <p className="text-xs text-[#F2E4F8]">
              © {new Date().getFullYear()} MyBlog.
            </p>

            <span className="flex items-center gap-2 text-xs text-[#F2E4F8]">
              Made for storytellers
              <Heart size={14} />
            </span>
          </div>
        </section>

        {/* RIGHT SIDE - REGISTRATION FORM */}
        <section className="relative flex min-h-screen flex-col bg-[#FFFCF9] px-5 py-7 sm:px-10 lg:px-12 xl:px-20">

          {/* TOP NAVIGATION */}
          <header className="flex items-center justify-between gap-4">

            {/* MOBILE LOGO */}
            <Link
              to="/"
              className="flex items-center gap-2 lg:hidden"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEE2F4] text-[#8C6AA7]">
                <Flower2 size={23} />
              </span>

              <span className="font-serif text-2xl font-bold">
                My
                <span className="text-[#9C79B5]">
                  Blog.
                </span>
              </span>
            </Link>

            <div className="hidden lg:block">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A99BB0]">
                Create Account
              </span>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#8C6AA7] transition hover:text-[#694B84] sm:text-sm"
            >
              <ArrowLeft size={17} />
              Back to Home
            </Link>
          </header>

          {/* FORM CONTAINER */}
          <div className="flex flex-1 items-center justify-center py-12">
            <div
              className="register-animation w-full max-w-[460px]"
              style={{
                animation:
                  "registerFade 0.7s ease both",
              }}
            >

              {/* ICON */}
              <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-[#E6D7ED] bg-[#F1E7F6] text-[#8C6AA7]">
                <Flower2
                  size={30}
                  strokeWidth={1.5}
                />
              </div>

              {/* HEADING */}
              <div className="mt-7">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9C79B5]">
                  Start Your Journey
                </span>

                <h2 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-[#43394B] sm:text-[44px]">
                  Create Account
                  <span className="text-[#B69AC8]">
                    .
                  </span>
                </h2>

                <p className="mt-4 text-sm leading-8 text-[#918398]">
                  Join MyBlog and become part of
                  a community of readers and writers.
                </p>
              </div>

              {/* ERROR MESSAGE */}
              {error && (
                <div
                  role="alert"
                  className="mt-7 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-700"
                >
                  {error}
                </div>
              )}

              {/* REGISTRATION FORM */}
              <form
                onSubmit={handleSubmit}
                className="mt-9 space-y-5"
              >

                {/* USERNAME */}
                <div>
                  <label
                    htmlFor="username"
                    className="mb-2.5 block text-sm font-bold text-[#594B61]"
                  >
                    Username
                  </label>

                  <div className="relative">
                    <UserRound
                      size={19}
                      className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#AA96B5]"
                    />

                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={form.username}
                      onChange={updateField}
                      required
                      autoComplete="username"
                      placeholder="Choose a username"
                      className="w-full rounded-2xl border border-[#E7DCEB] bg-white py-4 pl-14 pr-5 text-sm text-[#43394B] placeholder:text-[#ADA0B2] outline-none transition-all duration-300 focus:border-[#A786BE] focus:ring-4 focus:ring-[#B69AC8]/15"
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2.5 block text-sm font-bold text-[#594B61]"
                  >
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={19}
                      className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#AA96B5]"
                    />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={updateField}
                      required
                      autoComplete="email"
                      placeholder="Enter your email"
                      className="w-full rounded-2xl border border-[#E7DCEB] bg-white py-4 pl-14 pr-5 text-sm text-[#43394B] placeholder:text-[#ADA0B2] outline-none transition-all duration-300 focus:border-[#A786BE] focus:ring-4 focus:ring-[#B69AC8]/15"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2.5 block text-sm font-bold text-[#594B61]"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={19}
                      className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#AA96B5]"
                    />

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={form.password}
                      onChange={updateField}
                      required
                      autoComplete="new-password"
                      placeholder="Create a password"
                      className="w-full rounded-2xl border border-[#E7DCEB] bg-white py-4 pl-14 pr-14 text-sm text-[#43394B] placeholder:text-[#ADA0B2] outline-none transition-all duration-300 focus:border-[#A786BE] focus:ring-4 focus:ring-[#B69AC8]/15"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      aria-pressed={showPassword}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9B8AA3] transition hover:text-[#8C6AA7]"
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label
                    htmlFor="confirm_password"
                    className="mb-2.5 block text-sm font-bold text-[#594B61]"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={19}
                      className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#AA96B5]"
                    />

                    <input
                      id="confirm_password"
                      name="confirm_password"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={form.confirm_password}
                      onChange={updateField}
                      required
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      className="w-full rounded-2xl border border-[#E7DCEB] bg-white py-4 pl-14 pr-14 text-sm text-[#43394B] placeholder:text-[#ADA0B2] outline-none transition-all duration-300 focus:border-[#A786BE] focus:ring-4 focus:ring-[#B69AC8]/15"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      aria-pressed={showConfirmPassword}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9B8AA3] transition hover:text-[#8C6AA7]"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-7 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#8C6AA7] px-6 py-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(140,106,167,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#75538F] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={19} />
                    </>
                  )}
                </button>
              </form>

              {/* LOGIN LINK */}
              <div className="mt-9 border-t border-[#EDE3F0] pt-7">
                <p className="text-center text-sm text-[#918398]">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-[#8C6AA7] transition hover:text-[#694B84] hover:underline"
                  >
                    Sign In
                  </Link>
                </p>
              </div>

              <div className="mt-10 flex items-center justify-center gap-2 text-xs text-[#B0A2B7]">
                <Feather size={15} />
                Your story starts here.
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <footer className="text-center">
            <p className="text-xs text-[#B0A2B7]">
              © {new Date().getFullYear()} MyBlog.
              A little space for beautiful stories.
            </p>
          </footer>
        </section>
      </div>
    </main>
  );
}
