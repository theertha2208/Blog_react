import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  EyeOff,
  MessageSquare,
  RefreshCw,
  Trash2,
  UserRound,
  FileText,
  Flower2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Filter,
  Heart,
} from "lucide-react";

import { apiRequest } from "../services/api";

function StatCard({
  label,
  value,
  icon: Icon,
  background,
  iconColor,
  loading,
}) {
  return (
    <div className="rounded-[26px] border border-[#E9DFEF] bg-white p-6 shadow-[0_10px_35px_rgba(105,83,125,0.045)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(105,83,125,0.09)]">
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

export default function AdminComments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState(null);

  const [statusFilter, setStatusFilter] =
    useState("all");

  // FETCH COMMENTS
  async function fetchComments() {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest(
        "/api/admin/comments/"
      );

      setComments(
        Array.isArray(data)
          ? data
          : data.results ?? []
      );
    } catch (err) {
      setError(
        err.message || "Unable to load comments."
      );
    } finally {
      setLoading(false);
    }
  }

  // LOAD COMMENTS ON PAGE OPEN
  useEffect(() => {
    fetchComments();
  }, []);

  // APPROVE, HIDE, OR DELETE COMMENT
  async function handleAction(commentId, action) {
    if (action === "delete") {
      const confirmed = window.confirm(
        "Are you sure you want to permanently delete this comment?"
      );

      if (!confirmed) return;
    }

    setBusyId(commentId);
    setError("");
    setMessage("");

    try {
      const endpoint =
        action === "delete"
          ? `/api/admin/comments/${commentId}/`
          : `/api/admin/comments/${commentId}/${action}/`;

      await apiRequest(endpoint, {
        method:
          action === "delete"
            ? "DELETE"
            : "POST",
      });

      await fetchComments();

      setMessage(
        action === "approve"
          ? "Comment approved successfully."
          : action === "unapprove"
            ? "Comment hidden successfully."
            : "Comment deleted successfully."
      );
    } catch (err) {
      setError(
        err.message || "Unable to update comment."
      );
    } finally {
      setBusyId(null);
    }
  }

  // STATISTICS
  const approvedCount = comments.filter(
    (comment) => comment.is_approved
  ).length;

  const hiddenCount = comments.filter(
    (comment) => !comment.is_approved
  ).length;

  const stats = [
    {
      label: "Total Comments",
      value: comments.length,
      icon: MessageSquare,
      background: "bg-[#F0E5F5]",
      iconColor: "text-[#8C6AA7]",
    },
    {
      label: "Approved",
      value: approvedCount,
      icon: CheckCircle2,
      background: "bg-[#E7F5ED]",
      iconColor: "text-[#357B56]",
    },
    {
      label: "Pending / Hidden",
      value: hiddenCount,
      icon: Clock3,
      background: "bg-[#FFF3DF]",
      iconColor: "text-[#A77730]",
    },
  ];

  // FILTER COMMENTS LOCALLY
  const filteredComments = comments.filter(
    (comment) => {
      if (statusFilter === "approved") {
        return comment.is_approved;
      }

      if (statusFilter === "hidden") {
        return !comment.is_approved;
      }

      return true;
    }
  );

  return (
    <main className="min-h-screen bg-[#FFFCF9] px-5 py-9 text-[#43394B] md:px-8 md:py-12">
      <div className="mx-auto max-w-7xl">

        {/* BACK TO DASHBOARD */}
        <Link
          to="/admin/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#8C6AA7] transition hover:text-[#694B84]"
        >
          <ArrowLeft size={17} />
          Back to Admin Dashboard
        </Link>

        {/* HEADER BANNER */}
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
              Community Management
            </span>

            <h1 className="mt-6 font-serif text-3xl font-semibold sm:text-4xl">
              Manage Comments
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-8 text-[#F4E8F8]">
              Review conversations, approve thoughtful
              comments, and keep your blogging
              community warm and welcoming.
            </p>
          </div>
        </section>

        {/* SUCCESS MESSAGE */}
        {message && (
          <div
            role="status"
            className="mt-7 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm text-green-700"
          >
            <CheckCircle2
              size={20}
              className="shrink-0"
            />
            {message}
          </div>
        )}

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

        {/* STATISTICS CARDS */}
        <section className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              {...stat}
              loading={loading}
            />
          ))}
        </section>

        {/* MODERATION INFO */}
        <section className="mt-9 flex flex-col items-start justify-between gap-5 rounded-[26px] border border-[#E8DDEF] bg-gradient-to-br from-[#F4EAF8] to-[#FFF2EB] p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#8C6AA7]">
              <ShieldCheck size={26} />
            </div>

            <div>
              <h2 className="font-serif text-xl font-semibold sm:text-2xl">
                Keep the Conversation Kind
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-[#918398]">
                Review reader comments and choose
                which conversations appear publicly
                on your blog.
              </p>
            </div>
          </div>

          <Heart
            size={35}
            className="hidden shrink-0 text-[#B69AC8] sm:block"
          />
        </section>

        {/* COMMENTS CONTAINER */}
        <section className="mt-9 overflow-hidden rounded-[30px] border border-[#E9DFEF] bg-white shadow-[0_12px_40px_rgba(105,83,125,0.045)]">

          {/* COMMENTS HEADER */}
          <div className="flex flex-wrap items-center justify-between gap-5 border-b border-[#F0E8F2] px-6 py-7 sm:px-8">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#9D79B6]">
                <MessageSquare size={15} />
                Reader Conversations
              </span>

              <h2 className="mt-3 font-serif text-2xl font-semibold sm:text-3xl">
                All Comments
              </h2>

              <p className="mt-2 text-sm text-[#918398]">
                {loading
                  ? "Loading comments..."
                  : `${filteredComments.length} comments displayed`}
              </p>
            </div>

            <button
              type="button"
              onClick={fetchComments}
              disabled={
                loading || busyId !== null
              }
              className="inline-flex items-center gap-2 rounded-full border border-[#DCC6E8] bg-white px-5 py-3 text-sm font-bold text-[#8C6AA7] transition hover:bg-[#F7F0FA] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={
                  loading ? "animate-spin" : ""
                }
              />
              Refresh
            </button>
          </div>

          {/* STATUS FILTER */}
          <div className="flex flex-wrap items-center gap-3 border-b border-[#F0E8F2] bg-[#FFFCFE] px-6 py-5 sm:px-8">

            <span className="mr-2 inline-flex items-center gap-2 text-xs font-bold text-[#918398]">
              <Filter size={16} />
              Filter:
            </span>

            {[
              {
                label: "All Comments",
                value: "all",
              },
              {
                label: "Approved",
                value: "approved",
              },
              {
                label: "Pending / Hidden",
                value: "hidden",
              },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() =>
                  setStatusFilter(item.value)
                }
                className={`rounded-full px-4 py-2.5 text-xs font-bold transition ${
                  statusFilter === item.value
                    ? "bg-[#8C6AA7] text-white"
                    : "border border-[#E9DFEF] bg-white text-[#887B8F] hover:bg-[#F0E5F5] hover:text-[#8C6AA7]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* LOADING STATE */}
          {loading ? (
            <div className="space-y-5 p-6 sm:p-8">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-36 animate-pulse rounded-2xl bg-[#F3EBF7]"
                />
              ))}
            </div>
          ) : filteredComments.length === 0 ? (
            /* EMPTY STATE */
            <div className="px-6 py-20 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#F0E5F5]">
                <MessageSquare
                  size={36}
                  className="text-[#9D79B6]"
                />
              </div>

              <h3 className="mt-6 font-serif text-2xl font-semibold">
                No Comments Found
              </h3>

              <p className="mx-auto mt-4 max-w-md text-sm leading-8 text-[#918398]">
                {statusFilter === "all"
                  ? "Comments from your blogging community will appear here."
                  : "There are no comments matching this filter."}
              </p>
            </div>
          ) : (
            /* COMMENTS LIST */
            <div className="space-y-5 p-5 sm:p-8">
              {filteredComments.map((comment) => (
                <article
                  key={comment.id}
                  className="rounded-[26px] border border-[#E9DFEF] bg-[#FFFCFE] p-6 transition-all duration-300 hover:border-[#D7BCE5] hover:shadow-[0_12px_35px_rgba(105,83,125,0.06)] sm:p-7"
                >
                  <div className="flex flex-col justify-between gap-6 lg:flex-row">

                    {/* COMMENT INFORMATION */}
                    <div className="min-w-0 flex-1">

                      {/* STATUS */}
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold ${
                          comment.is_approved
                            ? "border-[#CDE8D7] bg-[#E7F5ED] text-[#357B56]"
                            : "border-[#F3DFB8] bg-[#FFF3DF] text-[#A77730]"
                        }`}
                      >
                        {comment.is_approved ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <Clock3 size={14} />
                        )}

                        {comment.is_approved
                          ? "Approved"
                          : "Pending / Hidden"}
                      </span>

                      {/* COMMENT BODY */}
                      <div className="mt-5 rounded-[20px] border border-[#EDE3F1] bg-white px-5 py-5">
                        <p className="whitespace-pre-wrap break-words text-sm leading-8 text-[#554A5B]">
                          {comment.body}
                        </p>
                      </div>

                      {/* COMMENT METADATA */}
                      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#918398]">
                        <span className="inline-flex items-center gap-2">
                          <UserRound
                            size={17}
                            className="text-[#A887BE]"
                          />

                          By:

                          <span className="font-bold text-[#65566D]">
                            {comment.username || "Unknown"}
                          </span>
                        </span>

                        <span className="inline-flex items-center gap-2">
                          <FileText
                            size={17}
                            className="text-[#A887BE]"
                          />

                          Post ID: {comment.post}
                        </span>
                      </div>
                    </div>

                    {/* MODERATION ACTIONS */}
                    <div className="flex shrink-0 flex-wrap items-start gap-3">

                      {!comment.is_approved ? (
                        <button
                          type="button"
                          disabled={busyId !== null}
                          onClick={() =>
                            handleAction(
                              comment.id,
                              "approve"
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-bold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <CheckCircle2 size={16} />

                          {busyId === comment.id
                            ? "Working..."
                            : "Approve"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busyId !== null}
                          onClick={() =>
                            handleAction(
                              comment.id,
                              "unapprove"
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <EyeOff size={16} />

                          {busyId === comment.id
                            ? "Working..."
                            : "Hide"}
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={busyId !== null}
                        onClick={() =>
                          handleAction(
                            comment.id,
                            "delete"
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* BOTTOM MESSAGE */}
        <section className="mt-10 flex flex-col items-center justify-between gap-5 rounded-[26px] bg-[#F3E9F7] px-7 py-8 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="font-serif text-xl font-semibold">
              A welcoming community starts here.
            </h3>

            <p className="mt-2 text-sm text-[#918398]">
              Every thoughtful conversation makes
              MyBlog a better place.
            </p>
          </div>

          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-[#8C6AA7] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#75538F]"
          >
            Back to Dashboard
            <ArrowRight size={17} />
          </Link>
        </section>

        {/* FOOTER */}
        <footer className="mt-12 border-t border-[#E9DFEF] pt-7 text-center">
          <p className="text-xs text-[#B0A2B7]">
            © {new Date().getFullYear()} MyBlog.
            Comment Moderation.
          </p>
        </footer>
      </div>
    </main>
  );
}