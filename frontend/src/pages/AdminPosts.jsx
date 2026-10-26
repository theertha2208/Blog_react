import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Filter,
  FolderOpen,
  Pencil,
  RefreshCw,
  Search,
  Save,
  Trash2,
  X,
  XCircle,
  UserRound,
  MessageSquareWarning,
  Flower2,
  Sparkles,
  BookOpen,
  AlertCircle,
  CalendarDays,
} from "lucide-react";
import { apiRequest } from "../services/api";

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

function formatDate(date) {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const inputClass =
  "w-full rounded-2xl border border-[#E4D7EA] bg-white px-4 py-3.5 text-sm text-[#43394B] outline-none transition placeholder:text-[#B3A5BA] focus:border-[#A889BE] focus:ring-4 focus:ring-[#EDE0F3]/60";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#8C6AA7] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#75538F] disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full border border-[#DCC6E8] bg-white px-6 py-3 text-sm font-bold text-[#8C6AA7] transition hover:bg-[#F7F0FA] disabled:cursor-not-allowed disabled:opacity-50";

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [busyId, setBusyId] = useState(null);

  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    category: "",
  });

  // FETCH POSTS
  async function fetchPosts() {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (filter) {
        params.set("status", filter);
      }

      const query = params.toString();

      const endpoint = query
        ? `/api/admin/posts/?${query}`
        : "/api/admin/posts/";

      const data = await apiRequest(endpoint);

      setPosts(
        Array.isArray(data)
          ? data
          : data.results ?? []
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // INITIAL DATA
  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [postData, categoryData] =
          await Promise.all([
            apiRequest("/api/admin/posts/"),
            apiRequest("/api/admin/categories/"),
          ]);

        if (!active) return;

        setPosts(
          Array.isArray(postData)
            ? postData
            : postData.results ?? []
        );

        setCategories(
          Array.isArray(categoryData)
            ? categoryData
            : categoryData.results ?? []
        );
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  // EDIT FORM
  function openEditForm(post) {
    setEditId(post.id);
    setRejectId(null);
    setError("");
    setSuccess("");

    setEditForm({
      title: post.title ?? "",
      content: post.content ?? "",
      category: String(
        post.category?.id ?? post.category ?? ""
      ),
    });
  }

  function closeEditForm() {
    setEditId(null);
    setEditForm({
      title: "",
      content: "",
      category: "",
    });
  }

  async function handleSaveEdit(post) {
    if (!editForm.title.trim()) {
      setError("Please enter a blog title.");
      return;
    }

    if (!editForm.content.trim()) {
      setError("Please enter blog content.");
      return;
    }

    if (!editForm.category) {
      setError("Please select a category.");
      return;
    }

    setBusyId(post.id);
    setError("");
    setSuccess("");

    try {
      await apiRequest(
        `/api/admin/posts/${post.id}/`,
        {
          method: "PATCH",
          body: JSON.stringify({
            title: editForm.title.trim(),
            content: editForm.content.trim(),
            category: Number(editForm.category),
          }),
        }
      );

      closeEditForm();
      await fetchPosts();

      setSuccess(
        "Post updated successfully. It is now pending approval."
      );
    } catch (err) {
      setError(
        err.data
          ? JSON.stringify(err.data)
          : err.message
      );
    } finally {
      setBusyId(null);
    }
  }

  // APPROVE POST
  async function handleApprove(post) {
    const confirmed = window.confirm(
      `Approve "${post.title}"?`
    );

    if (!confirmed) return;

    setBusyId(post.id);
    setError("");
    setSuccess("");

    try {
      await apiRequest(
        `/api/admin/posts/${post.id}/approve/`,
        { method: "POST" }
      );

      await fetchPosts();
      setSuccess("Post approved successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  // REJECT POST
  function openRejectForm(post) {
    setRejectId(post.id);
    setEditId(null);
    setRejectReason("");
    setError("");
    setSuccess("");
  }

  async function handleReject(post) {
    if (!rejectReason.trim()) {
      setError("A rejection reason is required.");
      return;
    }

    setBusyId(post.id);
    setError("");
    setSuccess("");

    try {
      await apiRequest(
        `/api/admin/posts/${post.id}/reject/`,
        {
          method: "POST",
          body: JSON.stringify({
            reason: rejectReason.trim(),
          }),
        }
      );

      setRejectId(null);
      setRejectReason("");

      await fetchPosts();
      setSuccess("Post rejected successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  // DELETE POST
  async function handleDelete(post) {
    const confirmed = window.confirm(
      `Permanently delete "${post.title}"?`
    );

    if (!confirmed) return;

    setBusyId(post.id);
    setError("");
    setSuccess("");

    try {
      await apiRequest(
        `/api/admin/posts/${post.id}/`,
        {
          method: "DELETE",
        }
      );

      await fetchPosts();
      setSuccess("Post deleted successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  const pendingCount = posts.filter(
    (post) => post.approval_status === "pending"
  ).length;

  const approvedCount = posts.filter(
    (post) => post.approval_status === "approved"
  ).length;

  const rejectedCount = posts.filter(
    (post) => post.approval_status === "rejected"
  ).length;

  return (
    <main className="min-h-screen bg-[#FFFCF9] px-5 py-9 text-[#43394B] md:px-8 md:py-12">
      <div className="mx-auto max-w-7xl">

        {/* BACK NAVIGATION */}
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
              Content Management
            </span>

            <h1 className="mt-6 font-serif text-3xl font-semibold sm:text-4xl">
              Manage Blog Posts
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-8 text-[#F4E8F8]">
              Review submissions, edit articles,
              approve beautiful stories, and keep
              your blogging community organized.
            </p>
          </div>
        </section>

        {/* STATISTICS */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Loaded Posts",
              value: posts.length,
              icon: FileText,
              color: "text-[#8C6AA7]",
              background: "bg-[#F0E5F5]",
            },
            {
              label: "Pending Review",
              value: pendingCount,
              icon: Clock3,
              color: "text-[#A77730]",
              background: "bg-[#FFF3DF]",
            },
            {
              label: "Approved",
              value: approvedCount,
              icon: CheckCircle2,
              color: "text-[#357B56]",
              background: "bg-[#E7F5ED]",
            },
            {
              label: "Rejected",
              value: rejectedCount,
              icon: XCircle,
              color: "text-[#B75C68]",
              background: "bg-[#FDEBEC]",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-[24px] border border-[#E9DFEF] bg-white p-5 shadow-[0_10px_30px_rgba(105,83,125,0.04)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-[#94869C]">
                      {item.label}
                    </p>

                    <h3 className="mt-3 font-serif text-3xl font-semibold">
                      {loading ? "..." : item.value}
                    </h3>
                  </div>

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.background}`}
                  >
                    <Icon
                      size={23}
                      className={item.color}
                    />
                  </div>
                </div>
              </div>
            );
          })}
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

        {/* SEARCH AND FILTER */}
        <section className="mt-9 rounded-[28px] border border-[#E9DFEF] bg-white p-6 shadow-[0_10px_35px_rgba(105,83,125,0.04)] sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F0E5F5] text-[#8C6AA7]">
              <Filter size={21} />
            </div>

            <div>
              <h2 className="font-serif text-2xl font-semibold">
                Find Stories
              </h2>

              <p className="mt-1 text-xs text-[#918398]">
                Search and filter submissions.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A58CB6]"
              />

              <input
                type="text"
                placeholder="Search by title or author..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    fetchPosts();
                  }
                }}
                className={`${inputClass} !pl-12`}
              />
            </div>

            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value)
              }
              aria-label="Filter by approval status"
              className={`${inputClass} md:!w-48`}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <button
              type="button"
              onClick={fetchPosts}
              disabled={loading || busyId !== null}
              className={primaryButton}
            >
              <Search size={17} />
              Search Posts
            </button>
          </div>
        </section>

        {/* POSTS LIST */}
        <section className="mt-8 overflow-hidden rounded-[30px] border border-[#E9DFEF] bg-white shadow-[0_12px_40px_rgba(105,83,125,0.045)]">

          {/* LIST HEADER */}
          <div className="flex flex-wrap items-center justify-between gap-5 border-b border-[#F0E8F2] px-6 py-7 sm:px-8">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#9D79B6]">
                <BookOpen size={15} />
                Story Library
              </span>

              <h2 className="mt-3 font-serif text-2xl font-semibold">
                All Blog Posts
              </h2>

              <p className="mt-2 text-sm text-[#918398]">
                {loading
                  ? "Loading posts..."
                  : `${posts.length} posts found`}
              </p>
            </div>

            <button
              type="button"
              onClick={fetchPosts}
              disabled={loading || busyId !== null}
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
            <div className="space-y-5 p-6 sm:p-8">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-36 animate-pulse rounded-2xl bg-[#F3EBF7]"
                />
              ))}
            </div>
          ) : posts.length === 0 ? (
            /* EMPTY STATE */
            <div className="px-6 py-20 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#F0E5F5]">
                <FileText
                  size={36}
                  className="text-[#9D79B6]"
                />
              </div>

              <h3 className="mt-6 font-serif text-2xl font-semibold">
                No Stories Found
              </h3>

              <p className="mx-auto mt-4 max-w-md text-sm leading-8 text-[#918398]">
                There are no blog posts matching
                your current search or filter.
              </p>
            </div>
          ) : (
            /* POST CARDS */
            <div className="space-y-5 p-5 sm:p-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-[26px] border border-[#E9DFEF] bg-[#FFFCFE] transition-all duration-300 hover:border-[#D7BCE5] hover:shadow-[0_12px_35px_rgba(105,83,125,0.06)]"
                >
                  <div className="p-6 sm:p-7">
                    <div className="flex flex-col justify-between gap-6 lg:flex-row">

                      {/* POST INFORMATION */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="break-words font-serif text-xl font-semibold leading-snug sm:text-2xl">
                            {post.title}
                          </h3>

                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-bold capitalize ${getStatusStyle(
                              post.approval_status
                            )}`}
                          >
                            {post.approval_status || "Unknown"}
                          </span>
                        </div>

                        {/* AUTHOR AND CATEGORY */}
                        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#918398]">
                          <span className="inline-flex items-center gap-2">
                            <UserRound
                              size={16}
                              className="text-[#A887BE]"
                            />
                            {post.author_name || "Unknown"}
                          </span>

                          <span className="inline-flex items-center gap-2">
                            <FolderOpen
                              size={16}
                              className="text-[#A887BE]"
                            />
                            {post.category_name || "Uncategorized"}
                          </span>

                          {post.created_at && (
                            <span className="inline-flex items-center gap-2">
                              <CalendarDays
                                size={16}
                                className="text-[#A887BE]"
                              />
                              {formatDate(post.created_at)}
                            </span>
                          )}
                        </div>

                        {/* PUBLICATION STATUS */}
                        <div className="mt-5 flex flex-wrap items-center gap-3">
                          <span className="text-xs font-semibold text-[#918398]">
                            Publication Status:
                          </span>

                          <span
                            className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
                              post.is_published
                                ? "bg-[#E7F5ED] text-[#357B56]"
                                : "bg-[#F2EDF5] text-[#887B8F]"
                            }`}
                          >
                            {post.is_published
                              ? "Published"
                              : "Not Published"}
                          </span>
                        </div>

                        {/* REJECTION REASON */}
                        {post.approval_status === "rejected" &&
                          post.rejection_reason && (
                            <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-5 py-4">
                              <p className="text-sm leading-7 text-red-700">
                                <span className="font-bold">
                                  Rejection Reason:{" "}
                                </span>
                                {post.rejection_reason}
                              </p>
                            </div>
                          )}
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="flex flex-wrap items-start gap-2 lg:max-w-[310px] lg:justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(post)
                          }
                          disabled={busyId !== null}
                          className="inline-flex items-center gap-2 rounded-xl border border-[#E0CFE9] bg-[#F7F0FA] px-4 py-2.5 text-xs font-bold text-[#8C6AA7] transition hover:bg-[#EDE0F3] disabled:opacity-50"
                        >
                          <Pencil size={15} />
                          Edit
                        </button>

                        {post.approval_status !== "approved" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleApprove(post)
                            }
                            disabled={busyId !== null}
                            className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-xs font-bold text-green-700 transition hover:bg-green-100 disabled:opacity-50"
                          >
                            <CheckCircle2 size={15} />
                            Approve
                          </button>
                        )}

                        {post.approval_status !== "rejected" && (
                          <button
                            type="button"
                            onClick={() =>
                              openRejectForm(post)
                            }
                            disabled={busyId !== null}
                            className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                          >
                            <XCircle size={15} />
                            Reject
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(post)
                          }
                          disabled={busyId !== null}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          <Trash2 size={15} />
                          {busyId === post.id
                            ? "Working..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>

                    {/* EDIT FORM */}
                    {editId === post.id && (
                      <div className="mt-7 rounded-[24px] border border-[#E4D7EA] bg-[#F8F2FB] p-5 sm:p-7">
                        <div className="mb-6 flex items-center justify-between gap-3">
                          <h4 className="flex items-center gap-3 font-serif text-xl font-semibold">
                            <Pencil
                              size={20}
                              className="text-[#8C6AA7]"
                            />
                            Edit Blog Post
                          </h4>

                          <button
                            type="button"
                            onClick={closeEditForm}
                            disabled={busyId !== null}
                            aria-label="Close edit form"
                            className="rounded-xl p-2 text-[#887B8F] hover:bg-[#E9DDF1]"
                          >
                            <X size={19} />
                          </button>
                        </div>

                        <div className="space-y-5">
                          {/* TITLE */}
                          <div>
                            <label
                              htmlFor={`edit-title-${post.id}`}
                              className="mb-2 block text-sm font-bold"
                            >
                              Blog Title
                            </label>

                            <input
                              id={`edit-title-${post.id}`}
                              type="text"
                              value={editForm.title}
                              onChange={(event) =>
                                setEditForm({
                                  ...editForm,
                                  title: event.target.value,
                                })
                              }
                              className={inputClass}
                            />
                          </div>

                          {/* CONTENT */}
                          <div>
                            <label
                              htmlFor={`edit-content-${post.id}`}
                              className="mb-2 block text-sm font-bold"
                            >
                              Blog Content
                            </label>

                            <textarea
                              id={`edit-content-${post.id}`}
                              rows={8}
                              value={editForm.content}
                              onChange={(event) =>
                                setEditForm({
                                  ...editForm,
                                  content: event.target.value,
                                })
                              }
                              className={`${inputClass} resize-y`}
                            />
                          </div>

                          {/* CATEGORY */}
                          <div>
                            <label
                              htmlFor={`edit-category-${post.id}`}
                              className="mb-2 block text-sm font-bold"
                            >
                              Category
                            </label>

                            <select
                              id={`edit-category-${post.id}`}
                              value={editForm.category}
                              onChange={(event) =>
                                setEditForm({
                                  ...editForm,
                                  category: event.target.value,
                                })
                              }
                              className={inputClass}
                            >
                              <option value="">
                                Select Category
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
                          </div>

                          {/* FORM ACTIONS */}
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                handleSaveEdit(post)
                              }
                              disabled={busyId !== null}
                              className={primaryButton}
                            >
                              <Save size={17} />
                              {busyId === post.id
                                ? "Saving..."
                                : "Save Changes"}
                            </button>

                            <button
                              type="button"
                              onClick={closeEditForm}
                              disabled={busyId !== null}
                              className={secondaryButton}
                            >
                              Cancel
                            </button>
                          </div>

                          <p className="text-xs leading-6 text-[#918398]">
                            Editing a post resets its
                            approval status to Pending
                            and unpublishes it.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* REJECTION FORM */}
                    {rejectId === post.id && (
                      <div className="mt-7 rounded-[24px] border border-amber-200 bg-[#FFF9EF] p-5 sm:p-7">
                        <h4 className="flex items-center gap-3 font-serif text-xl font-semibold">
                          <MessageSquareWarning
                            size={22}
                            className="text-amber-700"
                          />
                          Reject Blog Post
                        </h4>

                        <p className="mt-3 text-sm leading-7 text-[#918398]">
                          Explain why this story is being
                          rejected so the author can
                          understand what needs improvement.
                        </p>

                        <textarea
                          rows={4}
                          value={rejectReason}
                          onChange={(event) =>
                            setRejectReason(event.target.value)
                          }
                          placeholder="Enter rejection reason..."
                          aria-label="Rejection reason"
                          className={`${inputClass} mt-5 resize-y`}
                        />

                        <div className="mt-5 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleReject(post)
                            }
                            disabled={
                              busyId !== null ||
                              !rejectReason.trim()
                            }
                            className="inline-flex items-center gap-2 rounded-full bg-amber-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-amber-800 disabled:opacity-50"
                          >
                            <XCircle size={17} />
                            Confirm Rejection
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setRejectId(null)
                            }
                            disabled={busyId !== null}
                            className={secondaryButton}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#E9DFEF] pt-7 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-[#B0A2B7]">
            © {new Date().getFullYear()} MyBlog.
            Content Management.
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