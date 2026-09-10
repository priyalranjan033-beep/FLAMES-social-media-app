import { createRoot } from "react-dom/client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./main.css";
import {
  Flame,
  Bell,
  Search,
  Home,
  MessageSquare,
  User,
  Plus,
  X,
  Image as ImageIcon,
  Send,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Bookmark,
  Users,
  Sun,
  ChevronDown,
  HelpCircle,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SERVER_URL = API.replace("/api", "");
function App() {
  const [user, setUser] = useState(null);
const [token, setToken] = useState("");
const [showAuth, setShowAuth] = useState(true);
const [showPassword, setShowPassword] = useState(false);
const [checkingAuth, setCheckingAuth] = useState(true);
  const [authMode, setAuthMode] = useState("login");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [commentInputs, setCommentInputs] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [authForm, setAuthForm] = useState({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
});
  const [authError, setAuthError] = useState("");
  useEffect(() => {
  const checkAuthentication = async () => {
    try {
      const res = await axios.get(`${API}/auth/me`, {
        withCredentials: true,
      });
      setUser(res.data.user);
      setToken("authenticated");
      setShowAuth(false);
    } catch (error) {
      setUser(null);
      setToken("");
      setShowAuth(true);
    } finally {
      setCheckingAuth(false);
    }
  };
  checkAuthentication();
}, []);
useEffect(() => {
  if (token) {
    fetchPosts();
  }
}, [token]);
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/posts`, {
  withCredentials: true,
});
      setPosts(res.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };
  // ---------------- AUTH ----------------
  const handleAuth = async (e) => {
  e.preventDefault();
  setAuthError("");
  if (authForm.password.length < 6) {
    setAuthError("Password must be at least 6 characters");
    return;
  }
  if (
    authMode === "signup" &&
    authForm.password !== authForm.confirmPassword
  ) {
    setAuthError("Passwords do not match");
    return;
  }
  try {
    const endpoint =
      authMode === "login" ? "/auth/login" : "/auth/signup";
    const payload =
      authMode === "login"
        ? {
            email: authForm.email,
            password: authForm.password,
          }
        : {
            username: authForm.username,
            email: authForm.email,
            password: authForm.password,
          };
    const res = await axios.post(`${API}${endpoint}`, payload, {
      withCredentials: true,
    });
    if (authMode === "login") {
      setUser(res.data.user);
      setToken("authenticated");
      setShowAuth(false);
    } else {
      setAuthMode("login");
      setAuthError("Account created successfully. Please login.");
    }
    setAuthForm({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  } catch (error) {
    console.error("Authentication error:", error);
    setAuthError(
      error.response?.data?.message || "Something went wrong"
    );
  }
};
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    setShowAuth(true);
    setPosts([]);
  };
  // ---------------- CREATE POST ----------------
  const openCreateModal = () => {
    setCaption("");
    setSelectedImage(null);
    setPreview("");
    setShowCreate(true);
  };
  const closeCreateModal = () => {
    setShowCreate(false);
    setCaption("");
    setSelectedImage(null);
    setPreview("");
  };
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      alert("File size must be less than 50MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
  };
  const createPost = async () => {
  if (!caption.trim() && !selectedImage) {
    alert("Please add a photo or write something.");
    return;
  }
  try {
    const formData = new FormData();
    formData.append("text", caption);
    if (selectedImage) {
      formData.append("image", selectedImage);
    }
    await axios.post(`${API}/posts`, formData, {
      withCredentials: true,
    });
    closeCreateModal();
    fetchPosts();
  } catch (error) {
    console.error("Create post error:", error);
    alert(
      error.response?.data?.message ||
        "Unable to create post."
    );
  }
};
  // ---------------- LIKE ----------------
  const toggleLike = async (postId) => {
    try {
const res = await axios.post(
  `${API}/posts/${postId}/like`,
  {},
  {
    withCredentials: true,
  }
);
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId ? res.data.post : post
        )
      );
    } catch (error) {
      console.error("Like error:", error);
    }
  };
  // ---------------- COMMENTS ----------------
  const submitComment = async (postId) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    try {
      const res = await axios.post(
  `${API}/posts/${postId}/comments`,
  { text },
  {
    withCredentials: true,
  }
);
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId ? res.data.post : post
        )
      );
      setCommentInputs((prev) => ({
        ...prev,
        [postId]: "",
      }));
    } catch (error) {
      console.error("Comment error:", error);
    }
  };
  const toggleComments = (postId) => {
    setOpenComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };
  // ---------------- AUTH SCREEN ----------------
  if (checkingAuth) {
  return (
    <>
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
  <img src="/logo.jpg" alt="FLAMES logo" style={{width:"60px",height:"60px",objectFit:"contain",display:"block"}} />
  <span>FLAMES</span>
</div>
          <p className="auth-subtitle">
            Checking your session...
          </p>
        </div>
      </div>
    </>
  );
}
  if (!token || showAuth) {
    return (
      <>
        
        <div className="auth-page">
          <div className="auth-card">
            <div className="auth-logo">
              <span className="logo-flame"></span>
              <span>Flames</span>
            </div>
            <p className="auth-subtitle">
              Share moments. Start conversations.
            </p>
            <div className="auth-tabs">
              <button
                className={authMode === "login" ? "active" : ""}
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                }}
              >
                Login
              </button>
              <button
                className={authMode === "signup" ? "active" : ""}
                onClick={() => {
                  setAuthMode("signup");
                  setAuthError("");
                }}
              >
                Sign up
              </button>
            </div>
  <form onSubmit={handleAuth}>
  {authMode === "signup" && (
    <input
      type="text"
      placeholder="Username"
      value={authForm.username}
      onChange={(e) =>
        setAuthForm({
          ...authForm,
          username: e.target.value,
        })
      }
      required
    />
  )}
  <input
    type="email"
    placeholder="Email"
    value={authForm.email}
    onChange={(e) =>
      setAuthForm({
        ...authForm,
        email: e.target.value,
      })
    }
    required
  />
  <div className="password-field">
    <input
      type={showPassword ? "text" : "password"}
      placeholder="Password"
      value={authForm.password}
      onChange={(e) =>
        setAuthForm({
          ...authForm,
          password: e.target.value,
        })
      }
      minLength={6}
      required
    />
    <button
      type="button"
      className="password-toggle"
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
  {authMode === "signup" && (
    <input
      type="password"
      placeholder="Confirm Password"
      value={authForm.confirmPassword}
      onChange={(e) =>
        setAuthForm({
          ...authForm,
          confirmPassword: e.target.value,
        })
      }
      minLength={6}
      required
    />
  )}
              {authError && (
                <div className="auth-error">{authError}</div>
              )}
              <button className="auth-submit">
                {authMode === "login"
                  ? "Login "
                  : "Create Account "}
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      
      {/* ================= NAVBAR ================= */}
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon"></div>
          <span>Flames</span>
        </div>
        <div className="desktop-search">
          <Search size={19} />
          <input placeholder="Search for people, posts or topics..." />
        </div>
        <div className="nav-actions">
          <Bell size={21} />
          <button
            className="profile-nav"
            onClick={logout}
            title="Logout"
          >
            <div className="mini-avatar">
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <span>{user?.username || "User"}</span>
            <ChevronDown size={16} />
          </button>
          <button
            className="nav-create"
            onClick={openCreateModal}
          >
            <Plus size={19} />
            Create
          </button>
        </div>
      </header>
      {/* ================= MAIN ================= */}
      <main className="page">
        <div className="layout">
          {/* ========== LEFT SIDEBAR ========== */}
          <aside className="left-column">
            <div className="profile-card">
              <div className="large-avatar-small">
                {user?.username?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <h2>{user?.username || "User"}</h2>
              <p>{user?.email}</p>
            </div>
            <div className="left-menu">
              <button className="menu-item active">
                <Home size={20} />
                Home
              </button>
              <button className="menu-item">
                <Users size={20} />
                Community
              </button>
              <button className="menu-item">
                <Bookmark size={20} />
                Saved Posts
              </button>
              <button className="menu-item">
                <User size={20} />
                My Profile
              </button>
            </div>
            <div className="left-promo">
              <div>
                Small
                <br />
                moments,
                <br />
                big stories.
              </div>
              <span>—</span>
            </div>
            <div className="copyright">
              © 2026 Flames
              <br />
              <span>Connect. Share. Inspire.</span>
            </div>
          </aside>
          {/* ========== CENTER ========== */}
          <section className="feed-column">
            {/* Quick create */}
            <div className="quick-create">
              <div className="large-avatar-small">
                {user?.username?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <button
                className="quick-input"
                onClick={openCreateModal}
              >
                What's blazing today?
              </button>
              <button
                className="quick-photo"
                onClick={openCreateModal}
              >
                <ImageIcon size={20} />
              </button>
              <button
                className="flame-it"
                onClick={openCreateModal}
              >
                Flame it
              </button>
            </div>
            {/* Feed heading */}
            <div className="feed-heading">
              <div>
                <h1>For You</h1>
              </div>

              <button className="latest">
                Latest ↓
              </button>
            </div>

            {/* Posts */}

            {loading ? (
              <div className="loading">
                Loading your feed...
              </div>
            ) : posts.length === 0 ? (
              <div className="empty-feed">
                <Sparkles size={35} />
                <h2>No Flames yet</h2>
                <p>Be the first person to share something.</p>

                <button
                  className="flame-it"
                  onClick={openCreateModal}
                >
                  Create a Flame 
                </button>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  user={user}
                  serverUrl={SERVER_URL}
                  onLike={toggleLike}
                  onComment={submitComment}
                  commentInput={commentInputs[post._id] || ""}
                  setCommentInput={(value) =>
                    setCommentInputs((prev) => ({
                      ...prev,
                      [post._id]: value,
                    }))
                  }
                  commentsOpen={openComments[post._id]}
                  toggleComments={toggleComments}
                />
              ))
            )}
          </section>

          {/* ========== RIGHT SIDEBAR ========== */}

          <aside className="right-column">

            <div className="trending-card">
              <h2>Trending</h2>

              <Trend number="1" title="#GoldenHour" posts="24.8K posts" />
              <Trend number="2" title="#DesignThinking" posts="9.1K posts" />
              <Trend number="3" title="#FocacciaFriday" posts="3.4K posts" />
              <Trend number="4" title="#CityMornings" posts="12.2K posts" />
              <Trend number="5" title="#FlamesCommunity" posts="51K posts" />
            </div>

            <div className="follow-card">
              <div className="follow-header">
                <h2>Who to follow</h2>
                <button>See all</button>
              </div>

              <FollowPerson initials="ED" name="Elle Dubois" mutual="12 mutual" />
              <FollowPerson initials="RA" name="Riku Aoyama" mutual="8 mutual" />
              <FollowPerson initials="JP" name="Juno Park" mutual="5 mutual" />
            </div>

            <div className="right-promo">
              <div>
                A better
                <br />
                community
                <br />
                today.
              </div>

              <span>—</span>
            </div>
          </aside>
        </div>
      </main>

      {/* ================= MOBILE NAV ================= */}

      <nav className="mobile-nav">
        <button>
          <Home size={21} />
          <span>Home</span>
        </button>

        <button>
          <Search size={21} />
          <span>Search</span>
        </button>

        <button
          className="mobile-plus"
          onClick={openCreateModal}
        >
          <Plus size={27} />
        </button>

        <button>
          <MessageSquare size={21} />
          <span>Messages</span>
        </button>

        <button>
          <User size={21} />
          <span>Profile</span>
        </button>
      </nav>

      {/* ================= CREATE MODAL ================= */}

      {showCreate && (
        <div
          className="modal-overlay"
          onClick={closeCreateModal}
        >
          <div
            className="create-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}

            <div className="modal-header">
              <h2>New Flame</h2>

              <button
                className="close-modal"
                onClick={closeCreateModal}
              >
                <X size={27} />
              </button>
            </div>

            {/* Upload area */}

            {!preview ? (
              <label className="upload-box">
                <div className="upload-flame"></div>

                <strong>
                  Drop your photo or video here
                </strong>

                <span>
                  PNG, JPG, MP4 up to 50MB
                </span>

                <div className="browse-button">
                  Browse files
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </label>
            ) : (
              <div className="preview-box">
                <img src={preview} alt="Preview" />

                <button
                  className="remove-image"
                  onClick={() => {
                    setPreview("");
                    setSelectedImage(null);
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            )}
            {/* Caption */}
            <textarea
              className="caption-input"
              placeholder="Write a caption... what's blazing?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            {/* Bottom buttons */}
            <div className="modal-buttons">
              <button
                className="cancel-button"
                onClick={closeCreateModal}
              >
                Cancel
              </button>

              <button
                className="post-flame-button"
                onClick={createPost}
              >
                Post Flame 
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ======================================================
// COMPONENTS
// ======================================================

function Story({ emoji, name }) {
  return (
    <div className="story">
      <div className="story-circle">
        <span>{emoji}</span>
      </div>

      <span>{name}</span>
    </div>
  );
}

function Trend({ number, title, posts }) {
  return (
    <div className="trend">
      <div className="trend-number">{number}</div>

      <div>
        <strong>{title}</strong>
        <span>{posts}</span>
      </div>
    </div>
  );
}

function FollowPerson({ initials, name, mutual }) {
  return (
    <div className="follow-person">
      <div className="follow-avatar">{initials}</div>

      <div className="follow-info">
        <strong>{name}</strong>
        <span>{mutual}</span>
      </div>

      <button>Follow</button>
    </div>
  );
}

function PostCard({
  post,
  user,
  serverUrl,
  onLike,
  onComment,
  commentInput,
  setCommentInput,
  commentsOpen,
  toggleComments,
}) {
  const liked = post.likes?.some(
    (id) => id === user?.id || id?._id === user?.id
  );

  return (
    <article className="post-card">

      <div className="post-top">
        <div className="post-user-avatar">
          {post.user?.username?.charAt(0)?.toUpperCase() || "U"}
        </div>

        <div className="post-user-info">
          <strong>{post.user?.username || "User"}</strong>

          <span>
            @{post.user?.username || "user"} · 2 min ago
          </span>
        </div>

        <div className="post-menu">
          <MoreHorizontal size={21} />
        </div>
      </div>

      {post.text && (
        <p className="post-text">
          {post.text}
        </p>
      )}

      {post.image && (
        <img
          className="post-image"
          src={`${serverUrl}${post.image}`}
          alt="Post"
        />
      )}

      <div className="post-stats">
        <span>
          <Heart
            size={17}
            fill={liked ? "#e9b949" : "none"}
          />
          {post.likes?.length || 0} likes
        </span>

        <span>
          <MessageCircle size={17} />
          {post.comments?.length || 0} comments
        </span>
      </div>

      <div className="post-actions">
        <button
          className={liked ? "liked" : ""}
          onClick={() => onLike(post._id)}
        >
          <Heart
            size={19}
            fill={liked ? "currentColor" : "none"}
          />
          Like
        </button>

        <button onClick={() => toggleComments(post._id)}>
          <MessageCircle size={19} />
          Comment
        </button>

        <button>
          <Send size={19} />
          Share
        </button>
      </div>
      {/* Comment input */}
      <div className="comment-input-row">
        <div className="comment-avatar">
          {user?.username?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <input
          placeholder="Write a comment..."
          value={commentInput}
          onChange={(e) =>
            setCommentInput(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onComment(post._id);
            }
          }}
        />
        <button onClick={() => onComment(post._id)}>
          <Send size={17} />
        </button>
      </div>
      {/* Comments */}
      {commentsOpen && post.comments?.length > 0 && (
        <div className="comments">
          {post.comments.map((comment) => (
            <div
              className="comment"
              key={comment._id}
            >
              <div className="comment-avatar">
                {comment.user?.username
                  ?.charAt(0)
                  ?.toUpperCase() || "U"}
              </div>

              <div className="comment-body">
                <strong>
                  {comment.user?.username || "User"}
                </strong>

                <p>{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
export default App;
createRoot(document.getElementById("root")).render(<App />);