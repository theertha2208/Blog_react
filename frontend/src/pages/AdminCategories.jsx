import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FolderOpen,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Tag,
  Trash2,
  X,
  Flower2,
  Sparkles,
  Layers3,
  AlertCircle,
  BookOpen,
} from "lucide-react";

import { apiRequest } from "../services/api";

const inputClass =
  "w-full rounded-2xl border border-[#E4D7EA] bg-white px-4 py-3.5 text-sm text-[#43394B] outline-none transition placeholder:text-[#B3A5BA] focus:border-[#A889BE] focus:ring-4 focus:ring-[#EDE0F3]/60";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#8C6AA7] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#75538F] disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full border border-[#DCC6E8] bg-white px-6 py-3 text-sm font-bold text-[#8C6AA7] transition hover:bg-[#F7F0FA] disabled:cursor-not-allowed disabled:opacity-50";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  // FETCH CATEGORIES
  async function fetchCategories() {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest(
        "/api/admin/categories/"
      );

      setCategories(
        Array.isArray(data)
          ? data
          : data.results ?? []
      );
    } catch (err) {
      setError(
        err.message || "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  }

  // LOAD ON PAGE OPEN
  useEffect(() => {
    fetchCategories();
  }, []);

  // RESET FORM
  function resetForm() {
    setEditingId(null);

    setForm({
      name: "",
      description: "",
    });
  }

  // EDIT CATEGORY
  function handleEdit(category) {
    setEditingId(category.id);

    setForm({
      name: category.name,
      description: category.description ?? "",
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // CREATE OR UPDATE CATEGORY
  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Category name is required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const isEditing = editingId !== null;

      const endpoint = isEditing
        ? `/api/admin/categories/${editingId}/`
        : "/api/admin/categories/";

      await apiRequest(endpoint, {
        method: isEditing ? "PATCH" : "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
        }),
      });

      resetForm();

      await fetchCategories();

      setSuccess(
        isEditing
          ? "Category updated successfully."
          : "Category created successfully."
      );
    } catch (err) {
      setError(
        err.data
          ? JSON.stringify(err.data)
          : err.message
      );
    } finally {
      setSaving(false);
    }
  }

  // DELETE CATEGORY
  async function handleDelete(category) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) return;

    setDeletingId(category.id);
    setError("");
    setSuccess("");

    try {
      await apiRequest(
        `/api/admin/categories/${category.id}/`,
        {
          method: "DELETE",
        }
      );

      if (editingId === category.id) {
        resetForm();
      }

      await fetchCategories();

      setSuccess(
        "Category deleted successfully."
      );
    } catch (err) {
      setError(
        err.data
          ? JSON.stringify(err.data)
          : err.message
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#FFFCF9] px-5 py-9 text-[#43394B] md:px-8 md:py-12">
      <div className="mx-auto max-w-7xl">

        {/* BACK LINK */}
        <Link
          to="/admin/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#8C6AA7] transition hover:text-[#694B84]"
        >
          <ArrowLeft size={17} />
          Back to Admin Dashboard
        </Link>

        {/* PAGE HEADER */}
        <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A889BE] via-[#9C7BB6] to-[#81609B] px-7 py-10 text-white sm:px-10 sm:py-12">

          <div className="pointer-events-none absolute -right-12 -top-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />

          <Flower2
            size={150}
            strokeWidth={0.8}
            className="pointer-events-none absolute bottom-0 right-10 hidden text-white/15 md:block"
          />

          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-xs font-bold backdrop-blur-sm">
              <Sparkles size={15} />
              Category Management
            </span>

            <h1 className="mt-6 font-serif text-3xl font-semibold sm:text-4xl">
              Organize Your Stories
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-8 text-[#F4E8F8]">
              Create and manage the topics that
              help readers discover the stories
              they love.
            </p>
          </div>
        </section>

        {/* CATEGORY OVERVIEW */}
        <section className="mt-8 grid gap-5 sm:grid-cols-2">

          {/* TOTAL CATEGORIES */}
          <div className="rounded-[26px] border border-[#E9DFEF] bg-white p-6 shadow-[0_10px_35px_rgba(105,83,125,0.045)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#94869C]">
                  Total Categories
                </p>

                <h2 className="mt-4 font-serif text-4xl font-semibold">
                  {loading ? "..." : categories.length}
                </h2>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0E5F5] text-[#8C6AA7]">
                <FolderOpen size={25} />
              </div>
            </div>

            <div className="mt-6 h-1 w-12 rounded-full bg-[#E7D8ED]" />
          </div>

          {/* ORGANIZATION CARD */}
          <div className="rounded-[26px] border border-[#E9DFEF] bg-gradient-to-br from-[#F4EAF8] to-[#FFF2EB] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#8C6AA7]">
                  Story Organization
                </p>

                <h2 className="mt-3 font-serif text-2xl font-semibold">
                  Every story has a place.
                </h2>

                <p className="mt-2 text-xs leading-6 text-[#918398]">
                  Help your community explore
                  content by their interests.
                </p>
              </div>

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#9D79B6]">
                <Layers3 size={25} />
              </div>
            </div>
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

        {/* SUCCESS MESSAGE */}
        {success && (
          <div
            role="status"
            className="mt-7 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm text-green-700"
          >
            <CheckCircle2
              size={20}
              className="shrink-0"
            />
            {success}
          </div>
        )}

        {/* MAIN MANAGEMENT AREA */}
        <div className="mt-9 grid items-start gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">

          {/* CREATE / EDIT FORM */}
          <section className="overflow-hidden rounded-[30px] border border-[#E9DFEF] bg-white shadow-[0_12px_40px_rgba(105,83,125,0.045)]">

            {/* FORM HEADER */}
            <div className="flex items-center gap-4 border-b border-[#E9DFEF] bg-[#F8F2FB] px-6 py-7 sm:px-8">
              <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-[#E9DDF1] p-3 text-[#8C6AA7]">
                {editingId !== null ? (
                  <Pencil size={24} />
                ) : (
                  <Plus size={24} />
                )}
              </div>

              <div>
                <h2 className="font-serif text-2xl font-semibold">
                  {editingId !== null
                    ? "Edit Category"
                    : "New Category"}
                </h2>

                <p className="mt-2 text-xs leading-6 text-[#918398]">
                  {editingId !== null
                    ? "Update your category information."
                    : "Add a new topic to your blog."}
                </p>
              </div>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-6 sm:p-8"
            >
              {/* CATEGORY NAME */}
              <div>
                <label
                  htmlFor="category-name"
                  className="mb-3 flex items-center gap-2 text-sm font-bold"
                >
                  <Tag
                    size={17}
                    className="text-[#8C6AA7]"
                  />
                  Category Name
                </label>

                <input
                  id="category-name"
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Example: Technology"
                  required
                  className={inputClass}
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label
                  htmlFor="category-description"
                  className="mb-3 block text-sm font-bold"
                >
                  Description
                </label>

                <textarea
                  id="category-description"
                  value={form.description}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Write a short description of this category..."
                  rows={5}
                  className={`${inputClass} resize-y`}
                />

                <p className="mt-3 text-xs leading-6 text-[#918398]">
                  A short description helps
                  explain what this category is about.
                </p>
              </div>

              {/* FORM ACTIONS */}
              <div className="flex flex-wrap gap-3 border-t border-[#F0E8F2] pt-6">
                <button
                  type="submit"
                  disabled={saving || deletingId !== null}
                  className={primaryButton}
                >
                  {editingId !== null ? (
                    <Save size={17} />
                  ) : (
                    <Plus size={17} />
                  )}

                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Save Changes"
                      : "Create Category"}
                </button>

                {editingId !== null && (
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                    className={secondaryButton}
                  >
                    <X size={17} />
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* CATEGORY LIST */}
          <section className="overflow-hidden rounded-[30px] border border-[#E9DFEF] bg-white shadow-[0_12px_40px_rgba(105,83,125,0.045)]">

            {/* LIST HEADER */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0E8F2] px-6 py-7 sm:px-8">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#9D79B6]">
                  <BookOpen size={15} />
                  Topic Library
                </span>

                <h2 className="mt-3 font-serif text-2xl font-semibold">
                  All Categories
                </h2>

                <p className="mt-2 text-xs text-[#918398]">
                  {loading
                    ? "Loading categories..."
                    : `${categories.length} categories available`}
                </p>
              </div>

              <button
                type="button"
                onClick={fetchCategories}
                disabled={
                  loading ||
                  saving ||
                  deletingId !== null
                }
                className={secondaryButton}
              >
                <RefreshCw
                  size={17}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>

            {/* LOADING */}
            {loading ? (
              <div className="space-y-4 p-6 sm:p-8">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-24 animate-pulse rounded-2xl bg-[#F3EBF7]"
                  />
                ))}
              </div>
            ) : categories.length === 0 ? (
              /* EMPTY STATE */
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#F0E5F5]">
                  <FolderOpen
                    size={36}
                    className="text-[#9D79B6]"
                  />
                </div>

                <h3 className="mt-6 font-serif text-2xl font-semibold">
                  No Categories Yet
                </h3>

                <p className="mt-4 text-sm leading-7 text-[#918398]">
                  Create your first category
                  using the form.
                </p>
              </div>
            ) : (
              /* CATEGORY ITEMS */
              <div className="space-y-4 p-5 sm:p-7">
                {categories.map((category) => (
                  <article
                    key={category.id}
                    className="rounded-[22px] border border-[#E9DFEF] bg-[#FFFCFE] p-5 transition-all hover:border-[#D7BCE5] hover:shadow-[0_10px_30px_rgba(105,83,125,0.05)]"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

                      {/* CATEGORY DETAILS */}
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F0E5F5] text-[#8C6AA7]">
                          <FolderOpen size={23} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="break-words font-serif text-lg font-semibold">
                            {category.name}
                          </h3>

                          <p className="mt-2 break-all text-xs text-[#918398]">
                            Slug:{" "}
                            <span className="font-semibold text-[#8C6AA7]">
                              {category.slug || "—"}
                            </span>
                          </p>

                          {category.description && (
                            <p className="mt-3 text-sm leading-7 text-[#918398]">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(category)
                          }
                          disabled={
                            saving ||
                            deletingId !== null
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-[#E0CFE9] bg-[#F7F0FA] px-4 py-2.5 text-xs font-bold text-[#8C6AA7] transition hover:bg-[#EDE0F3] disabled:opacity-50"
                        >
                          <Pencil size={15} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(category)
                          }
                          disabled={
                            saving ||
                            deletingId !== null
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          <Trash2 size={15} />
                          {deletingId === category.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* FOOTER */}
        <footer className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#E9DFEF] pt-7 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-[#B0A2B7]">
            © {new Date().getFullYear()} MyBlog.
            Category Management.
          </p>

          <Link
            to="/admin/dashboard"
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