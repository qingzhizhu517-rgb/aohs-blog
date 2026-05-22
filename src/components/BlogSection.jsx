import React, { useState } from "react";
import { posts } from "../data/posts";
import { Search, Calendar, Clock, Eye, ThumbsUp, ChevronRight } from "lucide-react";

export default function BlogSection({ onPostSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "全部内容" },
    { id: "fullstack", label: "全栈开发" },
    { id: "ai", label: "AI 探索" },
    { id: "thoughts", label: "杂谈随笔" },
  ];

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="blog-section-container">
      {/* Blog Hero Heading */}
      <div className="section-header">
        <h2 className="glitch-title" data-text="CYBER_ARCHIVE">
          CYBER_ARCHIVE <span className="accent-pink">/</span> 博客存档
        </h2>
        <p className="section-subtitle">记录关于架构设计、人工智能涌现与个人成长的文字。</p>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="blog-controls-glass">
        {/* Search */}
        <div className="search-bar-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="cyber-input"
            placeholder="搜索文章标题、标签或概述..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="category-filters">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`filter-btn ${selectedCategory === cat.id ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Cards Grid */}
      {filteredPosts.length > 0 ? (
        <div className="blog-grid">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="blog-card-glass"
              onClick={() => onPostSelect(post)}
            >
              {/* Cover visual representation (Gradient) */}
              <div
                className="blog-card-cover"
                style={{ background: post.coverColor }}
              >
                <div className="cover-glow-overlay" />
                <span className="card-category-badge">{post.category.toUpperCase()}</span>
              </div>

              {/* Card content */}
              <div className="blog-card-body">
                <div className="card-meta">
                  <span className="meta-item">
                    <Calendar size={12} />
                    {post.date}
                  </span>
                  <span className="meta-item">
                    <Clock size={12} />
                    {post.readTime}
                  </span>
                </div>

                <h3 className="blog-card-title">{post.title}</h3>
                <p className="blog-card-excerpt">{post.excerpt}</p>

                {/* Tags */}
                <div className="blog-card-tags">
                  {post.tags.map((tag, idx) => (
                    <span key={idx} className="tag-pill">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Card footer details */}
                <div className="blog-card-footer">
                  <div className="card-stats">
                    <span className="stat-span">
                      <Eye size={12} />
                      {post.views}
                    </span>
                    <span className="stat-span">
                      <ThumbsUp size={12} />
                      {post.likes}
                    </span>
                  </div>
                  <span className="read-more-btn">
                    阅读全文 <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-results-glass">
          <p className="empty-title">&gt; NO_ARCHIVES_FOUND</p>
          <p className="empty-desc">没有找到匹配检索词或分类的文章，请换个关键词试试。</p>
        </div>
      )}
    </div>
  );
}
