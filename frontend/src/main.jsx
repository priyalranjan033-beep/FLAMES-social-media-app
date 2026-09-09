import { createRoot } from "react-dom/client";
import React, { useEffect, useState } from "react";
import axios from "axios";
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
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SERVER_URL = API.replace("/api", "");

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("token") || ""
  );

  const [showAuth, setShowAuth] = useState(!localStorage.getItem("token"));
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
  });

  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (token) {
      fetchPosts();
    }
  }, [token]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/posts`);
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

    try {
      const endpoint =
        authMode === "login" ? "/auth/login" : "/auth/signup";

      const payload =
        authMode === "login"
          ? {
              email: authForm.email,
              password: authForm.password,
            }
          : authForm;

      const res = await axios.post(`${API}${endpoint}`, payload);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setToken(res.data.token);
      setUser(res.data.user);
      setShowAuth(false);

      setAuthForm({
        username: "",
        email: "",
        password: "",
      });
    } catch (error) {
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
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      closeCreateModal();
      fetchPosts();
    } catch (error) {
      console.error(error);
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  if (!token || showAuth) {
    return (
      <>
        <style>{styles}</style>

        <div className="auth-page">
          <div className="auth-card">
            <div className="auth-logo">
              <span className="logo-flame">🔥</span>
              <span>flames</span>
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

              <input
                type="password"
                placeholder="Password"
                value={authForm.password}
                onChange={(e) =>
                  setAuthForm({
                    ...authForm,
                    password: e.target.value,
                  })
                }
                required
              />

              {authError && (
                <div className="auth-error">{authError}</div>
              )}

              <button className="auth-submit">
                {authMode === "login"
                  ? "Login 🔥"
                  : "Create Account 🔥"}
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      {/* ================= NAVBAR ================= */}

      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">🔥</div>
          <span>flames</span>
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
              <div className="large-avatar">
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
              © 2025 Flames
              <br />
              <span>Connect. Share. Inspire.</span>
            </div>
          </aside>

          {/* ========== CENTER ========== */}

          <section className="feed-column">

            {/* Stories */}

            <div className="stories">
              <Story emoji="🌅" name="Your Story" />
              <Story emoji="🌸" name="maya_k" />
              <Story emoji="🏃" name="theo.j" />
              <Story emoji="🌿" name="priya.v" />
              <Story emoji="🎸" name="sam_wu" />
              <Story emoji="🌞" name="elle.d" />
              <Story emoji="🎨" name="riku_a" />
            </div>

            {/* Quick create */}

            <div className="quick-create">
              <div className="large-avatar small">
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
                <h2>No flames yet</h2>
                <p>Be the first person to share something.</p>

                <button
                  className="flame-it"
                  onClick={openCreateModal}
                >
                  Create a Flame 🔥
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
                <div className="upload-flame">🔥</div>

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
                Post Flame 🔥
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

// ======================================================
// STYLES
// ======================================================

const styles = `
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Inter, Arial, sans-serif;
  background: #fff7d8;
  color: #211e16;
}

button,
input,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

/* ================= NAVBAR ================= */

.navbar {
  height: 69px;
  background: #ffffff;
  border-bottom: 1px solid #f0d47c;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.brand {
  display: flex;
  align-items: center;
  gap: 9px;
  font-family: Georgia, serif;
  font-size: 27px;
  font-weight: 700;
}

.brand-icon {
  width: 34px;
  height: 34px;
  background: #fff0ad;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.desktop-search {
  width: 510px;
  height: 43px;
  border: 1px solid #ecd98c;
  border-radius: 23px;
  background: #fffdf5;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  color: #91896f;
}

.desktop-search input {
  border: 0;
  outline: 0;
  background: transparent;
  width: 100%;
  color: #28241a;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 22px;
}

.profile-nav {
  border: 0;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 9px;
  color: #29251c;
}

.mini-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #a9c9eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.nav-create {
  background: #ffdf83;
  border: 1px solid #f4d170;
  border-radius: 23px;
  padding: 11px 21px;
  display: flex;
  align-items: center;
  gap: 7px;
  font-weight: 700;
}

/* ================= PAGE ================= */

.page {
  max-width: 1100px;
  margin: auto;
  padding: 30px 0 90px;
}

.layout {
  display: grid;
  grid-template-columns: 180px minmax(0, 720px) 320px;
  gap: 28px;
}

/* ================= LEFT ================= */

.profile-card {
  text-align: center;
  padding: 15px 10px 22px;
}

.large-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #a9c9eb;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 13px;
  font-size: 25px;
  font-weight: 700;
}

.large-avatar.small {
  width: 50px;
  height: 50px;
  margin: 0;
  flex-shrink: 0;
  font-size: 18px;
}

.profile-card h2 {
  font-family: Georgia, serif;
  margin: 0;
  font-size: 20px;
}

.profile-card p {
  margin: 5px 0 0;
  color: #8e805c;
  font-size: 13px;
  word-break: break-word;
}

.left-menu {
  margin-top: 10px;
}

.menu-item {
  width: 100%;
  border: 0;
  background: transparent;
  padding: 13px 10px;
  display: flex;
  align-items: center;
  gap: 13px;
  border-radius: 10px;
  margin-bottom: 4px;
  color: #514a39;
}

.menu-item.active {
  background: #fff0b4;
  font-weight: 700;
}

.left-promo {
  height: 190px;
  margin-top: 55px;
  border-radius: 18px;
  background: linear-gradient(
    140deg,
    #d8dfca,
    #8d9b76
  );
  padding: 25px 20px;
  font-family: Georgia, serif;
  font-size: 20px;
  line-height: 1.1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.left-promo span,
.right-promo span {
  font-size: 25px;
}

.copyright {
  margin-top: 27px;
  color: #6e664e;
  font-size: 12px;
  line-height: 1.7;
}

.copyright span {
  color: #a19679;
}

/* ================= STORIES ================= */

.stories {
  display: flex;
  gap: 17px;
  margin: 0 0 25px;
  overflow-x: auto;
  padding: 3px 2px 7px;
}

.story {
  min-width: 65px;
  text-align: center;
}

.story-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: white;
  border: 3px solid #ffda70;
  box-shadow: 0 0 0 2px white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 7px;
  font-size: 25px;
}

.story:first-child .story-circle {
  border-color: #7ca7dc;
}

.story > span {
  font-size: 12px;
  color: #665c44;
}

/* ================= QUICK CREATE ================= */

.quick-create {
  background: white;
  border: 1px solid #efd278;
  border-radius: 20px;
  padding: 19px 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.quick-input {
  border: 0;
  border-bottom: 1px solid #f0d579;
  outline: none;
  background: transparent;
  height: 42px;
  flex: 1;
  min-width: 150px;
  text-align: left;
  color: #8e856d;
}

.quick-photo {
  border: 0;
  background: transparent;
  color: #a98b35;
}

.flame-it {
  border: 0;
  background: #ffdc7b;
  border-radius: 22px;
  padding: 11px 24px;
  font-weight: 700;
  color: #292318;
}

/* ================= FEED ================= */

.feed-heading {
  display: flex;
  align-items: center;
  margin: 29px 0 18px;
  border-bottom: 1px solid #e6cd75;
}

.feed-heading h1 {
  font-family: Georgia, serif;
  font-size: 23px;
  margin: 0 0 -1px;
  padding-bottom: 8px;
}

.feed-heading h1:after {
  content: "";
  display: block;
  height: 2px;
  background: #bca24e;
  margin-top: 7px;
}

.latest {
  margin-left: auto;
  border: 0;
  background: transparent;
  color: #6d9bd0;
  padding-bottom: 8px;
}

.post-card {
  background: white;
  border: 1px solid #efd278;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 22px;
}

.post-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.post-user-avatar {
  width: 50px;
  height: 50px;
  background: #ffdc83;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.post-user-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.post-user-info strong {
  font-size: 16px;
}

.post-user-info span {
  color: #9b8959;
  font-size: 13px;
}

.post-menu {
  margin-left: auto;
  color: #a28d52;
}

.post-text {
  font-size: 16px;
  line-height: 1.6;
  margin: 18px 0 15px;
}

.post-image {
  width: 100%;
  max-height: 550px;
  object-fit: cover;
  border-radius: 15px;
  display: block;
}

.post-stats {
  display: flex;
  justify-content: space-between;
  padding: 13px 4px;
  color: #71694f;
  font-size: 13px;
}

.post-stats span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.post-actions {
  border-top: 1px solid #eee2b9;
  border-bottom: 1px solid #eee2b9;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.post-actions button {
  border: 0;
  background: transparent;
  padding: 13px 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #4e4839;
}

.post-actions button:hover,
.post-actions .liked {
  color: #ba8c19;
}

.comment-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 13px;
}

.comment-avatar {
  width: 39px;
  height: 39px;
  border-radius: 50%;
  background: #a9c9eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.comment-input-row input {
  height: 40px;
  flex: 1;
  border: 1px solid #e6d58f;
  border-radius: 20px;
  padding: 0 15px;
  outline: none;
  background: #fffdf7;
}

.comment-input-row button {
  width: 39px;
  height: 39px;
  border-radius: 50%;
  border: 0;
  background: #ffdf83;
  display: flex;
  align-items: center;
  justify-content: center;
}

.comments {
  margin-top: 15px;
  border-top: 1px solid #eee5c7;
  padding-top: 10px;
}

.comment {
  display: flex;
  gap: 10px;
  padding: 9px 0;
}

.comment-avatar {
  width: 35px;
  height: 35px;
  font-size: 12px;
}

.comment-body {
  background: #fff9e5;
  border-radius: 12px;
  padding: 8px 12px;
}

.comment-body strong {
  font-size: 13px;
}

.comment-body p {
  margin: 3px 0 0;
  font-size: 13px;
}

/* ================= RIGHT ================= */

.trending-card,
.follow-card {
  background: white;
  border: 1px solid #efd278;
  border-radius: 20px;
  padding: 21px;
}

.trending-card h2,
.follow-card h2 {
  font-family: Georgia, serif;
  margin: 0 0 20px;
  font-size: 20px;
}

.trend {
  display: flex;
  gap: 17px;
  margin: 0 0 22px;
}

.trend:last-child {
  margin-bottom: 2px;
}

.trend-number {
  width: 23px;
  color: #ad8730;
  font-weight: 700;
}

.trend div:last-child {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.trend strong {
  font-size: 14px;
}

.trend span {
  font-size: 12px;
  color: #a28e5d;
}

.follow-card {
  margin-top: 24px;
}

.follow-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.follow-header button {
  border: 0;
  background: transparent;
  color: #6c9dd4;
}

.follow-person {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 17px;
}

.follow-avatar {
  width: 40px;
  height: 40px;
  background: #a8c8e9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
}

.follow-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.follow-info strong {
  font-size: 13px;
}

.follow-info span {
  font-size: 11px;
  color: #a38d5c;
}

.follow-person button {
  border: 1px solid #72a5dc;
  background: white;
  color: #5d91ca;
  border-radius: 17px;
  padding: 6px 13px;
  font-size: 12px;
}

.right-promo {
  height: 190px;
  margin-top: 24px;
  border-radius: 18px;
  padding: 25px;
  background: linear-gradient(
    150deg,
    #718da0,
    #344c58
  );
  color: white;
  font-family: Georgia, serif;
  font-size: 22px;
  line-height: 1.05;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* ================= EMPTY ================= */

.loading,
.empty-feed {
  background: white;
  border: 1px solid #efd278;
  border-radius: 20px;
  padding: 45px;
  text-align: center;
}

.empty-feed svg {
  color: #c59c31;
}

.empty-feed h2 {
  font-family: Georgia, serif;
}

/* ================= CREATE MODAL ================= */

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(35, 31, 20, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 15px;
}

.create-modal {
  width: 460px;
  max-width: 100%;
  background: white;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 20px 70px rgba(0, 0, 0, 0.25);
}

.modal-header {
  height: 79px;
  border-bottom: 1px solid #efd278;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 25px;
}

.modal-header h2 {
  margin: 0;
  font-family: Georgia, serif;
  font-size: 21px;
}

.close-modal {
  border: 0;
  background: transparent;
  color: #b59745;
  display: flex;
}

.upload-box {
  height: 305px;
  margin: 26px 25px 20px;
  border: 2px dashed #f1d273;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  text-align: center;
}

.upload-box input {
  display: none;
}

.upload-flame {
  font-size: 45px;
  margin-bottom: 12px;
}

.upload-box strong {
  font-size: 16px;
  margin-bottom: 7px;
}

.upload-box > span {
  color: #b3943c;
  font-size: 14px;
}

.browse-button {
  margin-top: 20px;
  background: #ffdc7b;
  border-radius: 24px;
  padding: 12px 27px;
  font-weight: 700;
}

.preview-box {
  position: relative;
  margin: 26px 25px 20px;
  height: 305px;
  border-radius: 20px;
  overflow: hidden;
  background: #fff8df;
}

.preview-box img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.remove-image {
  position: absolute;
  right: 12px;
  top: 12px;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.caption-input {
  display: block;
  width: calc(100% - 50px);
  height: 106px;
  margin: 0 25px 28px;
  border: 1px solid #f0d273;
  border-radius: 19px;
  background: #fff0ad;
  resize: none;
  outline: none;
  padding: 17px 20px;
  font-size: 16px;
  color: #302b1e;
}

.caption-input::placeholder {
  color: #a69668;
}

.modal-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 0 25px 23px;
}

.cancel-button,
.post-flame-button {
  height: 52px;
  border-radius: 28px;
  font-weight: 700;
  border: 1px solid #f0d273;
}

.cancel-button {
  background: #fff0ad;
  color: #6b5b2e;
}

.post-flame-button {
  background: #ffdc7b;
  color: #292318;
}

/* ================= AUTH ================= */

.auth-page {
  min-height: 100vh;
  background: #fff7d8;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-card {
  width: 410px;
  max-width: 100%;
  background: white;
  border: 1px solid #efd278;
  border-radius: 25px;
  padding: 35px;
  text-align: center;
}

.auth-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 9px;
  font-family: Georgia, serif;
  font-size: 30px;
  font-weight: 700;
}

.logo-flame {
  font-size: 28px;
}

.auth-subtitle {
  color: #8f8058;
  margin: 10px 0 25px;
}

.auth-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #fff6d1;
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 20px;
}

.auth-tabs button {
  border: 0;
  background: transparent;
  padding: 10px;
  border-radius: 8px;
}

.auth-tabs button.active {
  background: white;
  font-weight: 700;
}

.auth-card form {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.auth-card input {
  height: 46px;
  border: 1px solid #e8d58d;
  border-radius: 10px;
  padding: 0 14px;
  outline: none;
}

.auth-submit {
  height: 48px;
  border: 0;
  border-radius: 24px;
  background: #ffdc7b;
  font-weight: 700;
  margin-top: 5px;
}

.auth-error {
  color: #b44343;
  font-size: 13px;
  text-align: left;
}

/* ================= MOBILE NAV ================= */

.mobile-nav {
  display: none;
}

/* ================= RESPONSIVE ================= */

@media (max-width: 1150px) {
  .page {
    padding-left: 20px;
    padding-right: 20px;
  }

  .layout {
    grid-template-columns: 170px minmax(0, 1fr) 280px;
    gap: 20px;
  }

  .desktop-search {
    width: 360px;
  }
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .left-column,
  .right-column {
    display: none;
  }

  .page {
    max-width: 720px;
  }

  .mobile-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 72px;
    background: white;
    border-top: 1px solid #ecd47b;
    z-index: 100;
    justify-content: space-around;
    align-items: center;
  }

  .mobile-nav button {
    border: 0;
    background: transparent;
    color: #7e704e;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    font-size: 10px;
  }

  .mobile-plus {
    width: 55px;
    height: 55px;
    border-radius: 50% !important;
    background: #ffdc7b !important;
    color: #272219 !important;
    justify-content: center;
  }

  .mobile-plus span {
    display: none;
  }
}

@media (max-width: 650px) {
  .navbar {
    padding: 0 15px;
  }

  .desktop-search {
    display: none;
  }

  .nav-actions {
    gap: 10px;
  }

  .profile-nav span,
  .profile-nav svg {
    display: none;
  }

  .nav-create {
    padding: 9px 13px;
  }

  .page {
    padding: 18px 12px 90px;
  }

  .stories {
    gap: 13px;
  }

  .quick-create {
    padding: 15px;
  }

  .post-card {
    padding: 14px;
    border-radius: 17px;
  }

  .post-actions button {
    font-size: 12px;
  }

  .create-modal {
    border-radius: 25px;
  }

  .upload-box,
  .preview-box {
    height: 270px;
    margin-left: 20px;
    margin-right: 20px;
  }

  .caption-input {
    width: calc(100% - 40px);
    margin-left: 20px;
    margin-right: 20px;
  }

  .modal-buttons {
    padding-left: 20px;
    padding-right: 20px;
  }
}
`;

export default App;
createRoot(document.getElementById("root")).render(<App />);