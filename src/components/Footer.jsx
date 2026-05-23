import React from "react";
import { Terminal, Shield, Cpu } from "lucide-react";
import { skills } from "../data/skills";

export default function Footer({ setActiveTab }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-container">
      <div className="footer-glass">
        <div className="footer-grid">
          {/* Copyrights */}
          <div className="footer-section">
            <h4 className="footer-title">Aohs.DEV</h4>
            <p className="footer-desc">
              创意与工程的交汇处。分享关于全栈开发、AI 探索与生活的点滴碎碎念。
            </p>
            <p className="footer-copyright">
              © {currentYear} Aohs. All rights reserved.
            </p>
          </div>

          {/* System Terminal Status */}
          <div className="footer-section status-section">
            <h4 className="footer-title flex-align">
              <Terminal size={14} className="accent-pink" /> 终端运行状态
            </h4>
            <div className="status-grid">
              <div className="status-item">
                <span className="status-label">SYS STATUS:</span>
                <span className="status-value status-online">ONLINE</span>
              </div>
              <div className="status-item">
                <span className="status-label">LATENCY:</span>
                <span className="status-value text-cyan">18ms</span>
              </div>
              <div className="status-item">
                <span className="status-label">ENVIRONMENT:</span>
                <span className="status-value text-purple">PRODUCTION</span>
              </div>
              <div className="status-item">
                <span className="status-label">AI ASSIST:</span>
                <span className="status-value status-active">ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Technologies Used info */}
          <div className="footer-section tech-section">
            <h4 className="footer-title flex-align">
              <Cpu size={14} className="accent-cyan" /> 技术栈
            </h4>
            <div className="tech-tags">
              {skills.flatMap(s => s.tags).map((tag, idx) => (
                <span key={idx}>{tag}</span>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div className="secure-badge">
                <Shield size={12} />
                <span>SSL Encryption Enabled</span>
              </div>
              {setActiveTab && (
                <div 
                  className="secure-badge" 
                  style={{ 
                    cursor: "pointer", 
                    color: "var(--neon-purple)", 
                    borderColor: "rgba(139, 92, 246, 0.3)",
                    background: "rgba(139, 92, 246, 0.05)",
                    transition: "all 0.2s ease"
                  }}
                  onClick={() => setActiveTab("admin")}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(139, 92, 246, 0.15)";
                    e.currentTarget.style.color = "var(--neon-pink)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(139, 92, 246, 0.05)";
                    e.currentTarget.style.color = "var(--neon-purple)";
                  }}
                >
                  <Terminal size={12} />
                  <span>[ENTER_CONSOLE]</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
