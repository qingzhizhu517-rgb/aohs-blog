import React, { useState } from "react";
import { photos } from "../data/photos";
import { X, Calendar, Camera, Eye, Heart } from "lucide-react";

export default function PhotoDiary() {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [likesMap, setLikesMap] = useState(() => {
    const map = {};
    photos.forEach(p => {
      const stored = localStorage.getItem(`photo-liked-${p.id}`);
      map[p.id] = stored === "true";
    });
    return map;
  });

  const toggleLike = (id, e) => {
    e.stopPropagation(); // prevent modal open
    setLikesMap(prev => {
      const isLiked = !prev[id];
      localStorage.setItem(`photo-liked-${id}`, isLiked ? "true" : "false");
      return { ...prev, [id]: isLiked };
    });
  };

  return (
    <div className="photo-diary-container">
      {/* Header */}
      <div className="section-header">
        <h2 className="glitch-title" data-text="VISUAL_GRID">
          VISUAL_GRID <span className="accent-cyan">/</span> 视觉随笔
        </h2>
        <p className="section-subtitle">
          用影像与简短的文字，记录研发之外的碎片日常与视觉探索。
        </p>
      </div>

      {/* Grid Layout */}
      <div className="photo-masonry-grid">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="photo-card-glass"
            onClick={() => setSelectedPhoto(photo)}
          >
            {/* Image Wrapper */}
            <div className="photo-img-wrapper">
              <img
                src={photo.imageUrl || photo.image}
                alt={photo.title}
                className="photo-img"
                loading="lazy"
              />
              <div className="photo-overlay">
                <span className="photo-date">
                  <Calendar size={12} />
                  {photo.date}
                </span>
                <span
                  className={`photo-heart-btn ${likesMap[photo.id] ? "active" : ""}`}
                  onClick={(e) => toggleLike(photo.id, e)}
                >
                  <Heart size={16} fill={likesMap[photo.id] ? "#ec4899" : "none"} />
                </span>
              </div>
            </div>

            {/* Photo Info */}
            <div className="photo-info-body">
              <h3 className="photo-card-title">{photo.title}</h3>
              <p className="photo-card-description">{photo.description}</p>
              
              <div className="photo-tags">
                {(photo.tags || []).map((tag, idx) => (
                  <span key={idx} className="photo-tag-pill">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {selectedPhoto && (
        <div className="lightbox-overlay" onClick={() => setSelectedPhoto(null)}>
          <div className="lightbox-content-glass" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              className="lightbox-close-btn"
              onClick={() => setSelectedPhoto(null)}
            >
              <X size={20} />
            </button>

            {/* Modal Body */}
            <div className="lightbox-grid">
              {/* Image Left */}
              <div className="lightbox-image-side">
                <img src={selectedPhoto.imageUrl || selectedPhoto.image} alt={selectedPhoto.title} />
              </div>

              {/* Text Right */}
              <div className="lightbox-text-side">
                <div className="lightbox-meta">
                  <span className="flex-align">
                    <Camera size={14} className="accent-pink" /> 影像捕获
                  </span>
                  <span className="lightbox-date">{selectedPhoto.date}</span>
                </div>

                <h2 className="lightbox-title">{selectedPhoto.title}</h2>
                
                <div className="cyber-divider" />
                
                <p className="lightbox-description">{selectedPhoto.description}</p>

                <div className="lightbox-tags">
                  {(selectedPhoto.tags || []).map((tag, idx) => (
                    <span key={idx} className="tag-pill">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Footer details */}
                <div className="lightbox-footer">
                  <span className="lightbox-category">分类: {(selectedPhoto.category || "").toUpperCase()}</span>
                  <button
                    className={`lightbox-like-action ${likesMap[selectedPhoto.id] ? "liked" : ""}`}
                    onClick={(e) => toggleLike(selectedPhoto.id, e)}
                  >
                    <Heart size={14} fill={likesMap[selectedPhoto.id] ? "#ec4899" : "none"} />
                    <span>{likesMap[selectedPhoto.id] ? "已收藏" : "加入收藏"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
