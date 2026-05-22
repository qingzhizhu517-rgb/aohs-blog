import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, ThumbsUp, Calendar, Clock, Eye, Send, Share2, CornerDownRight } from "lucide-react";

export default function PostDetail({ post, onBack }) {
  const [likes, setLikes] = useState(post.likes);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const detailContainerRef = useRef(null);

  // Initialize likes and comments from localStorage
  useEffect(() => {
    // Scroll to top when post changes
    window.scrollTo(0, 0);

    const likedKey = `blog-liked-${post.id}`;
    const likesKey = `blog-likes-${post.id}`;
    const commentsKey = `blog-comments-${post.id}`;

    // Liked status
    const storedLiked = localStorage.getItem(likedKey);
    if (storedLiked === "true") {
      setHasLiked(true);
    }

    // Likes count
    const storedLikes = localStorage.getItem(likesKey);
    if (storedLikes) {
      setLikes(parseInt(storedLikes, 10));
    } else {
      localStorage.setItem(likesKey, post.likes);
    }

    // Comments list
    const storedComments = localStorage.getItem(commentsKey);
    if (storedComments) {
      setComments(JSON.parse(storedComments));
    } else {
      const defaultComments = [
        {
          id: 1,
          author: "GeekRunner",
          text: "写的太透彻了，多智能体协同绝对是今年的大趋势！期待博主更新更多相关笔记。",
          date: "2026-05-22 18:24",
        },
        {
          id: 2,
          author: "FrontierDesigner",
          text: "玻璃拟态那一节公式很实用，正好打算重构自己的作品集，马住了！",
          date: "2026-05-20 10:15",
        },
      ];
      setComments(defaultComments);
      localStorage.setItem(commentsKey, JSON.stringify(defaultComments));
    }
  }, [post.id, post.likes]);

  // Track scrolling progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.pageYOffset / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle Like
  const handleLike = () => {
    const likedKey = `blog-liked-${post.id}`;
    const likesKey = `blog-likes-${post.id}`;
    let newLikesCount = likes;

    if (hasLiked) {
      newLikesCount = likes - 1;
      setHasLiked(false);
      localStorage.setItem(likedKey, "false");
    } else {
      newLikesCount = likes + 1;
      setHasLiked(true);
      localStorage.setItem(likedKey, "true");
    }

    setLikes(newLikesCount);
    localStorage.setItem(likesKey, newLikesCount);
  };

  // Add Comment
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentsKey = `blog-comments-${post.id}`;
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

    const newCommentObj = {
      id: Date.now(),
      author: "匿名探访者",
      text: newComment,
      date: formattedDate,
    };

    const updatedComments = [newCommentObj, ...comments];
    setComments(updatedComments);
    localStorage.setItem(commentsKey, JSON.stringify(updatedComments));
    setNewComment("");
  };

  // Share post handler (clipboard copy)
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("链接已复制到剪贴板！可以去分享啦。");
  };

  return (
    <article className="post-detail-container" ref={detailContainerRef}>
      {/* Scroll Progress Bar */}
      <div
        className="scroll-progress-bar"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Back Button */}
      <button className="back-btn-glass" onClick={onBack}>
        <ArrowLeft size={16} />
        返回列表
      </button>

      {/* Header Splash Area */}
      <header className="post-detail-header-card">
        <div
          className="header-card-bg"
          style={{ background: post.coverColor }}
        />
        <div className="header-card-glow-overlay" />

        <div className="header-card-contents">
          {/* Breadcrumbs */}
          <div className="post-breadcrumbs">
            <span>ARCHIVES</span> / <span>{post.category.toUpperCase()}</span>
          </div>

          <h1 className="post-title-glow">{post.title}</h1>

          {/* Info row */}
          <div className="post-detail-meta">
            <span className="detail-meta-item">
              <Calendar size={14} className="accent-cyan" />
              {post.date}
            </span>
            <span className="detail-meta-item">
              <Clock size={14} className="accent-purple" />
              {post.readTime}
            </span>
            <span className="detail-meta-item">
              <Eye size={14} className="accent-pink" />
              {post.views} 次浏览
            </span>
          </div>

          {/* Tags */}
          <div className="post-detail-tags">
            {post.tags.map((tag, idx) => (
              <span key={idx} className="tag-pill-glow">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Content and Sidebar Layout */}
      <div className="post-layout-grid">
        {/* Article Body */}
        <div className="post-content-glass">
          <div
            className="markdown-body-custom"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Divider line */}
          <div className="cyber-divider" />

          {/* Action Hub */}
          <div className="post-action-hub">
            <button
              className={`cyber-action-btn like-btn ${hasLiked ? "liked" : ""}`}
              onClick={handleLike}
            >
              <ThumbsUp size={16} />
              <span>{hasLiked ? "已赞" : "点赞"} ({likes})</span>
            </button>
            <button className="cyber-action-btn share-btn" onClick={handleShare}>
              <Share2 size={16} />
              <span>分享链接</span>
            </button>
          </div>
        </div>

        {/* Local Interactive Comments */}
        <div className="post-comments-glass">
          <h3 className="comments-section-title">
            <CornerDownRight size={16} className="accent-cyan" /> 互动留言板 ({comments.length})
          </h3>

          {/* Add Comment Form */}
          <form className="comment-form" onSubmit={handleAddComment}>
            <textarea
              className="comment-textarea"
              placeholder="在这里留下你的见解或反馈..."
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit" className="comment-submit-btn">
              发送弹幕 <Send size={12} />
            </button>
          </form>

          {/* Comments List */}
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-card">
                <div className="comment-header">
                  <span className="comment-author">{comment.author}</span>
                  <span className="comment-date">{comment.date}</span>
                </div>
                <p className="comment-text">{comment.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
