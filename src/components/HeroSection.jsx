import React, { useEffect, useState, useRef } from "react";
import { 
  ArrowRight, Terminal, BookOpen, Camera, Cpu, Sparkles, 
  Database, Shield, Activity, Calendar, Clock, GitBranch, ArrowUpRight 
} from "lucide-react";
import { posts } from "../data/posts";
import { photos } from "../data/photos";
import { projects } from "../data/projects";
import { resolveImageUrl } from "../utils/imageHelper";

export default function HeroSection({ setActiveTab, onPostSelect }) {
  const [typedText, setTypedText] = useState("");
  const fullText = "构建可交互的数字化创意，分享全栈与 AI 笔记。";
  
  // Terminal simulator states
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalLogs, setTerminalLogs] = useState([
    { text: "System diagnostic loader v1.2.0 initialized...", type: "sys" },
    { text: "Connecting to database nodes... SUCCESS.", type: "sys" },
    { text: "Type 'help' to see available diagnostic commands.", type: "info" }
  ]);
  const logsEndRef = useRef(null);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedText((prev) => prev + fullText.charAt(index));
      index++;
      if (index >= fullText.length) {
        clearInterval(interval);
      }
    }, 85);
    return () => clearInterval(interval);
  }, []);

  // Scroll terminal logs to bottom
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalLogs]);

  // Terminal commands handler
  const handleCommand = (cmdText) => {
    const cleanCmd = cmdText.trim().toLowerCase();
    if (!cleanCmd) return;

    const newLogs = [...terminalLogs, { text: `> ${cmdText}`, type: "cmd" }];

    switch (cleanCmd) {
      case "help":
        newLogs.push(
          { text: "Available commands:", type: "info" },
          { text: "  status      - Display system performance & node metrics", type: "info" },
          { text: "  logs        - List loaded archives, photos & project details", type: "info" },
          { text: "  ai-ping     - Test connection latency to Gemini AI node", type: "info" },
          { text: "  about       - Query creator personal biography", type: "info" },
          { text: "  clear       - Clear terminal console", type: "info" }
        );
        break;
      case "status":
        newLogs.push(
          { text: "[SYSTEM PERFORMANCE MODULE]", type: "sys" },
          { text: `Uptime: ${Math.floor(Date.now() / 100000000) % 200 + 48} hours`, type: "success" },
          { text: "Environment: PRODUCTION (Vite SPA Client)", type: "success" },
          { text: "Security: SSL (HTTPS) Active", type: "success" },
          { text: `Data nodes online: posts(${posts.length}), photos(${photos.length}), projects(${projects.length})`, type: "success" },
          { text: "Local storage cache preview: ENABLED", type: "success" }
        );
        break;
      case "logs":
        newLogs.push({ text: "[DATABASE DATA LOGS]", type: "sys" });
        if (posts.length > 0) {
          newLogs.push({ text: `Latest Post: "${posts[0].title}" (${posts[0].date})`, type: "info" });
        } else {
          newLogs.push({ text: "Latest Post: No records found (Database empty)", type: "warn" });
        }
        if (photos.length > 0) {
          newLogs.push({ text: `Latest Photo: "${photos[0].title}" (${photos[0].date})`, type: "info" });
        }
        if (projects.length > 0) {
          newLogs.push({ text: `Primary Repo: "${projects[0].name}" (${projects[0].language})`, type: "info" });
        }
        break;
      case "ai-ping":
        newLogs.push(
          { text: "Pinging Gemini API model node (gemini-2.5-flash)...", type: "sys" },
          { text: `Latency: ${Math.floor(Math.random() * 20) + 12}ms (Connection STABLE)`, type: "success" }
        );
        break;
      case "about":
        newLogs.push(
          { text: "[AOHS LOGICAL CORE PROFILE]", type: "sys" },
          { text: "Name: Aohs (朱庆知) - Full-Stack Developer", type: "info" },
          { text: "Core skills: Java, Spring Boot, Vue 3, Vite, AI Agent Design", type: "info" },
          { text: "Motto: 'Keep it simple, keep it smart.'", type: "success" }
        );
        break;
      case "clear":
        setTerminalLogs([]);
        setTerminalInput("");
        return;
      default:
        newLogs.push({ text: `Command not found: '${cleanCmd}'. Type 'help' for support.`, type: "error" });
    }

    setTerminalLogs(newLogs);
    setTerminalInput("");
  };

  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    handleCommand(terminalInput);
  };

  return (
    <div className="home-dashboard-wrapper">
      {/* 1. HERO HEADER SPLIT ROW */}
      <section className="hero-split-section">
        <div className="hero-split-layout">
          
          {/* Left Column: Intro Core */}
          <div className="hero-left-col">
            <div className="cyber-badge-container">
              <span className="cyber-pulse-badge">
                <span className="pulse-dot" />
                CORE ONLINE
              </span>
              <span className="cyber-version-badge">V1.3.0-PROD</span>
            </div>

            <h1 className="hero-title" data-text="Aohs.DEV">
              Aohs<span className="text-glow-purple">.</span>DEV
            </h1>

            <h2 className="hero-subtitle">
              个人创意开发者 <span className="neon-slash">/</span> AI 工作流探索者
            </h2>

            <p className="hero-typing-box">
              <span className="typing-prefix">&gt; </span>
              {typedText}
              <span className="typing-cursor">_</span>
            </p>

            <div className="hero-actions">
              <button className="cyber-btn btn-primary" onClick={() => setActiveTab("blog")}>
                浏览文章
                <ArrowRight size={16} />
              </button>
              <button className="cyber-btn btn-secondary" onClick={() => setActiveTab("projects")}>
                <Terminal size={16} />
                开源项目
              </button>
            </div>
            
            {/* Direct Console Diagnostics Buttons */}
            <div className="terminal-quick-triggers">
              <span className="trigger-label">QUICK_SYS_QUERY:</span>
              <button onClick={() => handleCommand("status")}>[status]</button>
              <button onClick={() => handleCommand("logs")}>[logs]</button>
              <button onClick={() => handleCommand("ai-ping")}>[ai-ping]</button>
            </div>
          </div>

          {/* Right Column: Interactive Diagnostic Console Terminal */}
          <div className="hero-right-col">
            <div className="cyber-terminal-card">
              <div className="terminal-card-header">
                <div className="terminal-actions">
                  <span className="dot red" />
                  <span className="dot yellow" />
                  <span className="dot green" />
                </div>
                <div className="terminal-title">system_diagnostics.sh</div>
                <Terminal size={14} className="accent-cyan" />
              </div>
              
              <div className="terminal-card-body">
                <div className="terminal-logs-window">
                  {terminalLogs.map((log, idx) => (
                    <div key={idx} className={`log-row type-${log.type}`}>
                      {log.text}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>

                <form onSubmit={handleTerminalSubmit} className="terminal-input-form">
                  <span className="terminal-prompt">aohs@dev:~$</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    placeholder="输入 'help' 获取命令..."
                    className="terminal-input-field"
                  />
                </form>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. STATS SYSTEM METRICS ROW */}
      <section className="stats-metrics-section">
        <div className="stats-grid-glass">
          <div className="stat-metric-card" onClick={() => setActiveTab("projects")}>
            <div className="metric-header">
              <span className="label">REPOS</span>
              <Terminal size={14} className="text-cyan" />
            </div>
            <div className="metric-value">{projects.length}+</div>
            <div className="metric-footer">开源成果展示</div>
          </div>

          <div className="stat-metric-card" onClick={() => setActiveTab("blog")}>
            <div className="metric-header">
              <span className="label">ARTICLES</span>
              <BookOpen size={14} className="text-purple" />
            </div>
            <div className="metric-value">{posts.length}+</div>
            <div className="metric-footer">深度技术博客</div>
          </div>

          <div className="stat-metric-card" onClick={() => setActiveTab("photos")}>
            <div className="metric-header">
              <span className="label">DAILY_SNAPS</span>
              <Camera size={14} className="text-pink" />
            </div>
            <div className="metric-value">{photos.length}+</div>
            <div className="metric-footer">影像生活记录</div>
          </div>

          <div className="stat-metric-card" onClick={() => setActiveTab("agent")}>
            <div className="metric-header">
              <span className="label">AI_AGENT</span>
              <Cpu size={14} className="text-neon-green" style={{ color: "#10b981" }} />
            </div>
            <div className="metric-value">2.5F</div>
            <div className="metric-footer">双向智能分身在线</div>
          </div>
        </div>
      </section>

      {/* 3. SECURITY & SYSTEM STATS DOCK */}
      <section className="security-terminal-footer">
        <div className="terminal-footer-grid">
          <div className="footer-metric">
            <Shield size={14} className="text-cyan" />
            <span>SSL加密安全认证：ACTIVE</span>
          </div>
          <div className="footer-metric">
            <Cpu size={14} className="text-purple" />
            <span>编译核心：React 19 + Vite 8</span>
          </div>
          <div className="footer-metric">
            <Database size={14} className="text-pink" />
            <span>数据源：GitHub Git-CMS API</span>
          </div>
        </div>
      </section>

    </div>
  );
}
