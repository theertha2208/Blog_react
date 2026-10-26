import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Feather,
  Flower2,
  Heart,
  Sparkles,
  UserRound,
  AtSign,
  PenLine,
  AlertCircle,
} from "lucide-react";

const API = "http://127.0.0.1:8000";

// FORMAT IMAGE URL
function getImageUrl(image) {
  if (!image) return null;

  if (image.startsWith("http")) {
    return image;
  }

  return `${API}${image.startsWith("/") ? "" : "/"}${image}`;
}

// FORMAT DATE
function formatDate(date) {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AuthorProfile() {
  const { id } = useParams();

  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // LOAD AUTHOR AND THEIR ARTICLES
  useEffect(() => {
    const controller = new AbortController();

    async function fetchAuthor() {
      try {
        setLoading(true);
        setError("");
        setAuthor(null);
        setPosts([]);

        const [authorResponse, postsResponse] =
          await Promise.all([
            fetch(`${API}/api/authors/${id}/`, {
              signal: controller.signal,
            }),

            fetch(`${API}/api/authors/${id}/posts/`, {
              credentials: "include",
              signal: controller.signal,
            }),
          ]);

        if (!authorResponse.ok) {
          if (authorResponse.status === 404) {
            throw new Error("Author not found.");
          }

          throw new Error(
            "Unable to load author profile."
          );
        }

        if (!postsResponse.ok) {
          throw new Error(
            "Unable to load author's articles."
          );
        }

        const authorData = await authorResponse.json();
        const postsData = await postsResponse.json();

        if (!controller.signal.aborted) {
          setAuthor(authorData);

          setPosts(
            Array.isArray(postsData)
              ? postsData
              : postsData.results || []
          );
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message || "Unable to load author."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchAuthor();

    return () => controller.abort();
  }, [id]);

  // LOADING SCREEN
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFCF9]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-11 w-11 animate-spin rounded-full border-4 border-[#EADCF1] border-t-[#8C6AA7]" />

          <p className="text-sm font-medium text-[#887B8F]">
            Loading author profile...
          </p>
        </div>
      </main>
    );
  }

  // ERROR SCREEN
  if (error || !author) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFCF9] px-5">
        <div className="w-full max-w-lg rounded-[30px] border border-[#E9DFEF] bg-white p-10 text-center shadow-[0_15px_45px_rgba(105,83,125,0.06)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#F0E5F5]">
            <AlertCircle
              size={34}
              className="text-[#9D79B6]"
            />
          </div>

          <h1 className="mt-7 font-serif text-3xl font-semibold text-[#43394B]">
            Author Profile
          </h1>

          <p className="mt-4 text-sm leading-7 text-red-600">
            {error || "Author unavailable."}
          </p>

          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#8C6AA7] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#75538F]"
          >
            <ArrowLeft size={17} />
            Back to Stories
          </Link>
        </div>
      </main>
    );
  }

  // AUTHOR DETAILS
  const displayName =
    [author.first_name, author.last_name]
      .filter(Boolean)
      .join(" ") || author.username;

  const avatar = getImageUrl(
    author.profile_picture_url
  );

  return (
    <main className="min-h-screen bg-[#FFFCF9] px-5 py-9 text-[#43394B] md:px-8 md:py-12">
      <div className="mx-auto max-w-7xl">

        {/* BACK LINK */}
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#8C6AA7] transition hover:text-[#694B84]"
        >
          <ArrowLeft size={17} />
          Back to Stories
        </Link>

        {/* AUTHOR PROFILE SECTION */}
        <section className="overflow-hidden rounded-[32px] border border-[#E9DFEF] bg-white shadow-[0_12px_40px_rgba(105,83,125,0.045)]">

          {/* LAVENDER COVER BANNER */}
          <div className="relative h-44 overflow-hidden bg-gradient-to-r from-[#A889BE] via-[#9C7BB6] to-[#81609B] sm:h-56">
            <div className="pointer-events-none absolute -right-16 -top-20 h-80 w-80 rounded-full bg-white/10 blur-2xl" />

            <Flower2
              size={170}
              strokeWidth={0.7}
              className="pointer-events-none absolute bottom-0 right-12 hidden text-white/20 sm:block"
            />

            <div className="absolute left-7 top-7 sm:left-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-xs font-bold text-white backdrop-blur-sm">
                <Sparkles size={15} />
                MyBlog Writers
              </span>
            </div>
          </div>

          {/* AUTHOR INFORMATION */}
          <div className="px-7 pb-10 sm:px-11">

            {/* PROFILE PICTURE */}
            <div className="-mt-16 relative z-10 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-[5px] border-white bg-[#F0E5F5] shadow-lg sm:h-36 sm:w-36">
              {avatar ? (
                <img
                  src={avatar}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound
                  size={55}
                  className="text-[#9D79B6]"
                />
              )}
            </div>

            {/* AUTHOR NAME */}
            <div className="mt-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#F0E5F5] px-4 py-2 text-xs font-bold text-[#8C6AA7]">
                <Feather size={15} />
                Meet the Author
              </span>

              <h1 className="mt-5 break-words font-serif text-3xl font-semibold sm:text-4xl">
                {displayName}
              </h1>

              {/* USERNAME */}
              <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#9D79B6]">
                <AtSign size={16} />
                {author.username}
              </p>

              {/* BIOGRAPHY */}
              <p className="mt-6 max-w-3xl whitespace-pre-wrap text-sm leading-8 text-[#807087] sm:text-base">
                {author.bio ||
                  "This author has not added a bio yet."}
              </p>

              {/* ARTICLE COUNT */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div className="inline-flex items-center gap-3 rounded-2xl border border-[#E9DFEF] bg-[#F8F2FB] px-6 py-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E9DDF1] text-[#8C6AA7]">
                    <BookOpen size={22} />
                  </div>

                  <div>
                    <p className="font-serif text-2xl font-semibold">
                      {posts.length}
                    </p>

                    <p className="mt-1 text-xs font-medium text-[#918398]">
                      {posts.length === 1
                        ? "Published Article"
                        : "Published Articles"}
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-3 rounded-2xl border border-[#E9DFEF] bg-[#FFF6F9] px-6 py-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8E8F2] text-[#A36A97]">
                    <PenLine size={22} />
                  </div>

                  <div>
                    <p className="font-serif text-lg font-semibold">
                      Storyteller
                    </p>

                    <p className="mt-1 text-xs font-medium text-[#918398]">
                      MyBlog Community
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PUBLISHED ARTICLES */}
        <section className="mt-14">

          {/* SECTION HEADING */}
          <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#9D79B6]">
                <BookOpen size={15} />
                Stories by This Author
              </span>

              <h2 className="mt-4 font-serif text-3xl font-semibold sm:text-4xl">
                Published Articles
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#918398]">
                Explore stories written by {displayName}.
              </p>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-[#DCC6E8] bg-white px-5 py-3 text-sm font-bold text-[#8C6AA7] transition hover:bg-[#F7F0FA]"
            >
              Explore All Stories
              <ArrowRight size={17} />
            </Link>
          </div>

          {/* NO ARTICLES */}
          {posts.length === 0 ? (
            <div className="rounded-[30px] border border-[#E9DFEF] bg-white px-6 py-20 text-center shadow-[0_10px_35px_rgba(105,83,125,0.04)]">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#F0E5F5]">
                <BookOpen
                  size={36}
                  className="text-[#9D79B6]"
                />
              </div>

              <h3 className="mt-6 font-serif text-2xl font-semibold">
                No Articles Yet
              </h3>

              <p className="mx-auto mt-4 max-w-md text-sm leading-8 text-[#918398]">
                This author hasn't published any articles yet.
                Explore other stories while waiting for
                something new.
              </p>

              <Link
                to="/"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#8C6AA7] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#75538F]"
              >
                Explore Other Stories
                <ArrowRight size={17} />
              </Link>
            </div>
          ) : (
            /* ARTICLE GRID */
            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => {
                const image = getImageUrl(
                  post.image_url || post.image
                );

                return (
                  <article
                    key={post.id}
                    className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-[#E9DFEF] bg-white shadow-[0_10px_35px_rgba(105,83,125,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D7BCE5] hover:shadow-[0_20px_45px_rgba(105,83,125,0.1)]"
                  >

                    {/* POST COVER IMAGE */}
                    <Link
                      to={`/posts/${post.id}`}
                      className="block h-56 overflow-hidden bg-[#F0E5F5]"
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={post.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#F0E5F5] to-[#FBEAF3]">
                          <BookOpen
                            size={48}
                            strokeWidth={1.4}
                            className="text-[#B69AC8]"
                          />
                        </div>
                      )}
                    </Link>

                    {/* POST DETAILS */}
                    <div className="flex flex-1 flex-col p-7">

                      {/* CATEGORY */}
                      <span className="w-fit rounded-full bg-[#F0E5F5] px-4 py-1.5 text-xs font-bold text-[#8C6AA7]">
                        {post.category_name || "General"}
                      </span>

                      {/* TITLE */}
                      <Link to={`/posts/${post.id}`}>
                        <h3 className="mt-5 font-serif text-xl font-semibold leading-snug text-[#43394B] transition group-hover:text-[#8C6AA7]">
                          {post.title}
                        </h3>
                      </Link>

                      {/* DATE AND LIKES */}
                      <div className="mt-5 flex flex-wrap items-center gap-5 text-xs text-[#918398]">
                        {post.created_at && (
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays size={15} />
                            {formatDate(post.created_at)}
                          </span>
                        )}

                        <span className="inline-flex items-center gap-2">
                          <Heart
                            size={15}
                            className="text-[#A36A97]"
                          />
                          {post.likes_count ?? 0} Likes
                        </span>
                      </div>

                      {/* READ ARTICLE */}
                      <div className="mt-auto pt-7">
                        <div className="border-t border-[#F0E8F2] pt-5">
                          <Link
                            to={`/posts/${post.id}`}
                            className="inline-flex items-center gap-2 text-sm font-bold text-[#8C6AA7] transition hover:text-[#694B84]"
                          >
                            Read Article
                            <ArrowRight size={17} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* COMMUNITY MESSAGE */}
        <section className="mt-14 flex flex-col items-center justify-between gap-6 rounded-[28px] bg-gradient-to-br from-[#F3E9F7] to-[#FFF4ED] px-8 py-9 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="font-serif text-2xl font-semibold">
              Every writer has a story to tell.
            </h3>

            <p className="mt-3 text-sm leading-7 text-[#918398]">
              Discover more perspectives and inspiration
              from the MyBlog community.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#8C6AA7] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#75538F]"
          >
            Discover Stories
            <ArrowRight size={17} />
          </Link>
        </section>

        {/* FOOTER */}
        <footer className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#E9DFEF] pt-7 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-[#B0A2B7]">
            © {new Date().getFullYear()} MyBlog.
            Author Stories.
          </p>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#8C6AA7] hover:text-[#694B84]"
          >
            Back to Stories
            <ArrowRight size={15} />
          </Link>
        </footer>
      </div>
    </main>
  );
}