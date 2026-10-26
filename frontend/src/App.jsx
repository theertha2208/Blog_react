
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { ArrowLeft, Home as HomeIcon } from "lucide-react";

import { AuthProvider } from "./context/AuthContext";
import BackButton from "./components/BackButton";

// PUBLIC PAGES
import Home from "./pages/Home";
import BlogDetail from "./pages/BlogDetail";
import Profile from "./pages/Profile";
import AuthorProfile from "./pages/AuthorProfile";

// AUTHENTICATION PAGES
import Login from "./pages/Login";
import Register from "./pages/Register";

// WRITER PAGES
import UserDashboard from "./pages/UserDashboard";
import CreatePost from "./pages/CreatePost";
import EditPost from "./pages/EditPost";

// ADMIN PAGES
import AdminDashboard from "./pages/AdminDashboard";
import AdminPosts from "./pages/AdminPosts";
import AdminCategories from "./pages/AdminCategories";
import AdminComments from "./pages/AdminComments";
import AdminUsers from "./pages/AdminUsers";

// SHARED PAGE LAYOUT
function PageLayout() {
  const location = useLocation();
  const pathname = location.pathname;

  // PAGES WITH THEIR OWN NAVIGATION
  const pagesWithoutBackButton = [
    "/",
    "/login",
    "/register",
    "/dashboard",
    "/admin/dashboard",
    "/admin/posts",
    "/admin/categories",
    "/admin/comments",
    "/admin/users",
  ];

  if (pagesWithoutBackButton.includes(pathname)) {
    return null;
  }

  return (
    <div className="bg-[#FFFCF9] px-5 pt-6 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <BackButton />
      </div>
    </div>
  );
}

// PAGE NOT FOUND
function NotFound() {
  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-[#FFFCF9] px-6 py-16">
      <div className="w-full max-w-lg text-center">

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-[#F0E5F5] text-[#8C6AA7]">
          <HomeIcon size={34} />
        </div>

        <p className="mt-8 text-sm font-bold uppercase tracking-[0.3em] text-[#9C7BB6]">
          Error 404
        </p>

        <h1 className="mt-4 font-serif text-4xl font-semibold text-[#43394B] sm:text-5xl">
          Page Not Found
        </h1>

        <p className="mx-auto mt-5 max-w-md text-sm leading-8 text-[#918398]">
          The page you're looking for doesn't exist
          or may have been moved. Let's get you
          back to exploring wonderful stories.
        </p>

        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#8C6AA7] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#75538F]"
        >
          <ArrowLeft size={18} />
          Back to Homepage
        </Link>
      </div>
    </main>
  );
}

// MAIN APPLICATION
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PageLayout />

        <Routes>
          {/* PUBLIC PAGES */}
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/posts/:id"
            element={<BlogDetail />}
          />

          <Route
            path="/authors/:id"
            element={<AuthorProfile />}
          />

          {/* AUTHENTICATION */}
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* USER PROFILE */}
          <Route
            path="/profile"
            element={<Profile />}
          />

          {/* WRITER PAGES */}
          <Route
            path="/dashboard"
            element={<UserDashboard />}
          />

          <Route
            path="/create-post"
            element={<CreatePost />}
          />

          <Route
            path="/edit-post/:id"
            element={<EditPost />}
          />

          {/* ADMIN PAGES */}
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/posts"
            element={<AdminPosts />}
          />

          <Route
            path="/admin/categories"
            element={<AdminCategories />}
          />

          <Route
            path="/admin/comments"
            element={<AdminComments />}
          />

          <Route
            path="/admin/users"
            element={<AdminUsers />}
          />

          {/* UNKNOWN ROUTES */}
          <Route
            path="*"
            element={<NotFound />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
