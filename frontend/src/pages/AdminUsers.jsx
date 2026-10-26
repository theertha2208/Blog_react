import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Flower2,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserRound,
  Users,
  UserX,
  Filter,
} from "lucide-react";

import { apiRequest } from "../services/api";

// STATISTICS CARD
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

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // FETCH USERS
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/api/admin/users/");

      setUsers(
        Array.isArray(data)
          ? data
          : data.results ?? []
      );
    } catch (err) {
      setError(
        err.message || "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // INITIAL LOAD
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ACTIVATE OR DEACTIVATE USER
  async function toggleUser(user) {
    if (user.is_superuser) {
      return;
    }

    const action = user.is_active
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.username}?`
    );

    if (!confirmed) return;

    setUpdatingId(user.id);
    setError("");
    setMessage("");

    try {
      await apiRequest(
        `/api/admin/users/${user.id}/toggle-active/`,
        {
          method: "POST",
        }
      );

      await fetchUsers();

      setMessage(
        `User ${user.username} ${
          action === "activate"
            ? "activated"
            : "deactivated"
        } successfully.`
      );
    } catch (err) {
      setError(
        err.message || "Failed to update user."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  // SEARCH AND FILTER
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      `${user.username} ${user.email ?? ""}`
        .toLowerCase()
        .includes(search.trim().toLowerCase());

    let matchesStatus = true;

    if (statusFilter === "active") {
      matchesStatus = user.is_active;
    } else if (statusFilter === "inactive") {
      matchesStatus = !user.is_active;
    } else if (statusFilter === "admin") {
      matchesStatus = user.is_staff || user.is_superuser;
    }

    return matchesSearch && matchesStatus;
  });

  // STATISTICS
  const activeCount = users.filter(
    (user) => user.is_active
  ).length;

  const inactiveCount = users.filter(
    (user) => !user.is_active
  ).length;

  const adminCount = users.filter(
    (user) => user.is_staff || user.is_superuser
  ).length;

  const stats = [
    {
      label: "Total Users",
      value: users.length,
      icon: Users,
      background: "bg-[#F0E5F5]",
      iconColor: "text-[#8C6AA7]",
    },
    {
      label: "Active Users",
      value: activeCount,
      icon: UserCheck,
      background: "bg-[#E7F5ED]",
      iconColor: "text-[#357B56]",
    },
    {
      label: "Inactive Users",
      value: inactiveCount,
      icon: UserX,
      background: "bg-[#FDEBEC]",
      iconColor: "text-[#B75C68]",
    },
    {
      label: "Administrators",
      value: adminCount,
      icon: ShieldCheck,
      background: "bg-[#F8E8F2]",
      iconColor: "text-[#A36A97]",
    },
  ];

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
              Community Administration
            </span>

            <h1 className="mt-6 font-serif text-3xl font-semibold sm:text-4xl">
              Manage Users
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-8 text-[#F4E8F8]">
              Meet your blogging community,
              manage account access, and
              keep MyBlog a welcoming place
              for every writer and reader.
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

        {/* STATISTICS */}
        <section className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              {...stat}
              loading={loading}
            />
          ))}
        </section>

        {/* COMMUNITY INFO */}
        <section className="mt-9 flex flex-col items-start justify-between gap-5 rounded-[26px] border border-[#E8DDEF] bg-gradient-to-br from-[#F4EAF8] to-[#FFF2EB] p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#8C6AA7]">
              <Users size={26} />
            </div>

            <div>
              <h2 className="font-serif text-xl font-semibold sm:text-2xl">
                Your Blogging Community
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-[#918398]">
                View member accounts, search for
                registered users, and control
                account access when necessary.
              </p>
            </div>
          </div>

          <ShieldCheck
            size={35}
            className="hidden shrink-0 text-[#B69AC8] sm:block"
          />
        </section>

        {/* SEARCH AND FILTER */}
        <section className="mt-9 rounded-[28px] border border-[#E9DFEF] bg-white p-6 shadow-[0_10px_35px_rgba(105,83,125,0.04)] sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F0E5F5] text-[#8C6AA7]">
              <Filter size={21} />
            </div>

            <div>
              <h2 className="font-serif text-2xl font-semibold">
                Find Community Members
              </h2>

              <p className="mt-1 text-xs text-[#918398]">
                Search by username or email
                and filter by account status.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row">
            {/* SEARCH INPUT */}
            <div className="relative min-w-0 flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A58CB6]"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by username or email..."
                aria-label="Search users"
                className="w-full rounded-2xl border border-[#E4D7EA] bg-white py-3.5 pl-12 pr-4 text-sm text-[#43394B] outline-none transition placeholder:text-[#B3A5BA] focus:border-[#A889BE] focus:ring-4 focus:ring-[#EDE0F3]/60"
              />
            </div>

            {/* STATUS FILTER */}
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              aria-label="Filter users"
              className="rounded-2xl border border-[#E4D7EA] bg-white px-4 py-3.5 text-sm text-[#43394B] outline-none transition focus:border-[#A889BE] focus:ring-4 focus:ring-[#EDE0F3]/60 md:w-52"
            >
              <option value="all">All Users</option>
              <option value="active">Active Users</option>
              <option value="inactive">Inactive Users</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
        </section>

        {/* USERS LIST */}
        <section className="mt-8 overflow-hidden rounded-[30px] border border-[#E9DFEF] bg-white shadow-[0_12px_40px_rgba(105,83,125,0.045)]">

          {/* LIST HEADER */}
          <div className="flex flex-wrap items-center justify-between gap-5 border-b border-[#F0E8F2] px-6 py-7 sm:px-8">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#9D79B6]">
                <Users size={15} />
                Member Directory
              </span>

              <h2 className="mt-3 font-serif text-2xl font-semibold sm:text-3xl">
                All Users
              </h2>

              <p className="mt-2 text-sm text-[#918398]">
                {loading
                  ? "Loading users..."
                  : `${filteredUsers.length} users found`}
              </p>
            </div>

            <button
              type="button"
              onClick={fetchUsers}
              disabled={
                loading || updatingId !== null
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

          {/* LOADING */}
          {loading ? (
            <div className="space-y-5 p-6 sm:p-8">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-2xl bg-[#F3EBF7]"
                />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            /* EMPTY STATE */
            <div className="px-6 py-20 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#F0E5F5]">
                <Users
                  size={36}
                  className="text-[#9D79B6]"
                />
              </div>

              <h3 className="mt-6 font-serif text-2xl font-semibold">
                No Users Found
              </h3>

              <p className="mx-auto mt-4 max-w-md text-sm leading-8 text-[#918398]">
                {search || statusFilter !== "all"
                  ? "No users match your search or selected filter."
                  : "No registered users are available yet."}
              </p>
            </div>
          ) : (
            /* USER CARDS */
            <div className="space-y-5 p-5 sm:p-8">
              {filteredUsers.map((user) => (
                <article
                  key={user.id}
                  className="rounded-[26px] border border-[#E9DFEF] bg-[#FFFCFE] p-6 transition-all duration-300 hover:border-[#D7BCE5] hover:shadow-[0_12px_35px_rgba(105,83,125,0.06)] sm:p-7"
                >
                  <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

                    {/* USER DETAILS */}
                    <div className="flex min-w-0 items-start gap-4">

                      {/* AVATAR */}
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#F0E5F5] text-[#8C6AA7]">
                        <UserRound size={25} />
                      </div>

                      <div className="min-w-0">
                        {/* USERNAME AND ROLE */}
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="break-words font-serif text-xl font-semibold">
                            {user.username}
                          </h3>

                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold ${
                              user.is_superuser
                                ? "bg-[#F8E8F2] text-[#A36A97]"
                                : user.is_staff
                                  ? "bg-[#F0E5F5] text-[#8C6AA7]"
                                  : "bg-[#F3EFF5] text-[#887B8F]"
                            }`}
                          >
                            {user.is_superuser
                              ? "Super Admin"
                              : user.is_staff
                                ? "Admin"
                                : "User"}
                          </span>
                        </div>

                        {/* EMAIL */}
                        <p className="mt-4 flex items-center gap-2 break-all text-sm text-[#918398]">
                          <Mail
                            size={17}
                            className="shrink-0 text-[#A887BE]"
                          />
                          {user.email || "Email not provided"}
                        </p>

                        {/* ACCOUNT STATUS */}
                        <p className="mt-3 text-xs text-[#918398]">
                          Account Status:{" "}
                          <span
                            className={`font-bold ${
                              user.is_active
                                ? "text-[#357B56]"
                                : "text-[#B75C68]"
                            }`}
                          >
                            {user.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* USER ACTIONS */}
                    <div className="flex shrink-0 flex-wrap items-center gap-3">

                      {/* STATUS BADGE */}
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold ${
                          user.is_active
                            ? "border-[#CDE8D7] bg-[#E7F5ED] text-[#357B56]"
                            : "border-[#F4CDD2] bg-[#FDEBEC] text-[#B75C68]"
                        }`}
                      >
                        {user.is_active ? (
                          <UserCheck size={15} />
                        ) : (
                          <UserX size={15} />
                        )}

                        {user.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>

                      {/* ACTIVATE / DEACTIVATE */}
                      {!user.is_superuser && (
                        <button
                          type="button"
                          onClick={() =>
                            toggleUser(user)
                          }
                          disabled={
                            updatingId !== null ||
                            loading
                          }
                          className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            user.is_active
                              ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                              : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                          }`}
                        >
                          {user.is_active ? (
                            <UserX size={17} />
                          ) : (
                            <UserCheck size={17} />
                          )}

                          {updatingId === user.id
                            ? "Updating..."
                            : user.is_active
                              ? "Deactivate"
                              : "Activate"}
                        </button>
                      )}
                    </div>
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
            User Management.
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