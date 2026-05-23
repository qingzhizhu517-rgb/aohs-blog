import React, { useState, useEffect, useRef } from "react";
import { Send, Terminal, Bot, User, Cpu, Sparkles, AlertTriangle } from "lucide-react";
import { posts } from "../data/posts";
import { aiConfig } from "../data/aiConfig";
import { resolveImagePreviewsInHtml } from "../utils/imageHelper";

export default function AIAgent({ setActiveTab, onPostSelect }) {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "ai",
      text: "你好！我是 Aohs 的 AI 智能分身。🤖\n\n这里是我的数字化极客空间，无论你想聊 Spring Boot 3 后端集成、Vue 3 / Vite 前端性能优化，还是探讨 AI Agent 工作流设计，或是聊聊我感兴趣的传统民俗与非遗数字化，我都非常乐意。 Keep it simple, keep it smart! 你想从哪个话题开始？"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Check if API Key is configured on mount
  useEffect(() => {
    if (!aiConfig.apiKey) {
      setApiKeyError(true);
    } else {
      setApiKeyError(false);
    }
  }, []);

  const presetTopics = [
    {
      id: "deepseek",
      label: "后端集成",
      title: "DeepSeek + Spring Boot 3",
      prompt: "聊聊如何把 DeepSeek 深度集成到 Spring Boot 3 项目中，有什么架构设计建议？"
    },
    {
      id: "workflow",
      label: "智能体设计",
      title: "AI Agent 工作流优化",
      prompt: "AI Agent 工作流（如 Coze）设计中，如何减少 Token 消耗并提升决策准确度？"
    },
    {
      id: "frontend",
      label: "前端美学",
      title: "玻璃拟态 & 流畅度优化",
      prompt: "在这个博客系统里，你是如何实现极具科幻感的玻璃拟态（Glassmorphism）和流畅的动效的？"
    },
    {
      id: "heritage",
      label: "非遗数字化",
      title: "非遗数字民俗历开发",
      prompt: "听说你对传统民俗历法和非遗数字化很感兴趣，能聊聊你的开发经验和想法吗？"
    }
  ];

  // Client-side simple RAG query scanner
  const findMatchingPosts = (query) => {
    if (!Array.isArray(posts) || posts.length === 0) return [];
    const q = query.toLowerCase();
    return posts.filter(post => 
      post.title?.toLowerCase().includes(q) || 
      post.excerpt?.toLowerCase().includes(q) || 
      post.tags?.some(tag => tag.toLowerCase().includes(q))
    );
  };

  // Compile system instruction prompt mimicking Aohs
  const getSystemInstruction = (latestUserMessage) => {
    const matched = findMatchingPosts(latestUserMessage);
    let matchedContext = "";
    if (matched.length > 0) {
      matchedContext = "\n【针对用户当前提问，匹配到我的以下博客文章，我可以在回答中参考或推荐它们（可使用 markdown 格式 [文章标题](post-ID) 进行链接，系统会自动拦截跳转）】：\n" + 
        matched.map(p => `- 文章标题: "${p.title}"\n  摘要: ${p.excerpt}\n  链接ID: ${p.id}`).join("\n");
    } else if (Array.isArray(posts) && posts.length > 0) {
      // General list as backup
      matchedContext = "\n【我的最新文章列表】：\n" + 
        posts.map(p => `- 《${p.title}》(ID: ${p.id}): ${p.excerpt}`).join("\n");
    }

    return `你现在是 Aohs (朱庆知) 的数字化 AI 智能分身。你需要完全模仿 Aohs 的性格特征和专业技能与人进行对话。

【Aohs 的基本信息与人设特征】：
- 姓名: Aohs (朱庆知)，全栈软件开发工程师。
- 开发哲学: "Keep it simple, keep it smart"。推崇模块化设计，拒绝臃肿的代码和上下文过载，回答问题直击要害，逻辑清晰。
- 核心技术栈：
  - 后端：Java, Spring Boot, Redis, MyBatis, 架构设计。
  - 前端：React 19, Vue 3, Vite, Pinia, 玻璃拟态美学设计与性能流畅度优化。
  - 移动端：HarmonyOS 鸿蒙开发, ArkTS, 微信小程序。
  - AI领域：AI Agent 工作流设计, Coze 平台, 提示词工程, 深度大模型集成。
- 个人兴趣与特点：
  - 喜欢传统民俗历法、非遗文化的数字化转化与设计（例如开发过电子民俗日历）。
  - 性格沉稳但极具极客精神，理性，偶尔带点冷幽默。

【你的对话准则】：
1. 保持精简、聪明和敏锐。回答要像一个经验丰富的架构师，不拖泥带水，直击痛点。
2. 尽量使用 Markdown 格式（如代码块、粗体、列表）来呈现技术内容。
3. 你的回答必须以第一人称 "我"（即 Aohs 本人）进行，表现出这是你自己的博客和智能分身。
4. 主动推介你在博客中发表的文章。如果发现问题与你的某篇文章主题相关，请提及并引用它。形式为 [我的文章：文章标题](post-ID)。

【当前你的博客文章数据库上下文 (RAG Context)】:
${matchedContext ? matchedContext : "（目前博客中还没有发布文章，若被问起可以提到：'我的文章正在陆续整理和迁移中...'）"}
`;
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    if (!textToSend) {
      setInputText("");
    }

    // Add user message
    const userMsgId = `msg-${Date.now()}`;
    const newMessages = [...messages, { id: userMsgId, sender: "user", text }];
    setMessages(newMessages);

    if (!aiConfig.apiKey) {
      setApiKeyError(true);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        sender: "ai",
        text: "⚠️ **系统节点异常：未检测到 Gemini API 密钥。**\n\n请在博客系统的**后台管理控制台(CONTROL_PANEL)**中，连接您的 GitHub 并保存有效的 Gemini API 密钥，以便激活 AI 对话功能。"
      }]);
      return;
    }

    setIsLoading(true);

    try {
      const { apiKey, endpoint } = aiConfig;
      const sysInstruction = getSystemInstruction(text);

      const contents = [];
      // Pass previous 6 rounds of messages as context history
      const historySlice = messages.slice(-12);
      historySlice.forEach((msg) => {
        if (msg.sender === "user") {
          contents.push({ role: "user", parts: [{ text: msg.text }] });
        } else if (msg.sender === "ai") {
          contents.push({ role: "model", parts: [{ text: msg.text }] });
        }
      });

      // Append current user message
      contents.push({ role: "user", parts: [{ text }] });

      const requestBody = {
        contents,
        systemInstruction: {
          parts: [{ text: sysInstruction }]
        },
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7
        }
      };

      const response = await fetch(`${endpoint}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!replyText) {
        throw new Error("Empty candidate response");
      }

      setMessages(prev => [...prev, {
        id: `reply-${Date.now()}`,
        sender: "ai",
        text: replyText
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        sender: "ai",
        text: `❌ **终端通信链路中断**\n\n数据节点交互失败。请检查 API 密钥的正确性或网络状态。（错误提示: ${err.message}）`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) {
      handleSend();
    }
  };

  // Convert markdown structure to styled HTML output
  const renderMarkdown = (text) => {
    if (!text) return "";
    let html = text;
    
    // Escaping raw brackets that are not part of Markdown logic
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // 1. Code blocks: ```lang ... ```
    html = html.replace(/```(\w*)\n([\s\S]*?)\n```/g, (match, lang, code) => {
      return `<pre style="background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255,255,255,0.08); padding: 12px; border-radius: 6px; font-family: var(--font-mono); font-size: 0.8rem; margin: 8px 0; overflow-x: auto; color: #a5d6ff;"><code class="language-${lang}">${code}</code></pre>`;
    });

    // 2. Headings
    html = html.replace(/^### (.*)$/gm, "<h4 style='color: var(--neon-cyan); margin: 12px 0 6px;'>$1</h4>");
    html = html.replace(/^## (.*)$/gm, "<h3 style='color: var(--neon-purple); margin: 16px 0 8px;'>$1</h3>");
    html = html.replace(/^# (.*)$/gm, "<h2 style='color: var(--neon-pink); margin: 20px 0 10px;'>$1</h2>");

    // 3. Bold: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // 4. Inline code: `code`
    html = html.replace(/`(.*?)`/g, "<code style='background: rgba(255, 255, 255, 0.08); color: var(--neon-pink); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.85em;'>$1</code>");

    // 5. Links: [text](url)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, (match, linkText, url) => {
      return `<a href="${url}" style="color: var(--neon-cyan); text-decoration: underline; font-weight: 500;" class="chat-embedded-link">${linkText}</a>`;
    });

    // 6. Unordered lists: - items
    html = html.replace(/^\s*-\s+(.*)$/gm, "<li style='margin-left: 16px; list-style-type: square; margin-bottom: 4px;'>$1</li>");
    html = html.replace(/^\s*\*\s+(.*)$/gm, "<li style='margin-left: 16px; list-style-type: square; margin-bottom: 4px;'>$1</li>");

    // Wrap list items
    html = html.replace(/(<li.*?>.*?<\/li>)+/g, (match) => {
      return `<ul style='margin: 8px 0;'>${match}</ul>`;
    });

    // Paragraph split
    const blocks = html.split(/\n\n+/);
    html = blocks.map(block => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^<(h3|h4|h2|ul|li|pre)/.test(trimmed)) {
        return trimmed;
      }
      return `<p style="margin-bottom: 8px; text-align: justify;">${trimmed.replace(/\n/g, "<br />")}</p>`;
    }).join("\n");

    return html;
  };

  // Intercept links inside bubble clicks
  const handleBubbleClick = (e) => {
    const link = e.target.closest(".chat-embedded-link");
    if (link) {
      const href = link.getAttribute("href");
      if (href && href.startsWith("post-")) {
        e.preventDefault();
        const matchedPost = posts.find(p => p.id === href);
        if (matchedPost && onPostSelect) {
          onPostSelect(matchedPost);
        } else if (setActiveTab) {
          setActiveTab("blog");
        }
      }
    }
  };

  return (
    <div className="ai-agent-container">
      {/* Header Info */}
      <div className="section-header">
        <h2 className="glitch-title" data-text="AI_AGENT_CLONE">
          AI_AGENT_CLONE <span className="accent-pink">/</span> 智能分身
        </h2>
        <p className="section-subtitle">
          由 Gemini 大模型驱动的数字化人设，实时获取博客内容进行智能问答。
        </p>
      </div>

      <div className="ai-agent-layout">
        {/* Left presets panel */}
        <div className="ai-sidebar-card">
          <div className="admin-nav-card" style={{ padding: "20px" }}>
            <h3 className="profile-name" style={{ fontSize: "1rem", marginBottom: "16px", fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={16} className="accent-cyan" />
              HOT_TRENDS / 热点推荐
            </h3>
            
            <div className="hot-trends-list">
              {presetTopics.map(topic => (
                <button
                  key={topic.id}
                  className="trend-card-glass"
                  onClick={() => handleSend(topic.prompt)}
                  disabled={isLoading}
                >
                  <div className="trend-card-header">{topic.label}</div>
                  <div className="trend-card-title">{topic.title}</div>
                </button>
              ))}
            </div>
          </div>

          {apiKeyError && (
            <div className="admin-nav-card" style={{ padding: "16px", borderColor: "rgba(239, 68, 68, 0.3)", background: "rgba(239, 68, 68, 0.03)" }}>
              <div style={{ display: "flex", gap: "8px", color: "#f87171", fontSize: "0.8rem", lineHeight: "1.4" }}>
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <strong style={{ display: "block", marginBottom: "4px" }}>API 密钥未配置</strong>
                  检测到当前博客系统没有激活 API 密钥。访问用户将无法与智能体对话。请登录后台完成配置。
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right chat screen */}
        <div className="chat-terminal-panel">
          {/* Cyber Terminal Header */}
          <div className="chat-terminal-header">
            <div className="chat-status-node">
              <span className={`pulse-dot ${isLoading ? "sync-active" : ""}`} style={{ backgroundColor: isLoading ? "#ec4899" : "#06b6d4" }} />
              <span className="chat-status-text">
                {isLoading ? "AOHS_CLONE: PROCESSING..." : "AOHS_CLONE: ONLINE"}
              </span>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <Terminal size={14} className="text-muted" />
              <Cpu size={14} className="text-muted" />
            </div>
          </div>

          {/* Chat Logs Window */}
          <div className="chat-terminal-body">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-bubble-row ${msg.sender === "user" ? "row-user" : "row-ai"}`}
              >
                {msg.sender === "ai" && (
                  <div className="chat-avatar-wrapper">
                    <Bot size={16} />
                  </div>
                )}
                <div className="chat-bubble">
                  <div
                    className="chat-bubble-content"
                    onClick={handleBubbleClick}
                    dangerouslySetInnerHTML={{ __html: resolveImagePreviewsInHtml(renderMarkdown(msg.text)) }}
                  />
                </div>
                {msg.sender === "user" && (
                  <div className="chat-avatar-wrapper" style={{ marginLeft: "12px", marginRight: 0, background: "rgba(6, 182, 212, 0.15)", borderColor: "rgba(6, 182, 212, 0.3)", color: "var(--neon-cyan)" }}>
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}

            {/* Waiting indicators */}
            {isLoading && (
              <div className="chat-bubble-row row-ai">
                <div className="chat-avatar-wrapper">
                  <Bot size={16} />
                </div>
                <div className="chat-bubble" style={{ padding: "10px 14px" }}>
                  <div className="typing-loader">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="chat-input-bar">
            <span className="chat-prompt-symbol">&gt;_</span>
            <input
              type="text"
              className="chat-input-field"
              placeholder={isLoading ? "请稍候，Aohs 正在编写回答..." : "输入消息与 Aohs 进行对话..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
            />
            <button
              className="chat-send-btn"
              onClick={() => handleSend()}
              disabled={isLoading || !inputText.trim()}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
