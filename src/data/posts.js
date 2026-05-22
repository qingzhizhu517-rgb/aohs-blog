export const posts = [
  {
    id: "ai-agents-future",
    title: "探索 AI Agent 的下一阶段：从指令执行到自主协作",
    excerpt: "深入分析 AI Agent（智能体）的发展趋势，探讨多智能体协同（Multi-Agent System）在实际工程中的落地与挑战，以及未来人机交互的新范式。",
    category: "ai",
    tags: ["AI Agents", "LLMs", "多智能体", "未来科技"],
    date: "2026-05-22",
    readTime: "8 分钟",
    views: 1420,
    likes: 98,
    coverColor: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
    content: `
      <h2>前言：Agent 的崛起</h2>
      <p>在过去的两年里，大语言模型（LLM）改变了我们与计算设备的交互方式。但直接对话（Chat）只是开始，真正释放 LLM 潜力的方向是 <strong>AI Agent (智能体)</strong>。Agent 不仅仅能“回答问题”，它能使用工具、自主规划步骤、甚至进行自我反思与纠错。</p>
      
      <h2>1. 什么是真正的 AI Agent？</h2>
      <p>学术界和工业界普遍认为，一个完整的 Agent 通常由以下四个核心部分构成：</p>
      <ul>
        <li><strong>规划 (Planning)</strong>：将宏大任务拆解为可执行的子任务，并具备反思（Reflexion）和自我修正能力。</li>
        <li><strong>记忆 (Memory)</strong>：包括短期记忆（上下文中的 Chat History）和长期记忆（基于向量数据库 RAG 检索的知识库）。</li>
        <li><strong>工具使用 (Tools)</strong>：调用 API、运行代码、浏览网页等感知并影响外部世界的能力。</li>
        <li><strong>执行 (Action)</strong>：具体的任务输出与行为。</li>
      </ul>
      
      <h2>2. 多智能体协作 (Multi-Agent System)</h2>
      <p>当一个 Agent 无法应付复杂工作时，“让一群专业 Agent 协作”就成了自然选择。类似于一家公司，我们有产品经理 Agent、架构师 Agent、前端 Agent、后端 Agent 和测试 Agent。它们通过结构化的通讯协议（如 JSON）互相交流，分工协作。</p>
      <pre><code>// 模拟多智能体信息传递
const message = {
  sender: "ArchitectAgent",
  receiver: "CoderAgent",
  action: "implement_api",
  payload: {
    endpoint: "/api/v1/generate-code",
    method: "POST",
    params: { prompt: "string" }
  }
};</code></pre>
      
      <h2>3. 落地挑战：幻觉与死锁</h2>
      <p>在多智能体系统中，挑战往往在于：</p>
      <ol>
        <li><strong>幻觉累积</strong>：上游 Agent 产生的一个小错误，会在下游被不断放大，最终导致系统彻底跑偏。</li>
        <li><strong>通讯死锁</strong>：两个 Agent 在循环等待对方的输入，导致整个任务卡死。</li>
        <li><strong>高昂的 Token 成本</strong>：多次迭代反思会消耗大量的 Token。</li>
      </ol>
      
      <h2>4. 展望未来</h2>
      <p>未来的工作方式将是“1个核心开发者 + N个协同 Agent”。人不再需要写大量的样板代码，而是扮演**系统架构师、逻辑裁判和创意导演**的角色。这个博客网站本身，就是我与 AI 智能体深度协同开发的结晶。</p>
    `
  },
  {
    id: "fullstack-vite-react-aesthetic",
    title: "构建极致视觉体验的 React 应用：CSS 动效与性能优化",
    excerpt: "分享如何使用原生 CSS、Canvas 粒子以及 CSS 变量（Variables）构建具有未来感、赛博朋克风格的玻璃拟态（Glassmorphism）响应式前端界面。",
    category: "fullstack",
    tags: ["React", "Vite", "CSS Variables", "Glassmorphism", "动效"],
    date: "2026-05-18",
    readTime: "6 分钟",
    views: 980,
    likes: 74,
    coverColor: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
    content: `
      <h2>视觉至上：为什么我们需要高级感？</h2>
      <p>一个网站的交互细节决定了它的上限。在信息爆炸的时代，独特的视觉风格（如赛博朋克、霓虹光感、玻璃拟态）能瞬间抓住用户的眼球。但是，华丽的动效不能以牺牲性能为代价。</p>
      
      <h2>1. 玻璃拟态 (Glassmorphism) 的核心公式</h2>
      <p>要做出精致的磨砂玻璃质感，不能单单设置 <code>background: rgba(...)</code>。你必须融合背景模糊、微弱的边缘白边（描边）以及柔和的阴影：</p>
      <pre><code>.glass-panel {
  background: rgba(15, 15, 25, 0.6);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}</code></pre>
      
      <h2>2. 利用 CSS 变量动态切换主题色</h2>
      <p>通过操作根节点的 CSS 变量，我们可以实现丝滑的主题过渡或呼吸霓虹灯光效果：</p>
      <pre><code>:root {
  --neon-cyan: #06b6d4;
  --neon-purple: #8b5cf6;
}

.glowing-text {
  text-shadow: 0 0 10px var(--neon-cyan), 0 0 20px var(--neon-purple);
  animation: breathe 3s infinite alternate;
}

@keyframes breathe {
  0% { opacity: 0.8; }
  100% { opacity: 1; text-shadow: 0 0 15px var(--neon-cyan), 0 0 30px var(--neon-purple); }
}</code></pre>
      
      <h2>3. 渲染性能：Canvas 粒子的优化</h2>
      <p>背景粒子网格（Particle Network）是赛博朋克风格的常客。如果在 DOM 中渲染数百个 <code>div</code> 会导致严重的丢帧。使用 <strong>HTML5 Canvas</strong> 是绝对的性能首选。通过 <code>requestAnimationFrame</code> 并在每一帧中仅绘制可见节点，可以轻松跑满 60fps 甚至是 120fps。</p>
      
      <h2>总结</h2>
      <p>结合 React 的状态管理与 CSS 变量的灵活性，能够让我们在保持代码清晰的同时，交付视觉体验炸裂的现代 Web 应用。</p>
    `
  },
  {
    id: "thoughts-creative-developer",
    title: "一个独立创意开发者的自白：在技术与艺术的边界行走",
    excerpt: "记录从大厂螺丝钉走向独立开发者（Creative Developer）的思考，关于如何平衡工程思维与美学创意，以及如何在碎片化的时代保持专注。",
    category: "thoughts",
    tags: ["独立开发", "设计美学", "心路历程", "创意设计"],
    date: "2026-05-10",
    readTime: "5 分钟",
    views: 820,
    likes: 65,
    coverColor: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
    content: `
      <h2>什么是 Creative Developer？</h2>
      <p>在传统的软件工程中，设计师和工程师往往界限分明——设计师提供 Figma 稿，工程师将其翻译成代码。然而，<strong>Creative Developer（创意开发者）</strong>打碎了这道墙。我们既关心代码的架构与算法复杂度，也狂热地追求像素级的排版、颜色渐变和交互节奏。</p>
      
      <h2>技术是画笔，创意是灵魂</h2>
      <p>对于创意开发者而言，浏览器就是画布，JavaScript/CSS 则是画笔。当我们把数学公式（如正弦波、贝塞尔曲线）应用到动效中，或者把物理引擎融入网页交互时，代码就脱离了冰冷的逻辑，变成了一种可以触摸的艺术形式。</p>
      
      <h2>如何逃离“工具同质化”的怪圈</h2>
      <p>在这个开源盛行的时代，人人都可以用相同的 UI 框架快速拼装出一个功能完备但平淡无奇的网站。但要想脱颖而出，必须做到：</p>
      <ul>
        <li><strong>深入底层</strong>：不满足于组件库，自己用 Canvas / SVG / CSS 绘制特色组件。</li>
        <li><strong>跨界学习</strong>：从海报设计、科幻电影（如《银翼杀手》）、游戏 UI 中寻找灵感。</li>
        <li><strong>打磨细节</strong>：一个好的点击反馈、一段流畅的转场动画，带来的愉悦感是难以估量的。</li>
      </ul>
      
      <h2>尾声</h2>
      <p>独立开发并不是一条轻松的路，它意味着你必须同时扮演开发、设计、产品和运营。但每当你将心中的奇思妙想转化为屏幕上跃动的代码，并被世界所看见时，那种创造的快乐无可比拟。</p>
    `
  }
];
