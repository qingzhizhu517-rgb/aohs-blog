import React, { useState } from "react";
import InteractiveBackground from "./components/InteractiveBackground";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import BlogSection from "./components/BlogSection";
import PostDetail from "./components/PostDetail";
import PhotoDiary from "./components/PhotoDiary";
import ProjectsSection from "./components/ProjectsSection";
import AboutSection from "./components/AboutSection";
import AIAgent from "./components/AIAgent";
import AdminPanel from "./components/AdminPanel";
import Footer from "./components/Footer";

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedPost, setSelectedPost] = useState(null);

  // Tab change wrapper to clear article details view
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSelectedPost(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Select blog post to read
  const handlePostSelect = (post) => {
    setSelectedPost(post);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Render view depending on navigation state
  const renderContent = () => {
    if (selectedPost) {
      return (
        <PostDetail
          post={selectedPost}
          onBack={() => setSelectedPost(null)}
        />
      );
    }

    switch (activeTab) {
      case "home":
        return <HeroSection setActiveTab={handleTabChange} onPostSelect={handlePostSelect} />;
      case "blog":
        return <BlogSection onPostSelect={handlePostSelect} />;
      case "photos":
        return <PhotoDiary />;
      case "projects":
        return <ProjectsSection />;
      case "about":
        return <AboutSection />;
      case "agent":
        return <AIAgent setActiveTab={handleTabChange} onPostSelect={handlePostSelect} />;
      case "admin":
        return <AdminPanel setActiveTab={handleTabChange} />;
      default:
        return <HeroSection setActiveTab={handleTabChange} onPostSelect={handlePostSelect} />;
    }
  };

  return (
    <>
      {/* 3D Canvas Interactive Cyber Background */}
      <InteractiveBackground />

      {/* Floating Glassmorphic Top Nav Bar */}
      <Navbar activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Main Core View Area with smooth enter animations */}
      <main className="main-content-wrapper">
        <div key={selectedPost ? selectedPost.id : activeTab} className="fade-in-view">
          {renderContent()}
        </div>
      </main>

      {/* Footer System Panel */}
      <Footer setActiveTab={handleTabChange} />
    </>
  );
}

export default App;
