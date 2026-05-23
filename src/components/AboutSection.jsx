import React from "react";
import { User, Briefcase, GraduationCap, Mail, Globe, Sparkles, Cpu, Layout, BrainCircuit, Lightbulb, Compass, Award } from "lucide-react";

export default function AboutSection() {
  const skills = [
    { name: "Java / Spring Boot / Redis (后端架构)", percent: 90, color: "#3b82f6" },
    { name: "Vue 3 / Vite / Pinia (现代前端)", percent: 92, color: "#06b6d4" },
    { name: "HarmonyOS / ArkTS / 微信小程序", percent: 80, color: "#10b981" },
    { name: "AI Agent / Coze / Prompt (智能体开发)", percent: 85, color: "#8b5cf6" },
    { name: "UI/UX / 极简用户直觉设计", percent: 88, color: "#ec4899" },
  ];

  const timeline = [
    {
      year: "2025 - 至今",
      role: "独立创意开发",
      company: "Freelance",
      type: "work",
      desc: "聚焦于全栈开发、AI 提效工具研发，以及尝试将中国传统文化（如民俗历法、非遗文化）与现代数字化 UI/UX 深度结合的跨界产品孵化。",
    },
    {
      year: "2023 - 2025",
      role: "高级全栈工程师",
      company: "智能工作流研发中心",
      type: "work",
      desc: "负责企业级大模型工作流（LLM Workflow）及智能体平台的设计与落地，积累了基于 Coze、FastGPT 等框架定制智能助手的深度实战经验。",
    },
    {
      year: "2021 - 2023",
      role: "前端研发主管",
      company: "科技大厂",
      type: "work",
      desc: "主导核心业务系统向 Vue 3 + Vite 架构的升级，主攻多端自适应适配与极速页面加载性能优化。",
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
          在后端架构、跨平台交互与 AI 智能体之间构建高效的创意闭环。
        </p>
      </div>

      <div className="about-grid">
        {/* Profile Avatar Card */}
        <div className="about-card-glass profile-info-card">
          <div className="avatar-glow-wrapper">
            <div className="avatar-frame">
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
          <p className="profile-tagline">个人创意开发者 / 极致清晰度追求者</p>

          <div className="profile-bio-text">
            <p>
              坚信<strong>“工欲善其事，必先利其器”</strong>。在不断的项目迭代中，我构建了一套属于自己的高效开发与探索闭环。
            </p>
            <p>
              作为 AI 全力驱动时代的践行者，我深入探索大语言模型（LLM）与实际工作流的结合，追求极简主义（Minimalism）与用户直觉设计，拒绝冗余，让界面回归内容本身。
            </p>
          </div>

          <div className="profile-contact-list">
            <div className="contact-item">
              <Mail size={16} className="accent-cyan" />
              <span>contact@aohs.dev</span>
            </div>
            <div className="contact-item">
              <Globe size={16} className="accent-purple" />
              <span>https://github.com/Aohs</span>
            </div>
          </div>
        </div>

        {/* Skill Matrix */}
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

      {/* Tech Toolbox Details */}
      <h3 className="section-divider-title">
        <Cpu size={16} /> 我的技术栈与工具箱
      </h3>
      <div className="tech-toolbox-grid">
        {/* Backend */}
        <div className="toolbox-card-glass">
          <div className="toolbox-header text-blue">
            <Cpu size={18} />
            <h4>后端架构 & 核心技术</h4>
          </div>
          <ul className="toolbox-list">
            <li><strong>核心语言：</strong> 扎实的 Java 生态开发能力。</li>
            <li><strong>主流框架：</strong> 熟练运用 Spring Boot 快速构建稳定、高并发的后端服务。</li>
            <li><strong>持久层 & 缓存：</strong> 擅长使用 MyBatis-Plus 进行高效的数据持久化操作，并利用 Redis 优化系统性能与缓存策略。</li>
            <li><strong>数据库设计：</strong> 具备良好的关系型数据库设计思维，善于编写清晰、高效的 SQL 脚本。</li>
          </ul>
        </div>

        {/* Frontend */}
        <div className="toolbox-card-glass">
          <div className="toolbox-header text-cyan">
            <Layout size={18} />
            <h4>前端交互 & 跨平台开发</h4>
          </div>
          <ul className="toolbox-list">
            <li><strong>现代 Web 前端：</strong> 采用 Vue 3 + Vite + Pinia 生态，追求组件化开发与极致的页面加载速度。</li>
            <li><strong>全场景/跨平台：</strong> 积极拥抱新生态，探索 HarmonyOS（ArkTS） 应用开发、微信小程序等全场景轻量化应用的落地。</li>
            <li><strong>设计理念：</strong> 崇尚极简主义（Minimalism）与用户直觉设计，拒绝冗余，让界面回归内容本身。</li>
          </ul>
        </div>

        {/* AI Workflows */}
        <div className="toolbox-card-glass">
          <div className="toolbox-header text-purple">
            <BrainCircuit size={18} />
            <h4>AI 工作流 & 智能体 (Agent) 探索</h4>
          </div>
          <ul className="toolbox-list text-left" style={{ margin: 0, padding: 0 }}>
            <p className="toolbox-intro-text" style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: "8px", borderBottom: "1px dashed rgba(255,255,255,0.1)", paddingBottom: "6px" }}>
              作为 AI 全力驱动时代的践行者，我深入探索 LLM（大语言模型）与实际工作流的结合：
            </p>
            <li style={{ listStyle: "none", marginBottom: "8px" }}><strong>AI 辅助编程：</strong> 熟练使用 Claude Code 等前沿 AI 编码工具，探索“人机协同”的高效开发新范式。</li>
            <li style={{ listStyle: "none", marginBottom: "8px" }}><strong>Agent 平台搭建：</strong> 基于 Coze（扣子）、FastGPT、OpenClaw 等国内外主流 Agent 框架，定制开发面向特定场景的智能助手与自动化工作流。</li>
            <li style={{ listStyle: "none", marginBottom: "8px" }}><strong>提示词工程：</strong> 精通 Prompt Engineering，擅长通过结构化提示词为 AI 设定精准的行为边界与专业技能。</li>
          </ul>
        </div>
      </div>

      {/* Content Directions & Philosophy */}
      <div className="about-grid" style={{ marginTop: "28px" }}>
        {/* Explorations */}
        <div className="about-card-glass">
          <h3 className="card-title flex-align text-cyan" style={{ marginBottom: "20px" }}>
            <Compass size={16} /> 我的探索方向 & 博客内容
          </h3>
          <p className="toolbox-intro-text" style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: "12px" }}>
            在这个博客里，我将毫无保留地分享我在技术和创意路上的所有踩坑记录与思考。你将会看到：
          </p>
          <ul className="details-bullet-list">
            <li>
              <strong>AI 驱动的工作流变革：</strong> 如何利用 AI Agent 重新定义软件开发、内容创作和日常办公，实现真正的“一人顶百人”。
            </li>
            <li>
              <strong>全栈开发实战笔记：</strong> 记录从 $0$ 到 $1$ 沉淀的项目经验，包括 Spring Boot + Vue 3 的前后端全栈打通、多端适配、性能优化等硬核技术文。
            </li>
            <li>
              <strong>独立变现与产品思考：</strong> 记录独立开发过程中的产品逻辑、UI/UX 设计心得，以及关于传统文化（如民俗历法、非遗文化）与现代数字产品结合的跨界尝试。
            </li>
            <li>
              <strong>极客工具箱：</strong> 各种能够提升效率的开源工具、AI 插件的评测与配置指南。
            </li>
          </ul>
        </div>

        {/* Philosophy */}
        <div className="about-card-glass">
          <h3 className="card-title flex-align text-purple" style={{ marginBottom: "20px" }}>
            <Lightbulb size={16} /> 个人特质与开发哲学
          </h3>
          <p className="philosophy-quote" style={{ fontStyle: "italic", borderLeft: "2px solid var(--neon-purple)", paddingLeft: "8px", marginBottom: "12px" }}>“Keep it simple, keep it smart.”</p>
          <ul className="details-bullet-list">
            <li>
              <strong>拒绝上下文过载：</strong> 在开发和协作中，我是一个极致的“清晰度追求者”。我倾向于清晰、模块化的代码组织结构，甚至在与 AI 交互时都有严格的规则，拒绝冗余信息，直击问题核心。
            </li>
            <li>
              <strong>传统与现代的碰撞：</strong> 我对传统文化（如传统节日、历法、地域文化符号）抱有浓厚兴趣，并热衷于用现代化的 UI 视觉和 AI 技术去翻新这些传统元素，让古老文化在数字世界里焕发新生。
            </li>
            <li>
              <strong>实用主义至上：</strong> 所有的技术和 AI 工具，最终都要落脚于“解决具体问题”。不盲目跟风新技术，只选择最合适的工具去创造价值。
            </li>
          </ul>
        </div>
      </div>

      {/* Experience Timeline */}
      <h3 className="section-divider-title" style={{ marginTop: "36px" }}>
        <Briefcase size={16} /> 编年史 (Timeline Node)
      </h3>

      <div className="timeline-container-glass">
        {timeline.map((item, idx) => (
          <div key={idx} className="timeline-node">
            <div className="timeline-node-dot-wrapper">
              <div className={`timeline-dot ${item.type === "work" ? "dot-work" : "dot-edu"}`}>
                <Briefcase size={12} />
              </div>
              <div className="timeline-line" />
            </div>

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
