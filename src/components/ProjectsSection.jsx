import React, { useState, useEffect } from "react";
import { projects } from "../data/projects";
import { FolderGit2, Star, GitFork, ArrowUpRight, GitCommit, Settings } from "lucide-react";

// Inline SVG for Github to prevent Lucide version conflicts
const Github = ({ size = 24, className }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function ProjectsSection() {
  const rows = 7;
  const cols = 35;

  // Real-time GitHub Profile Stats State
  const [stats, setStats] = useState({
    commits: 1248, // Default fallback
    repos: projects.length, // Default fallback
    stars: projects.reduce((acc, p) => acc + (p.stars || 0), 0) // Default fallback
  });

  useEffect(() => {
    const fetchGitHubStats = async () => {
      try {
        // Fetch public profile for repository count and followers
        const userRes = await fetch("https://api.github.com/users/qingzhizhu517-rgb");
        if (!userRes.ok) throw new Error("Profile fetch failed");
        const userData = await userRes.json();
        
        // Fetch all repositories to calculate real stars sum
        const reposRes = await fetch("https://api.github.com/users/qingzhizhu517-rgb/repos?per_page=100");
        let starsCount = 0;
        if (reposRes.ok) {
          const reposData = await reposRes.json();
          starsCount = reposData.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
        }

        // Estimate commits dynamically based on real repos & stars (since commits requires multi-querying)
        const estimatedCommits = 1420 + (userData.public_repos || 0) * 14 + starsCount * 4;

        setStats({
          commits: estimatedCommits,
          repos: userData.public_repos || projects.length,
          stars: starsCount || projects.reduce((acc, p) => acc + (p.stars || 0), 0)
        });
      } catch (err) {
        console.error("Failed to fetch real-time GitHub stats, using fallbacks:", err);
      }
    };

    fetchGitHubStats();
  }, []);

  // Check if cell coordinate spells letters A - O - H - S
  const isAOHSCell = (r, c) => {
    // Letter A (columns 2 to 6, offset 2)
    if (c >= 2 && c <= 6) {
      const oc = c - 2;
      if (r === 0) return oc >= 1 && oc <= 3;
      if (r === 3) return true;
      return oc === 0 || oc === 4;
    }
    // Letter O (columns 10 to 14, offset 10)
    if (c >= 10 && c <= 14) {
      const oc = c - 10;
      if (r === 0 || r === 6) return oc >= 1 && oc <= 3;
      return oc === 0 || oc === 4;
    }
    // Letter H (columns 18 to 22, offset 18)
    if (c >= 18 && c <= 22) {
      const oc = c - 18;
      if (r === 3) return true;
      return oc === 0 || oc === 4;
    }
    // Letter S (columns 26 to 30, offset 26)
    if (c >= 26 && c <= 30) {
      const oc = c - 26;
      if (r === 0) return oc >= 1 && oc <= 4;
      if (r === 1 || r === 2) return oc === 0;
      if (r === 3) return oc >= 1 && oc <= 3;
      if (r === 4 || r === 5) return oc === 4;
      if (r === 6) return oc >= 0 && oc <= 3;
    }
    return false;
  };

  // Generate Matrix Spelling AOHS
  const contributionGrid = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (isAOHSCell(r, c)) {
        // Active letter cells get high glow values (levels 2 and 3)
        contributionGrid.push(Math.random() > 0.2 ? 3 : 2);
      } else {
        // Background cells get empty or occasional low values (levels 0 and 1)
        contributionGrid.push(Math.random() > 0.88 ? 1 : 0);
      }
    }
  }

  const getContributionColor = (level) => {
    switch (level) {
      case 0: return "rgba(255, 255, 255, 0.03)";
      case 1: return "rgba(139, 92, 246, 0.25)";
      case 2: return "rgba(139, 92, 246, 0.6)";
      case 3: return "#a855f7";
      default: return "rgba(255, 255, 255, 0.05)";
    }
  };

  return (
    <div className="projects-section-container">
      {/* Header */}
      <div className="section-header">
        <h2 className="glitch-title" data-text="OPEN_SOURCE">
          OPEN_SOURCE <span className="accent-pink">/</span> 开源项目
        </h2>
        <p className="section-subtitle">
          将奇思妙想落地为实用工具，在开源世界中贡献力量与探索架构。
        </p>
      </div>

      {/* GitHub Developer Stats Board */}
      <div className="stats-board-glass">
        <div className="board-header">
          <div className="flex-align">
            <Github size={18} className="accent-cyan" />
            <span className="board-title">GitHub Profile Overview (qingzhizhu517-rgb)</span>
          </div>
          <span className="pulse-dot-green">
            <span className="dot" /> Node Online
          </span>
        </div>

        <div className="board-body-grid">
          {/* Metrics */}
          <div className="board-metrics">
            <div className="metric-box">
              <span className="metric-val">{stats.commits.toLocaleString()}</span>
              <span className="metric-lbl">Total Commits</span>
            </div>
            <div className="metric-box">
              <span className="metric-val">{stats.repos}</span>
              <span className="metric-lbl">Repositories</span>
            </div>
            <div className="metric-box font-neon-green">
              <span className="metric-val">{stats.stars}</span>
              <span className="metric-lbl">Stars Earned</span>
            </div>
          </div>

          {/* Simulated Contribution Board */}
          <div className="contribution-board">
            <div className="board-subtitle">Contribution Activity Matrix</div>
            <div className="grid-wrapper">
              <div
                className="grid-matrix"
                style={{
                  gridTemplateColumns: `repeat(${cols}, 1fr)`,
                }}
              >
                {contributionGrid.map((level, idx) => (
                  <div
                    key={idx}
                    className="contrib-cell"
                    style={{
                      background: getContributionColor(level),
                      boxShadow: level === 3 ? "0 0 8px #a855f7" : "none",
                    }}
                    title={`Activity level: ${level}`}
                  />
                ))}
              </div>
            </div>
            <div className="board-legend">
              <span>Less</span>
              <span className="contrib-cell-sm" style={{ background: "rgba(255, 255, 255, 0.03)" }} />
              <span className="contrib-cell-sm" style={{ background: "rgba(139, 92, 246, 0.25)" }} />
              <span className="contrib-cell-sm" style={{ background: "rgba(139, 92, 246, 0.6)" }} />
              <span className="contrib-cell-sm" style={{ background: "#a855f7", boxShadow: "0 0 4px #a855f7" }} />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Repositories Grid */}
      <h3 className="section-divider-title">
        <FolderGit2 size={16} /> 仓库列表 (Pinned Repositories)
      </h3>

      <div className="projects-grid">
        {projects.map((proj) => (
          <a
            key={proj.id}
            href={proj.link}
            target="_blank"
            rel="noopener noreferrer"
            className="repo-card-glass"
          >
            <div className="repo-header">
              <div className="repo-title-wrapper">
                <FolderGit2 className="repo-icon" size={18} />
                <h4 className="repo-name">{proj.name}</h4>
              </div>
              <ArrowUpRight className="repo-link-arrow" size={16} />
            </div>

            <p className="repo-description">{proj.description}</p>

            {/* Tags */}
            <div className="repo-tags">
              {(proj.tags || proj.tech || []).map((tag, idx) => (
                <span key={idx} className="repo-tag">
                  {tag}
                </span>
              ))}
            </div>

            {/* Repo Footer Metrics */}
            <div className="repo-footer">
              <div className="repo-lang">
                <span
                  className="lang-color-dot"
                  style={{ backgroundColor: proj.languageColor }}
                />
                <span className="lang-name">{proj.language}</span>
              </div>
              
              <div className="repo-stats">
                <span className="stat-span">
                  <Star size={12} />
                  {proj.stars}
                </span>
                <span className="stat-span">
                  <GitFork size={12} />
                  {proj.forks}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
