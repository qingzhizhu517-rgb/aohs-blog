import React, { useEffect, useState } from "react";
import { ArrowRight, Terminal, BookOpen, Camera, Award } from "lucide-react";
import { posts } from "../data/posts";
import { photos } from "../data/photos";
import { projects } from "../data/projects";

export default function HeroSection({ setActiveTab }) {
  const [typedText, setTypedText] = useState("");
  const fullText = "构建可交互的数字化创意，分享全栈与 AI 笔记。";

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

  const stats = [
    { label: "项目研发", val: `${projects.length}+`, icon: <Terminal className="text-cyan" />, tab: "projects" },
    { label: "技术文章", val: `${posts.length}+`, icon: <BookOpen className="text-purple" />, tab: "blog" },
    { label: "配图随笔", val: `${photos.length}+`, icon: <Camera className="text-pink" />, tab: "photos" },
  ];

  return (
    <section className="hero-section">
      <div className="hero-content">
        {/* Cyber Badges */}
        <div className="cyber-badge-container">
          <span className="cyber-pulse-badge">
            <span className="pulse-dot" />
            SYSTEM STABLE
          </span>
          <span className="cyber-version-badge">V1.2.0-PROD</span>
        </div>

        {/* Glitched Headline */}
        <h1 className="hero-title" data-text="Aohs.DEV">
          Aohs<span className="text-glow-purple">.</span>DEV
        </h1>

        <h2 className="hero-subtitle">
          个人创意开发者 <span className="neon-slash">/</span> AI 工作流探索者
        </h2>

        {/* Typing Intro text */}
        <p className="hero-typing-box">
          <span className="typing-prefix">&gt; </span>
          {typedText}
          <span className="typing-cursor">_</span>
        </p>

        {/* Action Buttons */}
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

        {/* Quick Stats Grid */}
        <div className="hero-stats-grid">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="stat-card"
              onClick={() => setActiveTab(stat.tab)}
            >
              <div className="stat-icon-wrapper">{stat.icon}</div>
              <div className="stat-value">{stat.val}</div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-card-glow" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
