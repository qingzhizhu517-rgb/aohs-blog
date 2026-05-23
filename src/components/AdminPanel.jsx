import React, { useState, useEffect, useRef } from "react";
import { 
  Key, Folder, BookOpen, Image, Plus, Trash2, Save, X, 
  RefreshCw, Eye, LogOut, ArrowLeft, Shield, Terminal, Cpu, User
} from "lucide-react";
import { posts as localPosts } from "../data/posts";
import { photos as localPhotos } from "../data/photos";
import { projects as localProjects } from "../data/projects";
import { aiConfig as localAiConfig } from "../data/aiConfig";
import { about as localAbout } from "../data/about";
import { cacheLocalPreview, resolveImageUrl, resolveImagePreviewsInHtml } from "../utils/imageHelper";

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

  return resolveImagePreviewsInHtml(html);
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
  const [aiConfigState, setAiConfigState] = useState({ apiKey: "", endpoint: "" });
  const [aboutState, setAboutState] = useState({ name: "", tagline: "", avatars: [], bio: [], email: "", github: "", timeline: [] });

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
      case "settings": return "src/data/aiConfig.js";
      case "about": return "src/data/about.js";
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

      if (activeSubTab === "settings" || activeSubTab === "about") {
        const startIdx = contentRaw.indexOf("{");
        const endIdx = contentRaw.lastIndexOf("}");

        if (startIdx === -1 || endIdx === -1) {
          throw new Error("Unable to parse file structure. Make sure it exports an object enclosed in {}.");
        }

        const jsonText = contentRaw.substring(startIdx, endIdx + 1);
        const parsedObject = JSON.parse(jsonText);
        if (activeSubTab === "settings") {
          setAiConfigState(parsedObject);
          addLog("API_GET", `Successfully loaded AI settings configuration from GitHub.`, "succ");
        } else {
          setAboutState(parsedObject);
          addLog("API_GET", `Successfully loaded About Me content from GitHub.`, "succ");
        }
      } else {
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
      }
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
      } else if (activeSubTab === "settings") {
        setAiConfigState(localAiConfig);
      } else if (activeSubTab === "about") {
        setAboutState(localAbout);
      }
    } finally {
      setLoading(false);
    }
  };

  // Push updated list to GitHub API
  const pushDataToGit = async (updatedArray, updatedConfig = null, updatedAbout = null) => {
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
      let fileString = "";
      if (activeSubTab === "settings") {
        fileString = `export const aiConfig = ${JSON.stringify(updatedConfig, null, 2)};\n`;
      } else if (activeSubTab === "about") {
        fileString = `export const about = ${JSON.stringify(updatedAbout, null, 2)};\n`;
      } else {
        const varName = activeSubTab;
        fileString = `export const ${varName} = ${JSON.stringify(updatedArray, null, 2)};\n`;
      }

      // 3. PUT Commit to GitHub
      const putUrl = `https://api.github.com/repos/${username}/${repo}/contents/${path}`;
      const commitMessage = activeSubTab === "settings"
        ? `feat(cms): update AI API configurations`
        : activeSubTab === "about"
        ? `feat(cms): update About Me profile details`
        : `feat(cms): update ${activeSubTab} database via visual console`;

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
      if (activeSubTab === "settings") {
        setAiConfigState(updatedConfig);
      } else if (activeSubTab === "about") {
        setAboutState(updatedAbout);
      } else {
        if (activeSubTab === "posts") setPosts(updatedArray);
        if (activeSubTab === "photos") setPhotos(updatedArray);
        if (activeSubTab === "projects") setProjects(updatedArray);

        setIsEditing(false);
        setEditItem(null);
      }
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

  // Submit AI settings form
  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    pushDataToGit(null, aiConfigState);
  };

  // Submit About Me profile form
  const handleAboutSubmit = (e) => {
    e.preventDefault();
    pushDataToGit(null, null, aboutState);
  };

  // Reset AI endpoint to default
  const resetAiConfig = () => {
    setAiConfigState(prev => ({
      ...prev,
      endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
    }));
    addLog("CMS_SETTINGS", "Reset API endpoint to default gemini-1.5-flash.", "sys");
  };

  // Handle preset model selection
  const handleModelChange = (modelName) => {
    setAiConfigState(prev => ({
      ...prev,
      endpoint: `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`
    }));
    addLog("CMS_SETTINGS", `Switched target model to ${modelName}.`, "sys");
  };

  // Upload image to GitHub repository contents (with local-first caching)
  const uploadImageToGitHub = async (file) => {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const filename = `upload_${Date.now()}_${cleanFileName}`;
    const path = `public/uploads/${filename}`;
    const relativeUrl = `uploads/${filename}`;
    
    addLog("API_UPLOAD", `Processing image ${file.name} (local preview cached)...`, "sys");

    try {
      // Read file as Base64 Data URL
      const base64DataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Cache the preview locally so we can view it immediately
      cacheLocalPreview(relativeUrl, base64DataUrl);

      // If GitHub integration is not configured, complete locally
      if (!username || !repo || !token) {
        addLog("API_UPLOAD", `GitHub credentials not configured. Cached ${file.name} locally only.`, "warn");
        return relativeUrl;
      }

      const base64Content = base64DataUrl.split(",")[1];

      // Put to GitHub REST API
      const url = `https://api.github.com/repos/${username}/${repo}/contents/${path}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/vnd.github+json"
        },
        body: JSON.stringify({
          message: `upload(assets): upload image ${file.name} via console`,
          content: base64Content,
          branch: branch
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      addLog("API_UPLOAD", `Uploaded successfully! File URL: uploads/${filename}`, "succ");
      return relativeUrl;
    } catch (err) {
      addLog("API_UPLOAD_ERR", `Failed to upload image ${file.name} to GitHub: ${err.message}. Using local preview cache.`, "warn");
      // Still return the relativeUrl since we cached the preview locally
      return relativeUrl;
    }
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
              <button 
                className={`admin-nav-btn ${activeSubTab === "about" ? "active" : ""}`}
                onClick={() => { setActiveSubTab("about"); setIsEditing(false); }}
              >
                <User size={16} />
                关于我 (About)
              </button>
              <button 
                className={`admin-nav-btn ${activeSubTab === "settings" ? "active" : ""}`}
                onClick={() => { setActiveSubTab("settings"); setIsEditing(false); }}
              >
                <Key size={16} />
                AI 设定 (AI Settings)
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

            {!isEditing && activeSubTab !== "settings" && activeSubTab !== "about" ? (
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

                {activeSubTab === "photos" && (
                  /* Batch photos drag and drop uploader */
                  <div 
                    className="admin-form-group"
                    style={{
                      border: "2px dashed var(--neon-purple)",
                      padding: "24px",
                      borderRadius: "12px",
                      textAlign: "center",
                      background: "rgba(139, 92, 246, 0.02)",
                      marginBottom: "20px",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.borderColor = "var(--neon-pink)";
                      e.currentTarget.style.background = "rgba(236, 72, 153, 0.05)";
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.borderColor = "var(--neon-purple)";
                      e.currentTarget.style.background = "rgba(139, 92, 246, 0.02)";
                    }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      e.currentTarget.style.borderColor = "var(--neon-purple)";
                      e.currentTarget.style.background = "rgba(139, 92, 246, 0.02)";
                      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
                      if (files.length === 0) return;
                      
                      setLoading(true);
                      try {
                        const newPhotosList = [...photos];
                        for (let i = 0; i < files.length; i++) {
                          const file = files[i];
                          const relativeUrl = await uploadImageToGitHub(file);
                          
                          const newEntry = {
                            id: `photo-${Date.now()}-${i}`,
                            title: file.name.substring(0, file.name.lastIndexOf('.')) || "未命名随笔",
                            category: "life",
                            image: relativeUrl,
                            description: "自动上传图片创建的日常随笔...",
                            aspectRatio: "aspect-landscape",
                            date: new Date().toISOString().split("T")[0],
                            likes: 0
                          };
                          newPhotosList.unshift(newEntry);
                        }
                        
                        await pushDataToGit(newPhotosList);
                        addLog("CMS_BATCH", `Successfully batch created ${files.length} photo entries!`, "succ");
                      } catch (err) {
                        alert(`批量上传失败: ${err.message}`);
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      style={{ display: "none" }} 
                      id="photos-batch-file-input"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files).filter(f => f.type.startsWith("image/"));
                        if (files.length === 0) return;
                        
                        setLoading(true);
                        try {
                          const newPhotosList = [...photos];
                          for (let i = 0; i < files.length; i++) {
                            const file = files[i];
                            const relativeUrl = await uploadImageToGitHub(file);
                            
                            const newEntry = {
                              id: `photo-${Date.now()}-${i}`,
                              title: file.name.substring(0, file.name.lastIndexOf('.')) || "未命名随笔",
                              category: "life",
                              image: relativeUrl,
                              description: "自动上传图片创建的日常随笔...",
                              aspectRatio: "aspect-landscape",
                              date: new Date().toISOString().split("T")[0],
                              likes: 0
                            };
                            newPhotosList.unshift(newEntry);
                          }
                          await pushDataToGit(newPhotosList);
                          addLog("CMS_BATCH", `Successfully batch created ${files.length} photo entries!`, "succ");
                        } catch (err) {
                          alert(`批量上传失败: ${err.message}`);
                        } finally {
                          setLoading(false);
                        }
                      }}
                    />
                    <label htmlFor="photos-batch-file-input" style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                      <Image size={28} className="accent-pink" />
                      <span className="admin-label" style={{ marginBottom: 0, color: "var(--text-primary)", fontWeight: 600 }}>
                        拖放一个或多个图片到这里，或点击选择图片批量上传
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        图片将自动存入 GitHub 仓库中的 public/uploads/ 文件夹并批量追加到随笔中
                      </span>
                    </label>
                  </div>
                )}

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
            ) : activeSubTab === "settings" ? (
              /* Settings form mode */
              <>
                <div className="admin-panel-header">
                  <h3 className="admin-panel-title">AI 智能设定 (AI Configuration)</h3>
                </div>
                <form onSubmit={handleSettingsSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="admin-form-group">
                    <label className="admin-label">Gemini API 密钥 (Gemini API Key)</label>
                    <input 
                      type="password" 
                      className="admin-input" 
                      placeholder="AI_API_KEY (AI 智能对话所用)"
                      value={aiConfigState.apiKey}
                      onChange={(e) => setAiConfigState(prev => ({ ...prev, apiKey: e.target.value }))}
                      required
                    />
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "4px", display: "block" }}>
                      建议使用无扣费信用卡的免费额度 API Key (15 RPM / 1500 RPD)，避免密钥暴露带来的经济风险。
                    </span>
                  </div>

                  <div className="admin-grid-two-cols">
                    <div className="admin-form-group">
                      <label className="admin-label">推荐模型预设 (Model Preset)</label>
                      <select 
                        className="admin-select"
                        onChange={(e) => handleModelChange(e.target.value)}
                        defaultValue="gemini-1.5-flash"
                      >
                        <option value="gemini-1.5-flash">gemini-1.5-flash (默认/推荐)</option>
                        <option value="gemini-2.0-flash">gemini-2.0-flash (最新高速版)</option>
                        <option value="gemini-2.5-flash">gemini-2.5-flash (超强能版)</option>
                      </select>
                    </div>
                    <div className="admin-form-group" style={{ display: "flex", alignItems: "flex-end" }}>
                      <button 
                        type="button" 
                        className="cyber-btn btn-secondary" 
                        onClick={resetAiConfig}
                        style={{ width: "100%", padding: "10px", fontSize: "0.8rem", height: "42px", justifyContent: "center" }}
                      >
                        重置为默认端点
                      </button>
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Gemini 接口端点 (API Endpoint)</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      value={aiConfigState.endpoint}
                      onChange={(e) => setAiConfigState(prev => ({ ...prev, endpoint: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-button-row">
                    <button type="submit" className="cyber-btn btn-primary" style={{ padding: "10px 20px" }}>
                      <Save size={14} style={{ marginRight: "8px" }} />
                      保存并提交配置 Git Commit (Save Config)
                    </button>
                  </div>
                </form>
              </>
            ) : activeSubTab === "about" ? (
              /* About form mode */
              <>
                <div className="admin-panel-header">
                  <h3 className="admin-panel-title">关于我 个人主页管理 (About Profile)</h3>
                </div>
                <form onSubmit={handleAboutSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div className="admin-grid-two-cols">
                    <div className="admin-form-group">
                      <label className="admin-label">博主姓名 (Name)</label>
                      <input 
                        type="text" 
                        className="admin-input" 
                        value={aboutState.name}
                        onChange={(e) => setAboutState(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">个性签名/副标题 (Tagline)</label>
                      <input 
                        type="text" 
                        className="admin-input" 
                        value={aboutState.tagline}
                        onChange={(e) => setAboutState(prev => ({ ...prev, tagline: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="admin-grid-two-cols">
                    <div className="admin-form-group">
                      <label className="admin-label">联系邮箱 (Email)</label>
                      <input 
                        type="email" 
                        className="admin-input" 
                        value={aboutState.email}
                        onChange={(e) => setAboutState(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">GitHub 地址 (GitHub Link)</label>
                      <input 
                        type="text" 
                        className="admin-input" 
                        value={aboutState.github}
                        onChange={(e) => setAboutState(prev => ({ ...prev, github: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  {/* Avatars Manager with Drag & Drop */}
                  <div className="admin-form-group">
                    <label className="admin-label">个人头像列表 (Avatars - 拖放可上传多张头像实现轮播)</label>
                    
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }}>
                      {aboutState.avatars?.map((av, idx) => (
                        <div key={idx} style={{ position: "relative", width: "80px", height: "80px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>
                          <img src={resolveImageUrl(av)} alt="avatar-slide" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <button 
                            type="button" 
                            style={{ position: "absolute", top: "2px", right: "2px", background: "rgba(239, 68, 68, 0.9)", border: "none", color: "white", borderRadius: "50%", width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "10px" }}
                            onClick={() => {
                              const newAvatars = aboutState.avatars.filter((_, i) => i !== idx);
                              setAboutState(prev => ({ ...prev, avatars: newAvatars }));
                              addLog("CMS_ABOUT", `Removed avatar slide index ${idx}`, "sys");
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <div
                      style={{
                        border: "2px dashed var(--neon-cyan)",
                        borderRadius: "10px",
                        padding: "20px",
                        textAlign: "center",
                        background: "rgba(6, 182, 212, 0.02)",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = "var(--neon-pink)";
                        e.currentTarget.style.background = "rgba(236, 72, 153, 0.05)";
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = "var(--neon-cyan)";
                        e.currentTarget.style.background = "rgba(6, 182, 212, 0.02)";
                      }}
                      onDrop={async (e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = "var(--neon-cyan)";
                        e.currentTarget.style.background = "rgba(6, 182, 212, 0.02)";
                        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
                        if (files.length === 0) return;
                        
                        setLoading(true);
                        try {
                          const uploadedUrls = [];
                          for (const file of files) {
                            const url = await uploadImageToGitHub(file);
                            uploadedUrls.push(url);
                          }
                          setAboutState(prev => ({
                            ...prev,
                            avatars: [...(prev.avatars || []), ...uploadedUrls]
                          }));
                          addLog("CMS_ABOUT", `Successfully uploaded ${files.length} new avatar(s)!`, "succ");
                        } catch (err) {
                          alert(`上传头像失败: ${err.message}`);
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        style={{ display: "none" }} 
                        id="about-avatars-file-input"
                        onChange={async (e) => {
                          const files = Array.from(e.target.files).filter(f => f.type.startsWith("image/"));
                          if (files.length === 0) return;
                          
                          setLoading(true);
                          try {
                            const uploadedUrls = [];
                            for (const file of files) {
                              const url = await uploadImageToGitHub(file);
                              uploadedUrls.push(url);
                            }
                            setAboutState(prev => ({
                              ...prev,
                              avatars: [...(prev.avatars || []), ...uploadedUrls]
                            }));
                            addLog("CMS_ABOUT", `Successfully uploaded ${files.length} new avatar(s)!`, "succ");
                          } catch (err) {
                            alert(`上传头像失败: ${err.message}`);
                          } finally {
                            setLoading(false);
                          }
                        }}
                      />
                      <label htmlFor="about-avatars-file-input" style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                        <Image size={24} className="accent-cyan" />
                        <span className="admin-label" style={{ marginBottom: 0, color: "var(--text-primary)", fontWeight: 600 }}>
                          拖入一张或多张个人头像到这里，或点击浏览选择
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          上传多张头像后，个人主页头像框将自动开启轮播效果
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Biography (Bio Paragraphs) */}
                  <div className="admin-form-group">
                    <label className="admin-label">关于我 个人简介段落 (Biography - 双换行分割段落)</label>
                    <textarea 
                      className="admin-textarea"
                      style={{ minHeight: "120px" }}
                      value={aboutState.bio?.join("\n\n") || ""}
                      onChange={(e) => {
                        const paras = e.target.value.split("\n\n");
                        setAboutState(prev => ({ ...prev, bio: paras }));
                      }}
                      placeholder="第一段简介...&#10;&#10;第二段简介 (使用两个回车键换行分隔段落)..."
                      required
                    />
                  </div>

                  {/* Timeline Node List */}
                  <div className="admin-form-group" style={{ border: "1px solid rgba(255,255,255,0.06)", padding: "16px", borderRadius: "10px", background: "rgba(255,255,255,0.01)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <label className="admin-label" style={{ marginBottom: 0, fontSize: "0.95rem" }}>编年史事件列表 (Timeline Milestones)</label>
                      <button 
                        type="button" 
                        className="cyber-btn btn-secondary" 
                        style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                        onClick={() => {
                          const newTimeline = [...(aboutState.timeline || []), { year: "2026", role: "新角色", company: "新机构", type: "work", desc: "详细描述..." }];
                          setAboutState(prev => ({ ...prev, timeline: newTimeline }));
                        }}
                      >
                        <Plus size={12} style={{ marginRight: "4px" }} />
                        增加事件节点
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {aboutState.timeline?.map((item, idx) => (
                        <div key={idx} style={{ border: "1px dashed rgba(255,255,255,0.08)", padding: "12px", borderRadius: "8px", background: "rgba(0,0,0,0.2)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--neon-purple)" }}>节点 #{idx + 1}</span>
                            <button 
                              type="button" 
                              className="admin-icon-btn btn-delete" 
                              style={{ padding: "4px" }}
                              onClick={() => {
                                const newTimeline = aboutState.timeline.filter((_, i) => i !== idx);
                                setAboutState(prev => ({ ...prev, timeline: newTimeline }));
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>

                          <div className="admin-grid-two-cols" style={{ marginBottom: "8px" }}>
                            <div className="admin-form-group">
                              <label className="admin-label" style={{ fontSize: "0.75rem" }}>年份段 (Year)</label>
                              <input 
                                type="text" 
                                className="admin-input" 
                                style={{ padding: "6px 10px", fontSize: "0.8rem" }}
                                value={item.year}
                                onChange={(e) => {
                                  const updatedTimeline = aboutState.timeline.map((t, i) => i === idx ? { ...t, year: e.target.value } : t);
                                  setAboutState(prev => ({ ...prev, timeline: updatedTimeline }));
                                }}
                                required
                              />
                            </div>
                            <div className="admin-form-group">
                              <label className="admin-label" style={{ fontSize: "0.75rem" }}>工作岗位/职位 (Role)</label>
                              <input 
                                type="text" 
                                className="admin-input" 
                                style={{ padding: "6px 10px", fontSize: "0.8rem" }}
                                value={item.role}
                                onChange={(e) => {
                                  const updatedTimeline = aboutState.timeline.map((t, i) => i === idx ? { ...t, role: e.target.value } : t);
                                  setAboutState(prev => ({ ...prev, timeline: updatedTimeline }));
                                }}
                                required
                              />
                            </div>
                          </div>

                          <div className="admin-grid-two-cols" style={{ marginBottom: "8px" }}>
                            <div className="admin-form-group">
                              <label className="admin-label" style={{ fontSize: "0.75rem" }}>机构/公司 (Company)</label>
                              <input 
                                type="text" 
                                className="admin-input" 
                                style={{ padding: "6px 10px", fontSize: "0.8rem" }}
                                value={item.company}
                                onChange={(e) => {
                                  const updatedTimeline = aboutState.timeline.map((t, i) => i === idx ? { ...t, company: e.target.value } : t);
                                  setAboutState(prev => ({ ...prev, timeline: updatedTimeline }));
                                }}
                                required
                              />
                            </div>
                            <div className="admin-form-group">
                              <label className="admin-label" style={{ fontSize: "0.75rem" }}>类型 (Type)</label>
                              <select 
                                className="admin-select"
                                style={{ padding: "6px 10px", fontSize: "0.8rem" }}
                                value={item.type}
                                onChange={(e) => {
                                  const updatedTimeline = aboutState.timeline.map((t, i) => i === idx ? { ...t, type: e.target.value } : t);
                                  setAboutState(prev => ({ ...prev, timeline: updatedTimeline }));
                                }}
                              >
                                <option value="work">工作经历 (Work)</option>
                                <option value="edu">教育经历 (Education)</option>
                              </select>
                            </div>
                          </div>

                          <div className="admin-form-group">
                            <label className="admin-label" style={{ fontSize: "0.75rem" }}>具体工作描述 (Description)</label>
                            <input 
                              type="text" 
                              className="admin-input" 
                              style={{ padding: "6px 10px", fontSize: "0.8rem" }}
                              value={item.desc}
                              onChange={(e) => {
                                  const updatedTimeline = aboutState.timeline.map((t, i) => i === idx ? { ...t, desc: e.target.value } : t);
                                  setAboutState(prev => ({ ...prev, timeline: updatedTimeline }));
                              }}
                              required
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-button-row">
                    <button type="submit" className="cyber-btn btn-primary" style={{ padding: "10px 20px" }}>
                      <Save size={14} style={{ marginRight: "8px" }} />
                      保存并提交个人资料 Git Commit (Save Profile)
                    </button>
                  </div>
                </form>
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
                        <label className="admin-label">文章正文内容 (支持拖放单张或多张图片至输入框内自动上传并插入)</label>
                        <div
                          style={{
                            border: "1px dashed rgba(255,255,255,0.15)",
                            borderRadius: "8px",
                            padding: "6px",
                            background: "rgba(255,255,255,0.01)",
                            transition: "all 0.2s ease"
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = "var(--neon-cyan)";
                            e.currentTarget.style.background = "rgba(6, 182, 212, 0.03)";
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                            e.currentTarget.style.background = "rgba(255,255,255,0.01)";
                          }}
                          onDrop={async (e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                            e.currentTarget.style.background = "rgba(255,255,255,0.01)";
                            const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
                            if (files.length === 0) return;
                            
                            setLoading(true);
                            try {
                              let insertedText = "";
                              for (const file of files) {
                                const relativeUrl = await uploadImageToGitHub(file);
                                insertedText += `\n<img src="${relativeUrl}" alt="${file.name.split('.')[0]}" style="max-width:100%; border-radius:8px; margin: 12px 0;" />\n`;
                              }
                              const currentVal = editItem.content || "";
                              handleFormChange("content", currentVal + insertedText);
                              addLog("CMS_POST_IMAGE", `Inserted ${files.length} images into post content.`, "succ");
                            } catch (err) {
                              alert(`图片上传失败: ${err.message}`);
                            } finally {
                              setLoading(false);
                            }
                          }}
                        >
                          <textarea 
                            className="admin-textarea"
                            value={editItem.content}
                            onChange={(e) => handleFormChange("content", e.target.value)}
                            placeholder="在此输入文章的 HTML/正文内容... 亦可直接在此处拖放一个或多个图片文件，自动上传并生成并拼入 <img> 标签！"
                            required
                            style={{ border: "none", background: "transparent", outline: "none", boxShadow: "none" }}
                          />
                        </div>
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
                        <label className="admin-label">图片 URL (输入路径，或拖放单张图片到下方虚线框上传)</label>
                        <input 
                          type="text" 
                          className="admin-input" 
                          value={editItem.image}
                          onChange={(e) => handleFormChange("image", e.target.value)}
                          placeholder="uploads/filename.jpg"
                          required
                          style={{ marginBottom: "8px" }}
                        />
                        <div
                          style={{
                            border: "1px dashed rgba(255,255,255,0.15)",
                            borderRadius: "8px",
                            padding: "16px",
                            textAlign: "center",
                            background: "rgba(255,255,255,0.01)",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = "var(--neon-cyan)";
                            e.currentTarget.style.background = "rgba(6, 182, 212, 0.05)";
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                            e.currentTarget.style.background = "rgba(255,255,255,0.01)";
                          }}
                          onDrop={async (e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                            e.currentTarget.style.background = "rgba(255,255,255,0.01)";
                            const file = e.dataTransfer.files[0];
                            if (file && file.type.startsWith("image/")) {
                              setLoading(true);
                              try {
                                const relativeUrl = await uploadImageToGitHub(file);
                                handleFormChange("image", relativeUrl);
                              } catch (err) {
                                alert(`图片上传失败: ${err.message}`);
                              } finally {
                                setLoading(false);
                              }
                            }
                          }}
                        >
                          <input 
                            type="file" 
                            accept="image/*" 
                            style={{ display: "none" }} 
                            id="photo-single-file-input"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setLoading(true);
                                try {
                                  const relativeUrl = await uploadImageToGitHub(file);
                                  handleFormChange("image", relativeUrl);
                                } catch (err) {
                                  alert(`图片上传失败: ${err.message}`);
                                } finally {
                                  setLoading(false);
                                }
                              }
                            }}
                          />
                          <label htmlFor="photo-single-file-input" style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                              {editItem.image ? `当前已选: ${editItem.image}` : "拖放单张图片到这里上传，或点击更换文件"}
                            </span>
                            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                              （文件将上传至 GitHub 仓库 public/uploads/）
                            </span>
                          </label>
                        </div>
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
                            src={resolveImageUrl(editItem.image)} 
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
