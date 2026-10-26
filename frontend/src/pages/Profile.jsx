import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  Camera,
  CheckCircle2,
  AlertCircle,
  Feather,
  Flower2,
  Heart,
  Mail,
  Save,
  Sparkles,
  UserRound,
  BookOpen,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const API = "http://127.0.0.1:8000";

const inputClass =
  "w-full rounded-2xl border border-[#E4D7EA] bg-[#FFFCFE] px-5 py-4 text-sm text-[#43394B] outline-none transition placeholder:text-[#B4A5BA] focus:border-[#A889BE] focus:ring-4 focus:ring-[#EDE0F3]/60";

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

// FORMAT IMAGE URL
function getImageUrl(image) {
  if (!image) return null;

  if (
    image.startsWith("http") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  return `${API}${image.startsWith("/") ? "" : "/"}${image}`;
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    bio: "",
  });

  const [picture, setPicture] = useState(null);
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // LOAD PROFILE
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API}/api/auth/profile/`,
          {
            credentials: "include",
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load your profile."
          );
        }

        const data = await response.json();

        if (!controller.signal.aborted) {
          setProfile(data);

          setForm({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            bio: data.bio || "",
          });
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message || "Unable to load your profile."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => controller.abort();
  }, [user?.id, authLoading]);

  // PROFILE IMAGE PREVIEW
  useEffect(() => {
    if (!picture) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(picture);

    setPreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [picture]);

  // UPDATE FORM FIELD
  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSuccess("");
  }

  // SELECT PROFILE PICTURE
  function handlePictureChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Profile picture must be smaller than 5 MB."
      );
      event.target.value = "";
      return;
    }

    setPicture(file);
    setError("");
    setSuccess("");
  }

  // SAVE PROFILE CHANGES
  async function handleSave(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
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

      const csrfData = await csrfResponse.json();

      const token =
        getCookie("csrftoken") ||
        csrfData.csrfToken ||
        csrfData.csrf_token;

      if (!token) {
        throw new Error(
          "CSRF token missing. Refresh the page."
        );
      }

      // PREPARE FORM DATA
      const formData = new FormData();

      formData.append("first_name", form.first_name);
      formData.append("last_name", form.last_name);
      formData.append("email", form.email);
      formData.append("bio", form.bio);

      if (picture) {
        formData.append("profile_picture", picture);
      }

      // UPDATE PROFILE THROUGH DJANGO API
      const response = await fetch(
        `${API}/api/auth/profile/`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "X-CSRFToken": token,
          },
          body: formData,
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        const details = Object.entries(data)
          .map(([key, value]) => {
            return `${key}: ${
              Array.isArray(value)
                ? value.join(", ")
                : String(value)
            }`;
          })
          .join(" ");

        throw new Error(
          details || "Unable to update profile."
        );
      }

      setProfile(data);

      setForm({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        bio: data.bio || "",
      });

      setPicture(null);

      setSuccess(
        "Your profile has been updated successfully!"
      );
    } catch (err) {
      setError(
        err.message || "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  }

  // LOADING
  if (authLoading || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFCF9]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-11 w-11 animate-spin rounded-full border-4 border-[#EADCF1] border-t-[#8C6AA7]" />

          <p className="text-sm font-medium text-[#887B8F]">
            Loading your profile...
          </p>
        </div>
      </main>
    );
  }

  // NOT LOGGED IN
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFCF9] px-5">
        <div className="w-full max-w-lg rounded-[30px] border border-[#E9DFEF] bg-white p-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#F0E5F5]">
            <UserRound
              size={35}
              className="text-[#9D79B6]"
            />
          </div>

          <h2 className="mt-7 font-serif text-3xl font-semibold text-[#43394B]">
            Please Log In
          </h2>

          <p className="mt-4 text-sm leading-8 text-[#918398]">
            Sign in to view and manage your personal profile.
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

  const username = profile?.username || user.username;

  const profileImage = getImageUrl(
    preview || profile?.profile_picture_url
  );

  const displayName =
    [form.first_name, form.last_name]
      .filter(Boolean)
      .join(" ") || username;

  return (
    <main className="min-h-screen bg-[#FFFCF9] px-5 py-9 text-[#43394B] md:px-8 md:py-12">
      <div className="mx-auto max-w-6xl">

        {/* BACK TO HOME */}
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#8C6AA7] transition hover:text-[#694B84]"
        >
          <ArrowLeft size={17} />
          Back to Home
        </Link>

        {/* PROFILE HERO */}
        <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-[#A889BE] via-[#9C7BB6] to-[#81609B] px-7 py-11 text-white sm:px-11 sm:py-14">
          <div className="pointer-events-none absolute -right-14 -top-20 h-80 w-80 rounded-full bg-white/10 blur-2xl" />

          <Flower2
            size={170}
            strokeWidth={0.7}
            className="pointer-events-none absolute bottom-0 right-10 hidden text-white/15 md:block"
          />

          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-xs font-bold backdrop-blur-sm">
              <Sparkles size={15} />
              Your Personal Space
            </span>

            <h1 className="mt-6 font-serif text-4xl font-semibold sm:text-5xl">
              My Profile
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-8 text-[#F4E8F8]">
              A little space that's entirely yours.
              Personalize your profile, share your
              story, and connect with the MyBlog community.
            </p>

            <div className="mt-7 inline-flex items-center gap-2 text-xs font-semibold text-white/90">
              <Feather size={17} />
              MyBlog Community
            </div>
          </div>
        </section>

        {/* MAIN PROFILE LAYOUT */}
        <div className="mt-9 grid items-start gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)]">

          {/* LEFT: PROFILE OVERVIEW */}
          <aside className="space-y-6">

            {/* PROFILE CARD */}
            <section className="overflow-hidden rounded-[30px] border border-[#E9DFEF] bg-white shadow-[0_12px_40px_rgba(105,83,125,0.045)]">
              <div className="h-28 bg-gradient-to-r from-[#E9DDF1] via-[#F2E6F7] to-[#FBEAF3]" />

              <div className="px-7 pb-8">

                {/* PROFILE PHOTO */}
                <div className="-mt-12 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#F0E5F5] shadow-md">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={`${username}'s profile`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound
                      size={48}
                      className="text-[#9D79B6]"
                    />
                  )}
                </div>

                {/* NAME */}
                <h2 className="mt-5 break-words font-serif text-2xl font-semibold">
                  {displayName}
                </h2>

                {/* USERNAME */}
                <p className="mt-2 flex items-center gap-2 text-sm text-[#918398]">
                  <AtSign
                    size={16}
                    className="text-[#9D79B6]"
                  />
                  {username}
                </p>

                {/* EMAIL */}
                <p className="mt-4 flex items-start gap-2 break-all text-sm text-[#918398]">
                  <Mail
                    size={16}
                    className="mt-0.5 shrink-0 text-[#9D79B6]"
                  />
                  {form.email || "No email added"}
                </p>

                {/* CHANGE PHOTO */}
                <label className="mt-7 inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#DCC6E8] bg-white px-5 py-3 text-sm font-bold text-[#8C6AA7] transition hover:bg-[#F7F0FA]">
                  <Camera size={17} />
                  Change Photo

                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handlePictureChange}
                    disabled={saving}
                  />
                </label>

                <p className="mt-3 text-xs leading-6 text-[#918398]">
                  JPG, PNG, or other image formats.
                  Maximum file size: 5 MB.
                </p>

                {picture && (
                  <p className="mt-3 break-all text-xs font-semibold text-[#8C6AA7]">
                    Selected: {picture.name}
                  </p>
                )}
              </div>
            </section>

            {/* PROFILE TIP */}
            <section className="rounded-[28px] border border-[#E9DFEF] bg-gradient-to-br from-[#F3E9F7] to-[#FFF4ED] p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#8C6AA7]">
                <Heart size={23} />
              </div>

              <h3 className="mt-5 font-serif text-xl font-semibold">
                Let Your Personality Shine
              </h3>

              <p className="mt-4 text-sm leading-8 text-[#807087]">
                Your profile helps readers get to know
                the person behind your stories.
                Add a thoughtful bio and make
                this space your own.
              </p>
            </section>
          </aside>

          {/* RIGHT: EDIT PROFILE FORM */}
          <section className="overflow-hidden rounded-[30px] border border-[#E9DFEF] bg-white shadow-[0_12px_40px_rgba(105,83,125,0.045)]">

            {/* FORM HEADER */}
            <div className="flex items-center gap-4 border-b border-[#E9DFEF] bg-[#F8F2FB] px-6 py-7 sm:px-9">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E9DDF1] text-[#8C6AA7]">
                <UserRound size={23} />
              </div>

              <div>
                <h2 className="font-serif text-2xl font-semibold">
                  Personal Information
                </h2>

                <p className="mt-1 text-xs leading-6 text-[#918398]">
                  Keep your account details up to date.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-9">

              {/* ERROR */}
              {error && (
                <div
                  role="alert"
                  className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-7 text-red-700"
                >
                  <AlertCircle
                    size={20}
                    className="mt-0.5 shrink-0"
                  />
                  <span>{error}</span>
                </div>
              )}

              {/* SUCCESS */}
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

              {/* FORM */}
              <form
                onSubmit={handleSave}
                className="space-y-7"
              >

                {/* FIRST AND LAST NAME */}
                <div className="grid gap-5 sm:grid-cols-2">

                  <div>
                    <label
                      htmlFor="first_name"
                      className="mb-3 block text-sm font-bold"
                    >
                      First Name
                    </label>

                    <input
                      id="first_name"
                      type="text"
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="last_name"
                      className="mb-3 block text-sm font-bold"
                    >
                      Last Name
                    </label>

                    <input
                      id="last_name"
                      type="text"
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* USERNAME */}
                <div>
                  <label
                    htmlFor="profile_username"
                    className="mb-3 flex items-center gap-2 text-sm font-bold"
                  >
                    <AtSign
                      size={17}
                      className="text-[#9D79B6]"
                    />
                    Username
                  </label>

                  <div className="relative">
                    <AtSign
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A58CB6]"
                    />

                    <input
                      id="profile_username"
                      type="text"
                      value={username}
                      readOnly
                      className={`${inputClass} cursor-not-allowed bg-[#F5F0F7] pl-12 text-[#918398]`}
                    />
                  </div>

                  <p className="mt-3 text-xs text-[#918398]">
                    Your username cannot be changed.
                  </p>
                </div>

                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="profile_email"
                    className="mb-3 flex items-center gap-2 text-sm font-bold"
                  >
                    <Mail
                      size={17}
                      className="text-[#9D79B6]"
                    />
                    Email Address
                  </label>

                  <input
                    id="profile_email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    required
                    className={inputClass}
                  />
                </div>

                {/* BIO */}
                <div>
                  <label
                    htmlFor="profile_bio"
                    className="mb-3 flex items-center gap-2 text-sm font-bold"
                  >
                    <BookOpen
                      size={17}
                      className="text-[#9D79B6]"
                    />
                    About Me
                  </label>

                  <textarea
                    id="profile_bio"
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    rows={6}
                    maxLength={500}
                    placeholder="Tell readers something about yourself..."
                    className={`${inputClass} resize-y leading-8`}
                  />

                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[#918398]">
                    <span>
                      Share a little about yourself.
                    </span>

                    <span className="font-semibold text-[#8C6AA7]">
                      {form.bio.length}/500
                    </span>
                  </div>
                </div>

                {/* ACCOUNT INFORMATION */}
                <div className="flex items-start gap-3 rounded-2xl border border-[#E8DDEF] bg-[#F8F2FB] p-5">
                  <ShieldCheck
                    size={21}
                    className="mt-0.5 shrink-0 text-[#8C6AA7]"
                  />

                  <p className="text-sm leading-7 text-[#807087]">
                    Your profile information will be
                    saved securely to your account.
                    Changes to your public profile may
                    be visible to other MyBlog readers.
                  </p>
                </div>

                {/* SAVE BUTTON */}
                <div className="flex flex-col gap-4 border-t border-[#F0E8F2] pt-7 sm:flex-row sm:items-center">
                  <button
                    type="submit"
                    disabled={saving || !profile}
                    className="inline-flex items-center justify-center gap-3 rounded-full bg-[#8C6AA7] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#75538F] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save size={18} />
                    {saving
                      ? "Saving Changes..."
                      : "Save Changes"}
                  </button>

                  <Link
                    to="/"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#DCC6E8] bg-white px-6 py-4 text-sm font-bold text-[#8C6AA7] transition hover:bg-[#F7F0FA]"
                  >
                    <ArrowLeft size={17} />
                    Back to Home
                  </Link>
                </div>
              </form>
            </div>
          </section>
        </div>

        {/* BOTTOM MESSAGE */}
        <section className="mt-10 flex flex-col items-center justify-between gap-5 rounded-[26px] bg-[#F3E9F7] px-7 py-8 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="font-serif text-xl font-semibold">
              Your story is uniquely yours.
            </h3>

            <p className="mt-2 text-sm text-[#918398]">
              Keep sharing your ideas with the MyBlog community.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-[#8C6AA7] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#75538F]"
          >
            Explore Stories
            <ArrowRight size={17} />
          </Link>
        </section>

        {/* FOOTER */}
        <footer className="mt-12 border-t border-[#E9DFEF] pt-7 text-center">
          <p className="text-xs text-[#B0A2B7]">
            © {new Date().getFullYear()} MyBlog.
            Your Personal Space.
          </p>
        </footer>
      </div>
    </main>
  );
}