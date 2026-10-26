import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
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
  Lightbulb,
  Save,
  Sparkles,
  Tag,
  UploadCloud,
  UserRound,
  X,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const API = "http://127.0.0.1:8000";

const inputClass =
  "w-full rounded-2xl border border-[#E4D7EA] bg-[#FFFCFE] px-5 py-4 text-sm text-[#43394B] outline-none transition placeholder:text-[#B4A5BA] focus:border-[#A889BE] focus:ring-4 focus:ring-[#EDE0F3]/60";

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

function getImageUrl(image) {
  if (!image) return "";

  if (
    image.startsWith("http") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  return `${API}${image.startsWith("/") ? "" : "/"}${image}`;
}

async function ensureCsrf() {
  const response = await fetch(
    `${API}/api/auth/csrf/`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Unable to initialize CSRF protection."
    );
  }

  const data = await response.json();

  const token =
    getCookie("csrftoken") ||
    data.csrfToken ||
    data.csrf_token;

  if (!token) {
    throw new Error(
      "CSRF token missing. Please refresh the page."
    );
  }

  return token;
}

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    title: "",
    category: "",
    content: "",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // LOAD POST AND CATEGORIES
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    const controller = new AbortController();

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [postResponse, categoryResponse] =
          await Promise.all([
            fetch(`${API}/api/my-posts/${id}/`, {
              credentials: "include",
              signal: controller.signal,
            }),
            fetch(`${API}/api/categories/`, {
              credentials: "include",
              signal: controller.signal,
            }),
          ]);

        if (!postResponse.ok) {
          throw new Error(
            "Unable to load this post."
          );
        }

        if (!categoryResponse.ok) {
          throw new Error(
            "Unable to load categories."
          );
        }

        const post = await postResponse.json();
        const categoryData =
          await categoryResponse.json();

        if (!controller.signal.aborted) {
          setForm({
            title: post.title || "",
            category: String(
              post.category?.id ??
                post.category ??
                ""
            ),
            content: post.content || "",
          });

          setCurrentImage(
            getImageUrl(
              post.image_url || post.image
            )
          );

          setCategories(
            Array.isArray(categoryData)
              ? categoryData
              : categoryData.results || []
          );

          setImage(null);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message || "Unable to load post."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => controller.abort();
  }, [id, user?.id, authLoading, navigate]);

  // IMAGE PREVIEW
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

  // UPDATE FORM FIELDS
  function updateField(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // SELECT NEW IMAGE
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

  // CANCEL NEW IMAGE SELECTION
  function removeSelectedImage() {
    setImage(null);

    const input = document.getElementById(
      "edit-post-image"
    );

    if (input) {
      input.value = "";
    }
  }

  // SAVE UPDATED POST
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.title.trim().length < 5) {
      setError(
        "Title must contain at least 5 characters."
      );
      return;
    }

    if (!form.category) {
      setError("Please select a category.");
      return;
    }

    if (!form.content.trim()) {
      setError("Blog content cannot be empty.");
      return;
    }

    setSaving(true);

    try {
      const csrfToken = await ensureCsrf();

      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("category", form.category);
      formData.append("content", form.content);

      if (image) {
        formData.append("image", image);
      }

      const response = await fetch(
        `${API}/api/my-posts/${id}/`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "X-CSRFToken": csrfToken,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const details = await response
          .json()
          .catch(() => ({}));

        const firstError =
          Object.values(details)[0];

        throw new Error(
          Array.isArray(firstError)
            ? firstError.join(" ")
            : typeof firstError === "string"
              ? firstError
              : "Failed to update post."
        );
      }

      navigate("/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(
        err.message || "Failed to update post."
      );
    } finally {
      setSaving(false);
    }
  }

  // LOADING SCREEN
  if (authLoading || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFCF9]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-11 w-11 animate-spin rounded-full border-4 border-[#EADCF1] border-t-[#8C6AA7]" />

          <p className="text-sm font-medium text-[#887B8F]">
            Loading your story...
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

          <h2 className="mt-7 font-serif text-3xl font-semibold">
            Please Log In
          </h2>

          <p className="mt-4 text-sm leading-8 text-[#918398]">
            Sign in to edit and manage your blog posts.
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

        {/* HERO HEADER */}
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
              Writer's Workspace
            </span>

            <h1 className="mt-6 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              Refine Your Story.
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-8 text-[#F4E8F8]">
              Great writing grows through thoughtful
              editing. Revisit your ideas, polish your
              words, and make your story shine.
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
              Edit Your Writing
            </span>

            <h2 className="mt-3 font-serif text-3xl font-semibold">
              Edit Blog Post
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#918398]">
              Update your article and save your changes.
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

        {/* EDIT FORM */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 grid items-start gap-7 lg:grid-cols-[minmax(0,1.7fr)_minmax(290px,0.8fr)]"
        >
          {/* LEFT SIDE */}
          <div className="min-w-0 space-y-7">

            {/* WRITING CARD */}
            <section className="overflow-hidden rounded-[30px] border border-[#E9DFEF] bg-white shadow-[0_12px_40px_rgba(105,83,125,0.045)]">
              <div className="flex items-center gap-4 border-b border-[#E9DFEF] bg-[#F8F2FB] px-6 py-7 sm:px-9">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E9DDF1] text-[#8C6AA7]">
                  <FileText size={23} />
                </div>

                <div>
                  <h3 className="font-serif text-2xl font-semibold">
                    Edit Your Story
                  </h3>

                  <p className="mt-1 text-xs leading-6 text-[#918398]">
                    Make your changes below.
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
                    htmlFor="edit-title"
                    className="mb-3 flex items-center gap-2 text-sm font-bold"
                  >
                    <FileText
                      size={18}
                      className="text-[#9D79B6]"
                    />
                    Blog Title
                  </label>

                  <input
                    id="edit-title"
                    name="title"
                    type="text"
                    value={form.title}
                    onChange={updateField}
                    required
                    minLength={5}
                    placeholder="Enter your blog title"
                    className={inputClass}
                  />

                  <div className="mt-3 flex items-center justify-between text-xs text-[#918398]">
                    <span>Minimum 5 characters</span>
                    <span>{form.title.length} characters</span>
                  </div>
                </div>

                {/* CATEGORY */}
                <div>
                  <label
                    htmlFor="edit-category"
                    className="mb-3 flex items-center gap-2 text-sm font-bold"
                  >
                    <Tag
                      size={18}
                      className="text-[#9D79B6]"
                    />
                    Story Category
                  </label>

                  <select
                    id="edit-category"
                    name="category"
                    value={form.category}
                    onChange={updateField}
                    required
                    className={inputClass}
                  >
                    <option value="">
                      Select a category
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <p className="mt-3 text-xs text-[#918398]">
                    Choose the topic that best fits your story.
                  </p>
                </div>

                {/* CONTENT */}
                <div>
                  <label
                    htmlFor="edit-content"
                    className="mb-3 flex items-center gap-2 text-sm font-bold"
                  >
                    <BookOpen
                      size={18}
                      className="text-[#9D79B6]"
                    />
                    Blog Content
                  </label>

                  <textarea
                    id="edit-content"
                    name="content"
                    value={form.content}
                    onChange={updateField}
                    required
                    rows={16}
                    placeholder="Edit your story here..."
                    className={`${inputClass} min-h-[350px] resize-y leading-8`}
                  />

                  <p className="mt-3 text-right text-xs font-semibold text-[#8C6AA7]">
                    {form.content.length} characters
                  </p>
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
                    Keep your current image or upload a new one.
                  </p>
                </div>
              </div>

              <div className="p-6 sm:p-9">

                {/* IMAGE PREVIEW */}
                {imagePreview ? (
                  <div className="relative overflow-hidden rounded-[22px] border border-[#E9DFEF]">
                    <img
                      src={imagePreview}
                      alt="New cover preview"
                      className="max-h-[360px] w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={removeSelectedImage}
                      disabled={saving}
                      aria-label="Cancel new cover image"
                      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#43394B] shadow-md transition hover:bg-red-50 hover:text-red-600"
                    >
                      <X size={19} />
                    </button>

                    <div className="bg-[#F8F2FB] px-5 py-3">
                      <p className="text-xs font-semibold text-[#8C6AA7]">
                        New cover image selected
                      </p>
                    </div>
                  </div>
                ) : currentImage ? (
                  <div className="overflow-hidden rounded-[22px] border border-[#E9DFEF]">
                    <img
                      src={currentImage}
                      alt="Current blog cover"
                      className="max-h-[360px] w-full object-cover"
                    />

                    <div className="bg-[#F8F2FB] px-5 py-3">
                      <p className="text-xs font-medium text-[#918398]">
                        Current cover image
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#DCC6E8] bg-[#FCF8FD] px-6 py-12 text-center">
                    <UploadCloud
                      size={35}
                      className="text-[#9D79B6]"
                    />

                    <p className="mt-4 text-sm font-medium text-[#918398]">
                      No cover image selected
                    </p>
                  </div>
                )}

                {/* UPLOAD NEW IMAGE */}
                <label
                  htmlFor="edit-post-image"
                  className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#DCC6E8] bg-white px-6 py-3.5 text-sm font-bold text-[#8C6AA7] transition hover:bg-[#F7F0FA]"
                >
                  <ImagePlus size={18} />
                  {currentImage
                    ? "Change Cover Image"
                    : "Upload Cover Image"}
                </label>

                <input
                  id="edit-post-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={saving}
                  className="sr-only"
                />

                <p className="mt-4 text-xs leading-7 text-[#918398]">
                  Leave the image unchanged to keep your
                  current cover. Uploading a new image
                  will replace it when you save.
                </p>

                {image && (
                  <p className="mt-3 break-all text-xs font-semibold text-[#8C6AA7]">
                    Selected: {image.name}
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT SIDE */}
          <aside className="space-y-6">

            {/* EDITING TIP */}
            <section className="rounded-[28px] border border-[#E9DFEF] bg-gradient-to-br from-[#F3E9F7] to-[#FFF4ED] p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#8C6AA7]">
                <Lightbulb size={24} />
              </div>

              <h3 className="mt-5 font-serif text-2xl font-semibold">
                Make Every Word Count
              </h3>

              <p className="mt-4 text-sm leading-8 text-[#807087]">
                Editing is where good stories become
                great ones. Take your time to refine
                your thoughts and make your writing
                clear and meaningful.
              </p>

              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-[#8C6AA7]">
                <Sparkles size={16} />
                Keep creating.
              </div>
            </section>

            {/* SAVE PANEL */}
            <section className="rounded-[28px] border border-[#E9DFEF] bg-white p-7 shadow-[0_12px_40px_rgba(105,83,125,0.045)]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F0E5F5] text-[#8C6AA7]">
                  <Save size={20} />
                </div>

                <h3 className="font-serif text-xl font-semibold">
                  Ready to Save?
                </h3>
              </div>

              <p className="mt-5 text-sm leading-8 text-[#918398]">
                Save your changes to update your story.
                Depending on the site's approval rules,
                your updated article may require admin
                review before appearing publicly.
              </p>

              {/* CHECKLIST */}
              <div className="mt-6 space-y-4 border-t border-[#F0E8F2] pt-6">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2
                    size={18}
                    className={
                      form.title.trim().length >= 5
                        ? "text-[#357B56]"
                        : "text-[#C6B7CF]"
                    }
                  />

                  <span className="text-[#65566D]">
                    Title completed
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2
                    size={18}
                    className={
                      Boolean(form.category)
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
                      Boolean(form.content.trim())
                        ? "text-[#357B56]"
                        : "text-[#C6B7CF]"
                    }
                  />

                  <span className="text-[#65566D]">
                    Content ready
                  </span>
                </div>
              </div>

              {/* SAVE BUTTON */}
              <button
                type="submit"
                disabled={saving}
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-[#8C6AA7] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#75538F] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={18} />
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

              {/* CANCEL */}
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
                Your story keeps growing.
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