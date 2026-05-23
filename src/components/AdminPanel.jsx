import React, { useState, useEffect, useRef } from "react";
import { 
  Key, Folder, BookOpen, Image, Plus, Trash2, Save, X, 
  RefreshCw, Eye, LogOut, ArrowLeft, Shield, Terminal, Cpu
} from "lucide-react";
import { posts as localPosts } from "../data/posts";
import { photos as localPhotos } from "../data/photos";
import { projects as localProjects } from "../data/projects";

// Inline Github Icon SVG to avoid missing icon errors
const GithubIcon = ({ size = 16, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

// Inline Edit Icon
const EditIcon = ({ size = 14, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z" />
  </svg>
);

// Lightweight Regex-based Markdown compiler that outputs the styled HTML elements our blog CSS expects
const compileMarkdownToHtml = (md) => {
  if (!md) return "";
  let html = md;

  // Escape basic HTML tags to prevent broken nodes (except what we generate)
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 1. Code blocks: ```lang ... ``` -> <pre><code class="lang">...</code></pre>
  html = html.replace(/```(\w*)\n([\s\S]*?)\n```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang}">${code}</code></pre>`;
  });

  // 2. Headings: # -> h2, ## -> h2, ### -> h3
  html = html.replace(/^#\s+(.*)$/gm, "<h2>$1</h2>");
  html = html.replace(/^##\s+(.*)$/gm, "<h2>$1</h2>");
  html = html.replace(/^###\s+(.*)$/gm, "<h3>$1</h3>");
  html = html.replace(/^####\s+(.*)$/gm, "<h4>$1</h4>");

  // 3. Unordered list items: - item -> <li>item</li>
  html = html.replace(/^\s*-\s+(.*)$/gm, "<li>$1</li>");
  html = html.replace(/^\s*\*\s+(.*)$/gm, "<li>$1</li>");
  
  // Wrap list items in <ul>
  html = html.replace(/(<li>[\s\S]*?<\/li>)+/g, (match) => {
    return `<ul>${match}</ul>`;
  });

  // 4. Bold and Italic
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // 5. Inline code: `code` -> <code>code</code>
  html = html.replace(/`(.*?)`/g, "<code>$1</code>");

  // 6. Links: [text](url) -> <a href="url" target="_blank" rel="noopener noreferrer">text</a>
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // 7. Images: ![alt](url) -> <img src="url" alt="alt" />
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width:100%; border-radius:8px; margin: 12px 0;" />');

  // 8. Paragraphs: split by double newlines and wrap in <p>, skipping heading/list tags
  const blocks = html.split(/\n\n+/);
  html = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return "";
    if (/^<(h2|h3|h4|ul|li|pre|img)/.test(trimmed)) {
      return trimmed;
    }
    return `<p>${trimmed.replace(/\n/g, "<br />")}</p>`;
  }).join("\n");

  return html;
};

export default function AdminPanel({ setActiveTab }) {
  // Credentials and config states
  const [username, setUsername] = useState("");
  const [repo, setRepo] = useState("");
  const [branch, setBranch] = useState("main");
  const [token, setToken] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Loaded database arrays
  const [posts, setPosts] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [projects, setProjects] = useState([]);

  // CMS active manager view: "posts" | "photos" | "projects"
  const [activeSubTab, setActiveSubTab] = useState("posts");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  // Editing form states
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [isNew, setIsNew] = useState(false);

  // HTML content preview state
  const [previewContent, setPreviewContent] = useState("");

  const consoleEndRef = useRef(null);

  // Load configuration from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("git_cms_username");
    const savedRepo = localStorage.getItem("git_cms_repo");
    const savedBranch = localStorage.getItem("git_cms_branch") || "main";
    const savedToken = localStorage.getItem("git_cms_token");

    if (savedUser && savedRepo && savedToken) {
      setUsername(savedUser);
      setRepo(savedRepo);
      setBranch(savedBranch);
      setToken(savedToken);
      setIsLoggedIn(true);
      addLog("SYSTEM", "Loaded saved repository credentials from localStorage.", "sys");
    } else {
      addLog("SYSTEM", "No saved credentials found. Please sign in to connect to GitHub.", "warn");
    }
  }, []);

  // Fetch file lists upon successful login or switching subtabs
  useEffect(() => {
    if (isLoggedIn) {
      fetchDataFromGit();
    }
  }, [isLoggedIn, activeSubTab]);

  // Scroll to bottom of terminal logs
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Terminal logging helper
  const addLog = (tag, message, type = "default") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, tag, message, type }]);
  };

  // Base64 helper wrappers supporting UTF-8 characters safely
  const encodeBase64 = (str) => {
    const bytes = new TextEncoder().encode(str);
    const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
    return btoa(binString);
  };

  const decodeBase64 = (b64) => {
    const binString = atob(b64);
    const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  };

  // Handle Login & Save config
  const handleLogin = (e) => {
    e.preventDefault();
    if (!username || !repo || !token) {
      addLog("LOGIN_ERR", "Fields cannot be blank.", "err");
      return;
    }

    localStorage.setItem("git_cms_username", username.trim());
    localStorage.setItem("git_cms_repo", repo.trim());
    localStorage.setItem("git_cms_branch", branch.trim());
    localStorage.setItem("git_cms_token", token.trim());
    setIsLoggedIn(true);
    addLog("LOGIN", `Connected securely. Target: ${username}/${repo} (${branch})`, "succ");
  };

  // Disconnect / Logout
  const handleLogout = () => {
    localStorage.removeItem("git_cms_username");
    localStorage.removeItem("git_cms_repo");
    localStorage.removeItem("git_cms_branch");
    localStorage.removeItem("git_cms_token");
    setIsLoggedIn(false);
    setPosts([]);
    setPhotos([]);
    setProjects([]);
    setIsEditing(false);
    addLog("SYSTEM", "Credentials cleared. Disconnected.", "warn");
  };

  // Get File Path based on Active Tab
  const getFilePath = () => {
    switch (activeSubTab) {
      case "posts": return "src/data/posts.js";
      case "photos": return "src/data/photos.js";
      case "projects": return "src/data/projects.js";
      default: return "src/data/posts.js";
    }
  };

  // Fetch list contents from GitHub API
  const fetchDataFromGit = async () => {
    setLoading(true);
    const path = getFilePath();
    addLog("API_GET", `Fetching ${path} from branch: ${branch}...`, "sys");

    try {
      // Add timestamp to query to force bypass of browser caching
      const url = `https://api.github.com/repos/${username}/${repo}/contents/${path}?ref=${branch}&_t=${Date.now()}`;
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} (${response.statusText})`);
      }

      const fileData = await response.json();
      const contentRaw = decodeBase64(fileData.content);

      // Parse the JS file exporting an array
      const startIdx = contentRaw.indexOf("[");
      const endIdx = contentRaw.lastIndexOf("]");

      if (startIdx === -1 || endIdx === -1) {
        throw new Error("Unable to parse file structure. Make sure it exports an array enclosed in [].");
      }

      const jsonText = contentRaw.substring(startIdx, endIdx + 1);
      const parsedArray = JSON.parse(jsonText);

      if (activeSubTab === "posts") setPosts(parsedArray);
      if (activeSubTab === "photos") setPhotos(parsedArray);
      if (activeSubTab === "projects") setProjects(parsedArray);

      addLog("API_GET", `Successfully loaded ${parsedArray.length} items from GitHub file (SHA: ${fileData.sha.substring(0, 7)}).`, "succ");
    } catch (err) {
      addLog("API_GET_ERR", err.message, "err");
      addLog("FALLBACK", "Loading default local data module fallback.", "warn");

      // Load fallbacks statically
      if (activeSubTab === "posts") {
        setPosts(localPosts);
      } else if (activeSubTab === "photos") {
        setPhotos(localPhotos);
      } else if (activeSubTab === "projects") {
        setProjects(localProjects);
      }
    } finally {
      setLoading(false);
    }
  };

  // Push updated list to GitHub API
  const pushDataToGit = async (updatedArray) => {
    setLoading(true);
    const path = getFilePath();
    addLog("API_PUT", `Preparing to write ${path} to remote branch ${branch}...`, "sys");

    try {
      // 1. Fetch current file SHA first (force bypass browser cache to get the latest SHA)
      const getUrl = `https://api.github.com/repos/${username}/${repo}/contents/${path}?ref=${branch}&_t=${Date.now()}`;
      const getResponse = await fetch(getUrl, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json"
        }
      });

      if (!getResponse.ok) {
        throw new Error(`Failed to resolve active file SHA: ${getResponse.statusText}`);
      }

      const fileMeta = await getResponse.json();
      const fileSha = fileMeta.sha;
      addLog("API_PUT", `SHA resolved: ${fileSha.substring(0, 7)}. Committing...`, "sys");

      // 2. Format JS file string
      const varName = activeSubTab;
      const fileString = `export const ${varName} = ${JSON.stringify(updatedArray, null, 2)};\n`;

      // 3. PUT Commit to GitHub
      const putUrl = `https://api.github.com/repos/${username}/${repo}/contents/${path}`;
      const commitMessage = `feat(cms): update ${varName} database via visual console`;
      const putBody = {
        message: commitMessage,
        content: encodeBase64(fileString),
        sha: fileSha,
        branch: branch
      };

      const putResponse = await fetch(putUrl, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/vnd.github+json"
        },
        body: JSON.stringify(putBody)
      });

      if (!putResponse.ok) {
        const errorData = await putResponse.json();
        throw new Error(errorData.message || `HTTP ${putResponse.status}`);
      }

      const putResult = await putResponse.json();
      addLog("API_PUT", `Commit success! Commit SHA: ${putResult.commit.sha.substring(0, 7)}`, "succ");
      
      // Update local states
      if (activeSubTab === "posts") setPosts(updatedArray);
      if (activeSubTab === "photos") setPhotos(updatedArray);
      if (activeSubTab === "projects") setProjects(updatedArray);

      setIsEditing(false);
      setEditItem(null);
    } catch (err) {
      addLog("API_PUT_ERR", `Push failed: ${err.message}`, "err");
      alert(`保存失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Parse Uploaded Markdown note file
  const processMarkdownFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const mdText = event.target.result;
      
      let title = "";
      let excerpt = "";
      let date = new Date().toISOString().split("T")[0];
      let tags = [];
      let markdownBody = mdText;

      // Extract Front Matter headers if present
      if (mdText.startsWith("---")) {
        const parts = mdText.split("---");
        if (parts.length >= 3) {
          const frontMatterText = parts[1];
          markdownBody = parts.slice(2).join("---").trim();
          
          const lines = frontMatterText.split("\n");
          lines.forEach(line => {
            const colonIdx = line.indexOf(":");
            if (colonIdx !== -1) {
              const key = line.substring(0, colonIdx).trim().toLowerCase();
              let val = line.substring(colonIdx + 1).trim();
              if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
              if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);

              if (key === "title") title = val;
              else if (key === "excerpt" || key === "desc") excerpt = val;
              else if (key === "date") date = val;
              else if (key === "tags") {
                if (val.startsWith("[") && val.endsWith("]")) {
                  tags = val.slice(1, -1).split(",").map(t => t.trim().replace(/['"]/g, ""));
                } else {
                  tags = val.split(",").map(t => t.trim());
                }
              }
            }
          });
        }
      }

      // Auto resolve headers if missed in front-matter
      if (!title) {
        const titleMatch = markdownBody.match(/^#\s+(.*)$/m);
        if (titleMatch) {
          title = titleMatch[1];
          markdownBody = markdownBody.replace(/^#\s+.*$/m, "").trim(); // strip title heading
        } else {
          title = file.name.replace(/\.md$/, "");
        }
      }

      if (!excerpt) {
        const cleanText = markdownBody
          .replace(/[#*`\[\]\(\)]/g, "")
          .replace(/\n+/g, " ")
          .substring(0, 100)
          .trim();
        excerpt = cleanText ? `${cleanText}...` : "文章内容摘要...";
      }

      // Compile Markdown text to system HTML
      const htmlContent = compileMarkdownToHtml(markdownBody);

      // Create a slugified post ID from title
      const pinyinOrSlug = title.toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      const uniqueId = `post-${pinyinOrSlug || Date.now()}`;

      setEditItem(prev => ({
        ...prev,
        id: uniqueId,
        title,
        excerpt,
        date,
        tags,
        content: htmlContent
      }));

      setPreviewContent(htmlContent);
      addLog("CMS_MD", `Parsed Markdown successfully: "${title}" (ID: ${uniqueId})`, "succ");
    };

    reader.readAsText(file);
  };

  // Open editor form for new item
  const handleAddNew = () => {
    setIsNew(true);
    setIsEditing(true);

    if (activeSubTab === "posts") {
      setEditItem({
        id: `post-${Date.now()}`,
        title: "",
        excerpt: "",
        category: "ai",
        tags: [],
        date: new Date().toISOString().split("T")[0],
        readTime: "5 分钟",
        views: 100,
        likes: 10,
        coverColor: "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)",
        content: "<h2>新章节</h2>\n<p>输入你的 HTML 文章内容...</p>"
      });
      setPreviewContent("<h2>新章节</h2>\n<p>输入你的 HTML 文章内容...</p>");
    } else if (activeSubTab === "photos") {
      setEditItem({
        id: `photo-${Date.now()}`,
        title: "",
        category: "ai",
        image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809",
        description: "",
        aspectRatio: "aspect-landscape",
        date: new Date().toISOString().split("T")[0],
        likes: 0
      });
    } else if (activeSubTab === "projects") {
      setEditItem({
        id: `project-${Date.now()}`,
        name: "",
        description: "",
        tech: [],
        stars: 0,
        forks: 0,
        link: "https://github.com/Aohs",
        language: "JavaScript"
      });
    }
  };

  // Edit an existing item
  const handleEdit = (item) => {
    setIsNew(false);
    setIsEditing(true);
    setEditItem({ ...item });
    if (activeSubTab === "posts") {
      setPreviewContent(item.content || "");
    }
  };

  // Delete item
  const handleDelete = (itemId) => {
    const confirmDelete = window.confirm("确认要删除该项数据吗？本操作将立即触发 Git Commit。");
    if (!confirmDelete) return;

    let updatedArray = [];
    if (activeSubTab === "posts") {
      updatedArray = posts.filter(item => item.id !== itemId);
    } else if (activeSubTab === "photos") {
      updatedArray = photos.filter(item => item.id !== itemId);
    } else if (activeSubTab === "projects") {
      updatedArray = projects.filter(item => item.id !== itemId);
    }

    pushDataToGit(updatedArray);
  };

  // Form input change handlers
  const handleFormChange = (key, val) => {
    setEditItem(prev => {
      const updated = { ...prev, [key]: val };
      if (key === "content" && activeSubTab === "posts") {
        setPreviewContent(val);
      }
      return updated;
    });
  };

  // Special tags array converter
  const handleCommaSeparatedTags = (val) => {
    const tagsArray = val.split(",").map(t => t.trim()).filter(t => t !== "");
    handleFormChange("tags", tagsArray);
  };

  const handleCommaSeparatedTech = (val) => {
    const techArray = val.split(",").map(t => t.trim()).filter(t => t !== "");
    handleFormChange("tech", techArray);
  };

  // Submit edit/add form
  const handleFormSubmit = (e) => {
    e.preventDefault();

    let updatedArray = [];
    const sourceArray = activeSubTab === "posts" ? posts 
                      : activeSubTab === "photos" ? photos 
                      : projects;

    if (isNew) {
      // Prefix new item
      updatedArray = [editItem, ...sourceArray];
    } else {
      // Replace existing item
      updatedArray = sourceArray.map(item => item.id === editItem.id ? editItem : item);
    }

    pushDataToGit(updatedArray);
  };

  return (
    <div className="admin-container">
      {/* Header Info */}
      <div className="section-header">
        <h2 className="glitch-title" data-text="CONTROL_PANEL">
          CONTROL_PANEL <span className="accent-pink">/</span> 控制台
        </h2>
        <p className="section-subtitle">
          可视化增删改查博客文章、相册日志以及 GitHub 项目展示。
        </p>
      </div>

      {!isLoggedIn ? (
        /* Sign-in Form Card */
        <div className="admin-login-card">
          <div className="login-icon-glow">
            <Shield size={28} />
          </div>
          <h3 className="profile-name" style={{ fontSize: "1.2rem", marginBottom: "8px" }}>控制台登录 (Authenticate)</h3>
          <p className="profile-tagline" style={{ marginBottom: "24px", fontSize: "0.8rem" }}>
            需要提供具有 `repo` 写权限的 GitHub Token 才能直接存取代码数据。
          </p>

          <form onSubmit={handleLogin}>
            <div className="admin-form-group">
              <label className="admin-label">GITHUB 用户名 (Username)</label>
              <input 
                type="text" 
                className="admin-input" 
                placeholder="例如: Aohs"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">仓库名称 (Repository)</label>
              <input 
                type="text" 
                className="admin-input" 
                placeholder="例如: Aohs_Zhu"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                required
              />
            </div>

            <div className="admin-grid-two-cols">
              <div className="admin-form-group">
                <label className="admin-label">主分支 (Branch)</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">SYS_LATENCY</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value="18ms (ESTABLISHED)" 
                  disabled 
                  style={{ opacity: 0.5 }}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">个人访问令牌 (Personal Access Token)</label>
              <input 
                type="password" 
                className="admin-input" 
                placeholder="ghp_xxxxxxxxxxxx"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="cyber-btn btn-primary"
              style={{ width: "100%", marginTop: "12px", padding: "12px" }}
            >
              <GithubIcon size={14} style={{ marginRight: "8px" }} />
              连接 GitHub 仓库
            </button>
          </form>
        </div>
      ) : (
        /* Authenticated Dashboard */
        <div className="admin-dashboard-layout">
          
          {/* Sidebar Tabs */}
          <div className="admin-sidebar">
            <div className="admin-nav-card">
              <div className="status-badge-indicator sync-active" style={{ marginBottom: "12px" }}>
                <span className="pulse-dot" style={{ backgroundColor: "#10b981" }} />
                <span>GITHUB SYNC: ON</span>
              </div>
              <p className="admin-label" style={{ fontSize: "0.7rem", margin: "4px 0 12px" }}>
                CONNECTED: {username}/{repo}
              </p>

              <button 
                className={`admin-nav-btn ${activeSubTab === "posts" ? "active" : ""}`}
                onClick={() => { setActiveSubTab("posts"); setIsEditing(false); }}
              >
                <BookOpen size={16} />
                文章管理 (Posts)
              </button>
              <button 
                className={`admin-nav-btn ${activeSubTab === "photos" ? "active" : ""}`}
                onClick={() => { setActiveSubTab("photos"); setIsEditing(false); }}
              >
                <Image size={16} />
                随笔相册 (Photos)
              </button>
              <button 
                className={`admin-nav-btn ${activeSubTab === "projects" ? "active" : ""}`}
                onClick={() => { setActiveSubTab("projects"); setIsEditing(false); }}
              >
                <Folder size={16} />
                项目仓库 (Projects)
              </button>
            </div>

            <div className="admin-nav-card">
              <button 
                className="admin-nav-btn"
                style={{ color: "var(--neon-pink)" }}
                onClick={handleLogout}
              >
                <LogOut size={16} />
                断开 GitHub 连接
              </button>
              <button 
                className="admin-nav-btn" 
                onClick={() => setActiveTab("home")}
              >
                <ArrowLeft size={16} />
                返回博客主页
              </button>
            </div>
          </div>

          {/* Main workspace */}
          <div className="admin-main-panel">
            {loading && (
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                background: "rgba(5, 5, 8, 0.7)", zIndex: 100, display: "flex",
                alignItems: "center", justifyContent: "center", borderRadius: "16px"
              }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                  <RefreshCw className="spin-animation accent-cyan" size={32} />
                  <span className="accent-cyan" style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
                    TRANSMITTING_DATA_NODES...
                  </span>
                </div>
              </div>
            )}

            {!isEditing ? (
              /* Lists management mode */
              <>
                <div className="admin-panel-header">
                  <h3 className="admin-panel-title">
                    {activeSubTab === "posts" && "文章数据列表 (Blog Posts)"}
                    {activeSubTab === "photos" && "随笔图片列表 (Photo Logs)"}
                    {activeSubTab === "projects" && "推荐项目列表 (Showcases)"}
                  </h3>
                  <button className="cyber-btn btn-primary" onClick={handleAddNew} style={{ padding: "8px 16px", fontSize: "0.8rem" }}>
                    <Plus size={14} style={{ marginRight: "6px" }} />
                    添加新项 (Create)
                  </button>
                </div>

                <div className="admin-items-list">
                  {/* Render Posts */}
                  {activeSubTab === "posts" && posts.map(item => (
                    <div key={item.id} className="admin-item-row">
                      <div className="admin-item-info">
                        <span className="admin-item-title">{item.title}</span>
                        <div className="admin-item-meta">
                          <span>ID: {item.id}</span>
                          <span className="text-cyan">Category: {item.category}</span>
                          <span className="text-purple">Date: {item.date}</span>
                        </div>
                      </div>
                      <div className="admin-actions-cell">
                        <button className="admin-icon-btn btn-edit" onClick={() => handleEdit(item)} title="编辑">
                          <EditIcon size={14} />
                        </button>
                        <button className="admin-icon-btn btn-delete" onClick={() => handleDelete(item.id)} title="删除">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Render Photos */}
                  {activeSubTab === "photos" && photos.map(item => (
                    <div key={item.id} className="admin-item-row">
                      <div className="admin-item-info">
                        <span className="admin-item-title">{item.title || "未命名图片"}</span>
                        <div className="admin-item-meta">
                          <span>ID: {item.id}</span>
                          <span className="text-cyan">Category: {item.category}</span>
                          <span className="text-purple">Date: {item.date}</span>
                        </div>
                      </div>
                      <div className="admin-actions-cell">
                        <button className="admin-icon-btn btn-edit" onClick={() => handleEdit(item)}>
                          <EditIcon size={14} />
                        </button>
                        <button className="admin-icon-btn btn-delete" onClick={() => handleDelete(item.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Render Projects */}
                  {activeSubTab === "projects" && projects.map(item => (
                    <div key={item.id} className="admin-item-row">
                      <div className="admin-item-info">
                        <span className="admin-item-title">{item.name}</span>
                        <div className="admin-item-meta">
                          <span>ID: {item.id}</span>
                          <span className="text-cyan">Lang: {item.language}</span>
                          <span className="text-purple">Stars: {item.stars}</span>
                        </div>
                      </div>
                      <div className="admin-actions-cell">
                        <button className="admin-icon-btn btn-edit" onClick={() => handleEdit(item)}>
                          <EditIcon size={14} />
                        </button>
                        <button className="admin-icon-btn btn-delete" onClick={() => handleDelete(item.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Empty state fallbacks */}
                  {((activeSubTab === "posts" && posts.length === 0) ||
                    (activeSubTab === "photos" && photos.length === 0) ||
                    (activeSubTab === "projects" && projects.length === 0)) && (
                    <div className="admin-empty-state">
                      <Cpu size={36} />
                      <p>未找到数据项目，请尝试刷新或添加新数据。</p>
                      <button className="cyber-btn btn-secondary" onClick={fetchDataFromGit} style={{ padding: "6px 12px", fontSize: "0.75rem" }}>
                        <RefreshCw size={12} style={{ marginRight: "6px" }} />
                        刷新数据库
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Editing Node Form fields */
              <>
                <div className="admin-panel-header">
                  <h3 className="admin-panel-title">
                    {isNew ? "新建数据项 (Create Node)" : `编辑数据项 (Edit Node) [${editItem?.id}]`}
                  </h3>
                  <button className="admin-icon-btn" onClick={() => setIsEditing(false)} title="取消">
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleFormSubmit}>
                  {/* EDIT POSTS FORM */}
                  {activeSubTab === "posts" && editItem && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      
                      {/* Markdown File Upload Drag & Drop Area */}
                      <div 
                        className="admin-form-group"
                        style={{
                          border: "2px dashed rgba(6, 182, 212, 0.2)",
                          padding: "20px",
                          borderRadius: "10px",
                          textAlign: "center",
                          background: "rgba(6, 182, 212, 0.02)",
                          transition: "all 0.2s ease",
                          marginBottom: "8px"
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.style.borderColor = "var(--neon-pink)";
                          e.currentTarget.style.background = "rgba(236, 72, 153, 0.05)";
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.currentTarget.style.borderColor = "rgba(6, 182, 212, 0.2)";
                          e.currentTarget.style.background = "rgba(6, 182, 212, 0.02)";
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.style.borderColor = "rgba(6, 182, 212, 0.2)";
                          e.currentTarget.style.background = "rgba(6, 182, 212, 0.02)";
                          const file = e.dataTransfer.files[0];
                          if (file && file.name.endsWith(".md")) {
                            processMarkdownFile(file);
                          } else {
                            addLog("CMS_MD_ERR", "Only .md files are supported for import.", "err");
                          }
                        }}
                      >
                        <input 
                          type="file" 
                          accept=".md" 
                          style={{ display: "none" }} 
                          id="markdown-file-input"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) processMarkdownFile(file);
                          }}
                        />
                        <label htmlFor="markdown-file-input" style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                          <BookOpen size={24} className="accent-cyan" />
                          <span className="admin-label" style={{ marginBottom: 0, color: "var(--text-primary)", fontWeight: 600 }}>
                            拖放 Markdown (.md) 笔记到这里，或点击浏览选择文件导入
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                            支持 [YAML Header] 自动映射元数据，Markdown 正文将自动转义编译为 HTML
                          </span>
                        </label>
                      </div>
                      <div className="admin-grid-two-cols">
                        <div className="admin-form-group">
                          <label className="admin-label">文章 ID (唯一标志，英文字符)</label>
                          <input 
                            type="text" 
                            className="admin-input" 
                            value={editItem.id}
                            onChange={(e) => handleFormChange("id", e.target.value)}
                            required
                            disabled={!isNew}
                            style={{ opacity: isNew ? 1 : 0.6 }}
                          />
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-label">分类 (Category)</label>
                          <select 
                            className="admin-select"
                            value={editItem.category}
                            onChange={(e) => handleFormChange("category", e.target.value)}
                          >
                            <option value="ai">AI 智能体</option>
                            <option value="fullstack">全栈开发</option>
                            <option value="thoughts">极客杂谈</option>
                          </select>
                        </div>
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-label">文章标题 (Title)</label>
                        <input 
                          type="text" 
                          className="admin-input" 
                          value={editItem.title}
                          onChange={(e) => handleFormChange("title", e.target.value)}
                          required
                        />
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-label">简短摘要 (Excerpt)</label>
                        <input 
                          type="text" 
                          className="admin-input" 
                          value={editItem.excerpt}
                          onChange={(e) => handleFormChange("excerpt", e.target.value)}
                          required
                        />
                      </div>

                      <div className="admin-grid-two-cols">
                        <div className="admin-form-group">
                          <label className="admin-label">日期 (YYYY-MM-DD)</label>
                          <input 
                            type="text" 
                            className="admin-input" 
                            value={editItem.date}
                            onChange={(e) => handleFormChange("date", e.target.value)}
                            required
                          />
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-label">阅读时长 (Read Time)</label>
                          <input 
                            type="text" 
                            className="admin-input" 
                            value={editItem.readTime}
                            onChange={(e) => handleFormChange("readTime", e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="admin-grid-two-cols">
                        <div className="admin-form-group">
                          <label className="admin-label">标签组 (Tags，用逗号英文隔开)</label>
                          <input 
                            type="text" 
                            className="admin-input" 
                            placeholder="AI Agents, LLMs, 教程"
                            value={editItem.tags?.join(", ") || ""}
                            onChange={(e) => handleCommaSeparatedTags(e.target.value)}
                          />
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-label">渐变背景色 (Gradient CSS)</label>
                          <input 
                            type="text" 
                            className="admin-input" 
                            value={editItem.coverColor}
                            onChange={(e) => handleFormChange("coverColor", e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-label">文章正文内容 (Content HTML / Rich formatting)</label>
                        <textarea 
                          className="admin-textarea"
                          value={editItem.content}
                          onChange={(e) => handleFormChange("content", e.target.value)}
                          required
                        />
                      </div>

                      {/* HTML Live Preview Node */}
                      <div className="admin-form-group">
                        <label className="admin-label">排版预览 (Live HTML Preview)</label>
                        <div className="preview-box" dangerouslySetInnerHTML={{ __html: previewContent }} />
                      </div>
                    </div>
                  )}

                  {/* EDIT PHOTOS FORM */}
                  {activeSubTab === "photos" && editItem && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div className="admin-grid-two-cols">
                        <div className="admin-form-group">
                          <label className="admin-label">照片 ID</label>
                          <input 
                            type="text" 
                            className="admin-input" 
                            value={editItem.id}
                            onChange={(e) => handleFormChange("id", e.target.value)}
                            required
                            disabled={!isNew}
                            style={{ opacity: isNew ? 1 : 0.6 }}
                          />
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-label">类型 (Category)</label>
                          <select 
                            className="admin-select"
                            value={editItem.category}
                            onChange={(e) => handleFormChange("category", e.target.value)}
                          >
                            <option value="setup">数码装备</option>
                            <option value="life">生活日常</option>
                            <option value="design">美学设计</option>
                            <option value="ai">AI 创作</option>
                          </select>
                        </div>
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-label">照片标题 (Title)</label>
                        <input 
                          type="text" 
                          className="admin-input" 
                          value={editItem.title}
                          onChange={(e) => handleFormChange("title", e.target.value)}
                          required
                        />
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-label">图片 URL (网络路径或本地相对路径)</label>
                        <input 
                          type="text" 
                          className="admin-input" 
                          value={editItem.image}
                          onChange={(e) => handleFormChange("image", e.target.value)}
                          required
                        />
                      </div>

                      <div className="admin-grid-two-cols">
                        <div className="admin-form-group">
                          <label className="admin-label">布局比例 (Aspect Ratio)</label>
                          <select 
                            className="admin-select"
                            value={editItem.aspectRatio}
                            onChange={(e) => handleFormChange("aspectRatio", e.target.value)}
                          >
                            <option value="aspect-landscape">横屏 (Landscape)</option>
                            <option value="aspect-portrait">竖屏 (Portrait)</option>
                            <option value="aspect-square">正方形 (Square)</option>
                          </select>
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-label">日期 (Date)</label>
                          <input 
                            type="text" 
                            className="admin-input" 
                            value={editItem.date}
                            onChange={(e) => handleFormChange("date", e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-label">详细描述 (Description)</label>
                        <textarea 
                          className="admin-textarea"
                          style={{ minHeight: "80px" }}
                          value={editItem.description}
                          onChange={(e) => handleFormChange("description", e.target.value)}
                          required
                        />
                      </div>

                      {/* Photo preview */}
                      {editItem.image && (
                        <div className="admin-form-group" style={{ textAlign: "center" }}>
                          <label className="admin-label" style={{ textAlign: "left" }}>图片效果预览 (Image Preview)</label>
                          <img 
                            src={editItem.image} 
                            alt="preview" 
                            style={{ maxWidth: "200px", maxHeight: "150px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}
                            onError={(e) => { e.target.style.display = "none"; }} 
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* EDIT PROJECTS FORM */}
                  {activeSubTab === "projects" && editItem && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div className="admin-grid-two-cols">
                        <div className="admin-form-group">
                          <label className="admin-label">项目 ID (唯一标识，小写英文)</label>
                          <input 
                            type="text" 
                            className="admin-input" 
                            value={editItem.id}
                            onChange={(e) => handleFormChange("id", e.target.value)}
                            required
                            disabled={!isNew}
                            style={{ opacity: isNew ? 1 : 0.6 }}
                          />
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-label">项目名称 (Project Name)</label>
                          <input 
                            type="text" 
                            className="admin-input" 
                            value={editItem.name}
                            onChange={(e) => handleFormChange("name", e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-label">项目说明 (Description)</label>
                        <input 
                          type="text" 
                          className="admin-input" 
                          value={editItem.description}
                          onChange={(e) => handleFormChange("description", e.target.value)}
                          required
                        />
                      </div>

                      <div className="admin-grid-two-cols">
                        <div className="admin-form-group">
                          <label className="admin-label">主要开发语言 (Language)</label>
                          <input 
                            type="text" 
                            className="admin-input" 
                            value={editItem.language}
                            onChange={(e) => handleFormChange("language", e.target.value)}
                            required
                          />
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-label">代码仓库链接 (GitHub Link)</label>
                          <input 
                            type="text" 
                            className="admin-input" 
                            value={editItem.link}
                            onChange={(e) => handleFormChange("link", e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="admin-grid-two-cols">
                        <div className="admin-form-group">
                          <label className="admin-label">收获星星 (Stars Mock)</label>
                          <input 
                            type="number" 
                            className="admin-input" 
                            value={editItem.stars}
                            onChange={(e) => handleFormChange("stars", parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-label">分支克隆 (Forks Mock)</label>
                          <input 
                            type="number" 
                            className="admin-input" 
                            value={editItem.forks}
                            onChange={(e) => handleFormChange("forks", parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-label">技术栈组件 (Tech tags，英文逗号分隔)</label>
                        <input 
                          type="text" 
                          className="admin-input" 
                          placeholder="Spring Boot, Redis, MyBatis"
                          value={editItem.tech?.join(", ") || ""}
                          onChange={(e) => handleCommaSeparatedTech(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Save/Cancel Action Button Row */}
                  <div className="form-button-row">
                    <button type="button" className="cyber-btn btn-secondary" onClick={() => setIsEditing(false)} style={{ padding: "10px 20px" }}>
                      取消 (Cancel)
                    </button>
                    <button type="submit" className="cyber-btn btn-primary" style={{ padding: "10px 20px" }}>
                      <Save size={14} style={{ marginRight: "8px" }} />
                      保存并提交 Git Commit (Save)
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Simulated Live Console Log Terminal */}
            <div className="terminal-console-log">
              <div className="console-line-sys flex-align" style={{ gap: "4px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "4px", marginBottom: "4px" }}>
                <Terminal size={12} />
                <span>TERMINAL_LOG_NODES (STATUS: ACTIVE)</span>
              </div>
              {logs.map((log, idx) => (
                <div key={idx} className={`console-line-${log.type}`}>
                  [{log.timestamp}] [{log.tag}] {log.message}
                </div>
              ))}
              <div ref={consoleEndRef} />
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
