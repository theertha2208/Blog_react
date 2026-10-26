import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Feather,
  FileText,
  Flower2,
  ImagePlus,
  LayoutDashboard,
  Send,
  Sparkles,
  Tag,
  UploadCloud,
  UserRound,
  X,
  AlertCircle,
  Lightbulb,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const API = "http://127.0.0.1:8000";

const inputClass =
  "w-full rounded-2xl border border-[#E4D7EA] bg-[#FFFCFE] px-5 py-4 text-sm text-[#43394B] outline-none transition placeholder:text-[#B4A5BA] focus:border-[#A889BE] focus:ring-4 focus:ring-[#EDE0F3]/60 disabled:cursor-not-allowed disabled:opacity-60";

function getCookie(name) {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  return cookie
    ? decodeURIComponent(cookie.split("=").slice(1).join("="))
    : "";
}

export default function CreatePost() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // LOAD CATEGORIES FROM DJANGO
  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        setCategoriesLoading(true);

        const response = await fetch(
          `${API}/api/categories/`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load categories.");
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
          setError(
            err.message || "Unable to load categories."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setCategoriesLoading(false);
        }
      }
    }

    loadCategories();

    return () => controller.abort();
  }, []);

  // GENERATE IMAGE PREVIEW
  useEffect(() => {
    if (!image) {
      setImagePreview(null);
      return;
    }

    const url = URL.createObjectURL(image);

    setImagePreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [image]);

  // HANDLE IMAGE UPLOAD
  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    setImage(file);
    setError("");
  }

  // REMOVE SELECTED IMAGE
  function removeImage() {
    setImage(null);

    const fileInput = document.getElementById("post-image");

    if (fileInput) {
      fileInput.value = "";
    }
  }

  // SUBMIT BLOG POST
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (title.trim().length < 5) {
      setError("Title must contain at least 5 characters.");
      return;
    }

    if (!category) {
      setError("Please select a category.");
      return;
    }

    if (content.trim().length < 20) {
      setError("Content must contain at least 20 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("category", category);
      formData.append("content", content.trim());

      if (image) {
        formData.append("image", image);
      }

      // INITIALIZE CSRF PROTECTION
      const csrfResponse = await fetch(
        `${API}/api/auth/csrf/`,
        {
          credentials: "include",
        }
      );

      if (!csrfResponse.ok) {
        throw new Error("Unable to get CSRF token.");
      }

      const csrfData = await csrfResponse.json();

      const csrfToken =
        getCookie("csrftoken") ||
        csrfData.csrfToken ||
        csrfData.csrf_token;

      if (!csrfToken) {
        throw new Error(
          "CSRF token was not returned. Please refresh the page."
        );
      }

      // CREATE POST
      const response = await fetch(
        `${API}/api/my-posts/create/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "X-CSRFToken": csrfToken,
          },
          body: formData,
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        const firstError =
          data && typeof data === "object"
            ? Object.values(data)[0]
            : null;

        throw new Error(
          Array.isArray(firstError)
            ? firstError.join(" ")
            : String(
                firstError ||
                  "Failed to create post."
              )
        );
      }

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.message || "Failed to create post."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // AUTHENTICATION LOADING
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFCF9]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-11 w-11 animate-spin rounded-full border-4 border-[#EADCF1] border-t-[#8C6AA7]" />

          <p className="text-sm font-medium text-[#887B8F]">
            Preparing your writing space...
          </p>
        </div>
      </main>
    );
  }

  // USER NOT LOGGED IN
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

          <h2 className="mt-7 font-serif text-3xl font-semibold text-[#43394B]">
            Please Log In
          </h2>

          <p className="mt-4 text-sm leading-8 text-[#918398]">
            Sign in to start creating and sharing your
            beautiful stories with the MyBlog community.
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

  return (
    <main className="min-h-screen bg-[#FFFCF9] px-5 py-9 text-[#43394B] md:px-8 md:py-12">
      <div className="mx-auto max-w-6xl">

        {/* BACK TO DASHBOARD */}
        <Link
          to="/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#8C6AA7] transition hover:text-[#694B84]"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        {/* PAGE HERO */}
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
              Your Creative Corner
            </span>

            <h1 className="mt-6 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              Write Your Story.
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-8 text-[#F4E8F8]">
              Every wonderful story starts with an idea.
              Find your words, share your perspective,
              and create something worth remembering.
            </p>

            <div className="mt-7 inline-flex items-center gap-2 text-xs font-semibold text-white/90">
              <Feather size={17} />
              MyBlog Writer Studio
            </div>
          </div>
        </section>

        {/* PAGE INTRODUCTION */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#9D79B6]">
              <BookOpen size={15} />
              Writer's Workspace
            </span>

            <h2 className="mt-3 font-serif text-3xl font-semibold">
              Create a New Post
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#918398]">
              Fill in the details below to prepare
              your next story.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-[#DCC6E8] bg-white px-5 py-3 text-sm font-bold text-[#8C6AA7] transition hover:bg-[#F7F0FA]"
          >
            <LayoutDashboard size={17} />
            My Dashboard
          </Link>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 grid items-start gap-7 lg:grid-cols-[minmax(0,1.7fr)_minmax(290px,0.8fr)]"
        >
          {/* LEFT: WRITING EDITOR */}
          <div className="min-w-0 space-y-7">

            {/* MAIN WRITING CARD */}
            <section className="overflow-hidden rounded-[30px] border border-[#E9DFEF] bg-white shadow-[0_12px_40px_rgba(105,83,125,0.045)]">
              <div className="flex items-center gap-4 border-b border-[#E9DFEF] bg-[#F8F2FB] px-6 py-7 sm:px-9">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E9DDF1] text-[#8C6AA7]">
                  <Feather size={23} />
                </div>

                <div>
                  <h3 className="font-serif text-2xl font-semibold">
                    Your Story
                  </h3>

                  <p className="mt-1 text-xs leading-6 text-[#918398]">
                    Give your ideas a place to grow.
                  </p>
                </div>
              </div>

              <div className="space-y-8 p-6 sm:p-9">

                {/* ERROR MESSAGE */}
                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-7 text-red-700"
                  >
                    <AlertCircle
                      size={20}
                      className="mt-0.5 shrink-0"
                    />
                    <span>{error}</span>
                  </div>
                )}

                {/* TITLE */}
                <div>
                  <label
                    htmlFor="title"
                    className="mb-3 flex items-center gap-2 text-sm font-bold"
                  >
                    <FileText
                      size={18}
                      className="text-[#9D79B6]"
                    />
                    Blog Title
                  </label>

                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
                    required
                    minLength={5}
                    placeholder="Give your story a beautiful title..."
                    className={inputClass}
                  />

                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[#918398]">
                    <span>Minimum 5 characters</span>
                    <span>{title.length} characters</span>
                  </div>
                </div>

                {/* CATEGORY */}
                <div>
                  <label
                    htmlFor="category"
                    className="mb-3 flex items-center gap-2 text-sm font-bold"
                  >
                    <Tag
                      size={18}
                      className="text-[#9D79B6]"
                    />
                    Story Category
                  </label>

                  <select
                    id="category"
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value)
                    }
                    required
                    disabled={categoriesLoading}
                    className={inputClass}
                  >
                    <option value="">
                      {categoriesLoading
                        ? "Loading categories..."
                        : "Choose a category"}
                    </option>

                    {categories.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name}
                      </option>
                    ))}
                  </select>

                  <p className="mt-3 text-xs leading-6 text-[#918398]">
                    Select the topic that best describes
                    your article.
                  </p>
                </div>

                {/* CONTENT */}
                <div>
                  <label
                    htmlFor="content"
                    className="mb-3 flex items-center gap-2 text-sm font-bold"
                  >
                    <BookOpen
                      size={18}
                      className="text-[#9D79B6]"
                    />
                    Your Writing
                  </label>

                  <textarea
                    id="content"
                    value={content}
                    onChange={(event) =>
                      setContent(event.target.value)
                    }
                    required
                    minLength={20}
                    rows={16}
                    placeholder="Every story begins somewhere... Start writing yours here."
                    className={`${inputClass} min-h-[350px] resize-y leading-8`}
                  />

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-[#918398]">
                    <span>Minimum 20 characters</span>

                    <span className="font-semibold text-[#8C6AA7]">
                      {content.length} characters
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* COVER IMAGE CARD */}
            <section className="overflow-hidden rounded-[30px] border border-[#E9DFEF] bg-white shadow-[0_12px_40px_rgba(105,83,125,0.045)]">
              <div className="flex items-center gap-4 border-b border-[#F0E8F2] px-6 py-7 sm:px-9">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0E5F5] text-[#8C6AA7]">
                  <ImagePlus size={23} />
                </div>

                <div>
                  <h3 className="font-serif text-xl font-semibold">
                    Cover Image
                  </h3>

                  <p className="mt-1 text-xs text-[#918398]">
                    Optional — add a visual to your story.
                  </p>
                </div>
              </div>

              <div className="p-6 sm:p-9">
                {imagePreview ? (
                  <div className="relative overflow-hidden rounded-[22px] border border-[#E9DFEF] bg-[#F4EAF8]">
                    <img
                      src={imagePreview}
                      alt="Selected cover preview"
                      className="max-h-[360px] w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={removeImage}
                      disabled={submitting}
                      aria-label="Remove cover image"
                      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#43394B] shadow-md transition hover:bg-red-50 hover:text-red-600"
                    >
                      <X size={19} />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="post-image"
                    className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#DCC6E8] bg-[#FCF8FD] px-6 py-14 text-center transition hover:border-[#B998CB] hover:bg-[#F5EBF9]"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E9DDF1] text-[#8C6AA7]">
                      <UploadCloud size={30} />
                    </div>

                    <span className="mt-5 text-sm font-bold text-[#43394B]">
                      Click to upload your cover image
                    </span>

                    <span className="mt-2 text-xs leading-6 text-[#918398]">
                      Choose an image from your device
                    </span>
                  </label>
                )}

                <input
                  id="post-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={submitting}
                  className="sr-only"
                />

                {image && (
                  <p className="mt-4 break-all text-xs text-[#918398]">
                    Selected:{" "}
                    <span className="font-semibold text-[#8C6AA7]">
                      {image.name}
                    </span>
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT: SUBMISSION PANEL */}
          <aside className="space-y-6">

            {/* WRITING TIPS */}
            <section className="rounded-[28px] border border-[#E9DFEF] bg-gradient-to-br from-[#F3E9F7] to-[#FFF4ED] p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#8C6AA7]">
                <Lightbulb size={24} />
              </div>

              <h3 className="mt-5 font-serif text-2xl font-semibold">
                A Little Inspiration
              </h3>

              <p className="mt-4 text-sm leading-8 text-[#807087]">
                Write from your own perspective.
                The stories that connect with readers
                are often the ones that feel most real.
              </p>

              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-[#8C6AA7]">
                <Sparkles size={16} />
                Your voice matters.
              </div>
            </section>

            {/* SUBMISSION CARD */}
            <section className="rounded-[28px] border border-[#E9DFEF] bg-white p-7 shadow-[0_12px_40px_rgba(105,83,125,0.045)]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F0E5F5] text-[#8C6AA7]">
                  <Send size={20} />
                </div>

                <h3 className="font-serif text-xl font-semibold">
                  Ready to Share?
                </h3>
              </div>

              <p className="mt-5 text-sm leading-8 text-[#918398]">
                Your story will be submitted for
                administrator review. Once approved,
                it can appear on MyBlog for readers
                to discover.
              </p>

              {/* SUBMISSION CHECKLIST */}
              <div className="mt-6 space-y-4 border-t border-[#F0E8F2] pt-6">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2
                    size={18}
                    className={
                      title.trim().length >= 5
                        ? "text-[#357B56]"
                        : "text-[#C6B7CF]"
                    }
                  />

                  <span className="text-[#65566D]">
                    Story title added
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2
                    size={18}
                    className={
                      Boolean(category)
                        ? "text-[#357B56]"
                        : "text-[#C6B7CF]"
                    }
                  />

                  <span className="text-[#65566D]">
                    Category selected
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2
                    size={18}
                    className={
                      content.trim().length >= 20
                        ? "text-[#357B56]"
                        : "text-[#C6B7CF]"
                    }
                  />

                  <span className="text-[#65566D]">
                    Story content completed
                  </span>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={submitting || categoriesLoading}
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-[#8C6AA7] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#75538F] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={18} />

                {submitting
                  ? "Submitting..."
                  : "Submit for Approval"}
              </button>

              {/* CANCEL BUTTON */}
              <Link
                to="/dashboard"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-[#DCC6E8] bg-white px-6 py-3.5 text-sm font-bold text-[#8C6AA7] transition hover:bg-[#F7F0FA]"
              >
                <ArrowLeft size={17} />
                Cancel
              </Link>
            </section>

            {/* ENCOURAGEMENT */}
            <div className="rounded-[24px] bg-[#F3E9F7] px-6 py-5 text-center">
              <Feather
                size={22}
                className="mx-auto text-[#9D79B6]"
              />

              <p className="mt-3 font-serif text-lg font-semibold">
                Every word is a beginning.
              </p>
            </div>
          </aside>
        </form>

        {/* FOOTER */}
        <footer className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#E9DFEF] pt-7 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-[#B0A2B7]">
            © {new Date().getFullYear()} MyBlog.
            Writer Studio.
          </p>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#8C6AA7] hover:text-[#694B84]"
          >
            Back to Dashboard
            <ArrowRight size={15} />
          </Link>
        </footer>
      </div>
    </main>
  );
}