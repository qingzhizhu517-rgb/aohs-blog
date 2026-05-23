export const posts = [
  {
    "id": "fullstack-vite-react-aesthetic",
    "title": "构建极致视觉体验的 React 应用：CSS 动效与性能优化",
    "excerpt": "分享如何使用原生 CSS、Canvas 粒子以及 CSS 变量（Variables）构建具有未来感、赛博朋克风格的玻璃拟态（Glassmorphism）响应式前端界面。",
    "category": "fullstack",
    "tags": [
      "React",
      "Vite",
      "CSS Variables",
      "Glassmorphism",
      "动效"
    ],
    "date": "2026-05-18",
    "readTime": "6 分钟",
    "views": 980,
    "likes": 74,
    "coverColor": "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
    "content": "\n      <h2>视觉至上：为什么我们需要高级感？</h2>\n      <p>一个网站的交互细节决定了它的上限。在信息爆炸的时代，独特的视觉风格（如赛博朋克、霓虹光感、玻璃拟态）能瞬间抓住用户的眼球。但是，华丽的动效不能以牺牲性能为代价。</p>\n      \n      <h2>1. 玻璃拟态 (Glassmorphism) 的核心公式</h2>\n      <p>要做出精致的磨砂玻璃质感，不能单单设置 <code>background: rgba(...)</code>。你必须融合背景模糊、微弱的边缘白边（描边）以及柔和的阴影：</p>\n      <pre><code>.glass-panel {\n  background: rgba(15, 15, 25, 0.6);\n  backdrop-filter: blur(16px);\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);\n}</code></pre>\n      \n      <h2>2. 利用 CSS 变量动态切换主题色</h2>\n      <p>通过操作根节点的 CSS 变量，我们可以实现丝滑的主题过渡或呼吸霓虹灯光效果：</p>\n      <pre><code>:root {\n  --neon-cyan: #06b6d4;\n  --neon-purple: #8b5cf6;\n}\n\n.glowing-text {\n  text-shadow: 0 0 10px var(--neon-cyan), 0 0 20px var(--neon-purple);\n  animation: breathe 3s infinite alternate;\n}\n\n@keyframes breathe {\n  0% { opacity: 0.8; }\n  100% { opacity: 1; text-shadow: 0 0 15px var(--neon-cyan), 0 0 30px var(--neon-purple); }\n}</code></pre>\n      \n      <h2>3. 渲染性能：Canvas 粒子的优化</h2>\n      <p>背景粒子网格（Particle Network）是赛博朋克风格的常客。如果在 DOM 中渲染数百个 <code>div</code> 会导致严重的丢帧。使用 <strong>HTML5 Canvas</strong> 是绝对的性能首选。通过 <code>requestAnimationFrame</code> 并在每一帧中仅绘制可见节点，可以轻松跑满 60fps 甚至是 120fps。</p>\n      \n      <h2>总结</h2>\n      <p>结合 React 的状态管理与 CSS 变量的灵活性，能够让我们在保持代码清晰的同时，交付视觉体验炸裂的现代 Web 应用。</p>\n    "
  },
  {
    "id": "thoughts-creative-developer",
    "title": "一个独立创意开发者的自白：在技术与艺术的边界行走",
    "excerpt": "记录从大厂螺丝钉走向独立开发者（Creative Developer）的思考，关于如何平衡工程思维与美学创意，以及如何在碎片化的时代保持专注。",
    "category": "thoughts",
    "tags": [
      "独立开发",
      "设计美学",
      "心路历程",
      "创意设计"
    ],
    "date": "2026-05-10",
    "readTime": "5 分钟",
    "views": 820,
    "likes": 65,
    "coverColor": "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
    "content": "\n      <h2>什么是 Creative Developer？</h2>\n      <p>在传统的软件工程中，设计师和工程师往往界限分明——设计师提供 Figma 稿，工程师将其翻译成代码。然而，<strong>Creative Developer（创意开发者）</strong>打碎了这道墙。我们既关心代码的架构与算法复杂度，也狂热地追求像素级的排版、颜色渐变和交互节奏。</p>\n      \n      <h2>技术是画笔，创意是灵魂</h2>\n      <p>对于创意开发者而言，浏览器就是画布，JavaScript/CSS 则是画笔。当我们把数学公式（如正弦波、贝塞尔曲线）应用到动效中，或者把物理引擎融入网页交互时，代码就脱离了冰冷的逻辑，变成了一种可以触摸的艺术形式。</p>\n      \n      <h2>如何逃离“工具同质化”的怪圈</h2>\n      <p>在这个开源盛行的时代，人人都可以用相同的 UI 框架快速拼装出一个功能完备但平淡无奇的网站。但要想脱颖而出，必须做到：</p>\n      <ul>\n        <li><strong>深入底层</strong>：不满足于组件库，自己用 Canvas / SVG / CSS 绘制特色组件。</li>\n        <li><strong>跨界学习</strong>：从海报设计、科幻电影（如《银翼杀手》）、游戏 UI 中寻找灵感。</li>\n        <li><strong>打磨细节</strong>：一个好的点击反馈、一段流畅的转场动画，带来的愉悦感是难以估量的。</li>\n      </ul>\n      \n      <h2>尾声</h2>\n      <p>独立开发并不是一条轻松的路，它意味着你必须同时扮演开发、设计、产品和运营。但每当你将心中的奇思妙想转化为屏幕上跃动的代码，并被世界所看见时，那种创造的快乐无可比拟。</p>\n    "
  }
];
