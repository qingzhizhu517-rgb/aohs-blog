import React from "react";
import { User, Calendar, Briefcase, GraduationCap, Mail, Globe, Sparkles } from "lucide-react";

export default function AboutSection() {
  const skills = [
    { name: "React / Vite / Frontend UI", percent: 92, color: "#06b6d4" },
    { name: "Node.js / Express / Backend API", percent: 85, color: "#3b82f6" },
    { name: "AI Workflows / LangChain / RAG", percent: 78, color: "#8b5cf6" },
    { name: "HTML5 Canvas / CSS Animation / UX", percent: 90, color: "#ec4899" },
    { name: "Python / Data Processing", percent: 70, color: "#a855f7" },
  ];

  const timeline = [
    {
      year: "2025 - 至今",
      role: "独立创意开发",
      company: "Freelance",
      type: "work",
      desc: "致力于全栈 Web 应用开发、AI 提效工具研发以及高品质、强交互性网站的定制。主张将艺术创意融入工程逻辑。",
    },
    {
      year: "2023 - 2025",
      role: "高级全栈工程师",
      company: "AI 科技创业公司",
      type: "work",
      desc: "负责企业级大模型工作流（LLM Workflow）平台的研发，利用 React 和 Python 搭建高效的多智能体运行环境，积累了丰富的 AI 落地经验。",
    },
    {
      year: "2021 - 2023",
      role: "前端研发主管",
      company: "互联网大厂",
      type: "work",
      desc: "主导核心业务系统前端架构升级，制定工程化规范；攻坚复杂数据可视化及 Canvas/WebGl 图形化渲染组件，提升交互性能与用户体验。",
    },
    {
      year: "2017 - 2021",
      role: "计算机科学与技术学士",
      company: "重点理工科大学",
      type: "edu",
      desc: "深入学习计算机网络、数据结构、操作系统等底层理论。校内黑客松比赛一等奖获得者。",
    },
  ];

  return (
    <div className="about-section-container">
      {/* Header */}
      <div className="section-header">
        <h2 className="glitch-title" data-text="IDENTITY_NODE">
          IDENTITY_NODE <span className="accent-pink">/</span> 关于我
        </h2>
        <p className="section-subtitle">
          在技术架构与美学创意的边界探索，做有灵魂的数字化产品。
        </p>
      </div>

      <div className="about-grid">
        {/* Left Side: Avatar Card & Personal Statement */}
        <div className="about-card-glass profile-info-card">
          <div className="avatar-glow-wrapper">
            <div className="avatar-frame">
              {/* Fallback SVG avatar with a cool cyber design */}
              <svg width="100" height="100" viewBox="0 0 100 100" className="avatar-svg">
                <circle cx="50" cy="50" r="45" fill="none" stroke="url(#neonGrad)" strokeWidth="3" />
                <path d="M50 25 C40 25, 35 35, 35 45 C35 55, 45 60, 50 60 C55 60, 65 55, 65 45 C65 35, 60 25, 50 25 Z" fill="#8b5cf6" />
                <path d="M25 80 C25 65, 35 68, 50 68 C65 68, 75 65, 75 80 C75 85, 25 85, 25 80 Z" fill="#06b6d4" />
                <defs>
                  <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="50%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="avatar-pulse-circle" />
          </div>

          <h3 className="profile-name">Aohs</h3>
          <p className="profile-tagline">全栈开发工程师 / 创意技术人</p>

          <div className="profile-bio-text">
            <p>
              你好！我是 Aohs。我将自己定义为一名<strong>创意开发者 (Creative Developer)</strong>。
            </p>
            <p>
              相比起单纯地编写“能跑起来的代码”，我更痴迷于构建具备丝滑动画、高保真视觉和深度交互的数字化世界。同时，我也深度关注 AI Agent、大语言模型工作流和 RAG 的落地。
            </p>
            <p>
              我相信好的软件不仅要逻辑严密，更要具备呼吸感与交互美学。
            </p>
          </div>

          <div className="profile-contact-list">
            <div className="contact-item">
              <Mail size={16} className="accent-cyan" />
              <span>contact@aohs.dev</span>
            </div>
            <div className="contact-item">
              <Globe size={16} className="accent-purple" />
              <span>https://aohs.dev</span>
            </div>
          </div>
        </div>

        {/* Right Side: Skill Dashboard */}
        <div className="about-card-glass skills-card">
          <h3 className="card-title flex-align">
            <Sparkles size={16} className="accent-pink" /> 核心技能矩阵 (Skill Matrix)
          </h3>
          <div className="skills-list">
            {skills.map((skill, idx) => (
              <div key={idx} className="skill-item">
                <div className="skill-info">
                  <span className="skill-name">{skill.name}</span>
                  <span className="skill-percent" style={{ color: skill.color }}>
                    {skill.percent}%
                  </span>
                </div>
                <div className="skill-progress-track">
                  <div
                    className="skill-progress-bar-fill"
                    style={{
                      width: `${skill.percent}%`,
                      backgroundColor: skill.color,
                      boxShadow: `0 0 10px ${skill.color}`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Experience Timeline */}
      <h3 className="section-divider-title">
        <Briefcase size={16} /> 编年史 (Timeline Node)
      </h3>

      <div className="timeline-container-glass">
        {timeline.map((item, idx) => (
          <div key={idx} className="timeline-node">
            {/* Timeline indicator node */}
            <div className="timeline-node-dot-wrapper">
              <div className={`timeline-dot ${item.type === "work" ? "dot-work" : "dot-edu"}`}>
                {item.type === "work" ? <Briefcase size={12} /> : <GraduationCap size={12} />}
              </div>
              <div className="timeline-line" />
            </div>

            {/* Content card */}
            <div className="timeline-node-card">
              <div className="node-card-header">
                <span className="node-year">{item.year}</span>
                <span className="node-role">
                  {item.role} <span className="node-company">@ {item.company}</span>
                </span>
              </div>
              <p className="node-desc">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
