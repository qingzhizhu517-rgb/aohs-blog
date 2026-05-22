import React from "react";
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
  // Generate random data for contribution board (Mock: 7 rows x 24 columns for compact look)
  const rows = 7;
  const cols = 35;
  const contributionGrid = Array.from({ length: rows * cols }, (_, i) => {
    const val = Math.random();
    if (val < 0.4) return 0; // empty
    if (val < 0.7) return 1; // low
    if (val < 0.9) return 2; // medium
    return 3; // high
  });

  const getContributionColor = (level) => {
    switch (level) {
      case 0: return "rgba(255, 255, 255, 0.03)"; // background empty
      case 1: return "rgba(139, 92, 246, 0.25)"; // light purple
      case 2: return "rgba(139, 92, 246, 0.6)";  // medium purple
      case 3: return "#a855f7";                 // bright purple neon
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
            <span className="board-title">GitHub Profile Overview (Aohs)</span>
          </div>
          <span className="pulse-dot-green">
            <span className="dot" /> Node Online
          </span>
        </div>

        <div className="board-body-grid">
          {/* Metrics */}
          <div className="board-metrics">
            <div className="metric-box">
              <span className="metric-val">1,248</span>
              <span className="metric-lbl">Total Commits</span>
            </div>
            <div className="metric-box">
              <span className="metric-val">18</span>
              <span className="metric-lbl">Repositories</span>
            </div>
            <div className="metric-box font-neon-green">
              <span className="metric-val">798</span>
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
              {proj.tags.map((tag, idx) => (
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
