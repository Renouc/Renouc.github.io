# 💫 从中间爆开的下划线动画

在网页的 Tabs 或导航栏中，我们常常会给当前选中项加一个下划线动画。

很多实现都是“从左往右滑动”，但如果你想让它 从中间扩散开来，就更酷了。

今天我们用来实现这个“点击后下划线从中间向两边扩散”的效果，让你的导航更有动感 ✨

## 🧩 HTML 结构

```html
<div class="tabs" id="tabs">
  <div class="tab active">首页</div>
  <div class="tab">特性</div>
  <div class="tab">价格</div>
  <div class="tab">关于我们</div>
</div>
```

- tabs：容器，用 flex 排列 Tab；

- tab：单个 Tab 元素，点击时会加上 .active。

## 💅 CSS 实现思路

我们用 伪元素 `::after` 来画下划线，不需要额外 DOM：

```css
body {
  background: #0f172a;
  color: #e2e8f0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  font-family: system-ui, sans-serif;
}

.tabs {
  display: flex;
  gap: 24px;
  position: relative;
}

.tab {
  position: relative;
  cursor: pointer;
  font-size: 18px;
  padding: 8px 0;
  color: #94a3b8;
  transition: color 0.3s ease;
}

.tab.active {
  color: #fff;
}

/* 下划线动画元素 */
.tab::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(to right, #60a5fa, #a855f7);
  border-radius: 2px;
  transform: translateX(-50%) scaleX(0);
  transform-origin: center;
}

.tab.active::after {
  animation: expand 0.5s ease forwards;
}

@keyframes expand {
  0% {
    transform: translateX(-50%) scaleX(0);
  }
  100% {
    transform: translateX(-50%) scaleX(1);
  }
}
```

## 🚀 JS 实现点击切换

```js
const tabs = document.querySelectorAll('.tab');
tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
  });
});
```

## 🔑 核心知识点

1. `scaleX(0 → 1)`

   下划线从“看不见”缩放到完整长度，实现扩散效果。

2. `transform-origin: center`

   动画从中点开始，如果是默认 left，就会从左向右扩散，效果不对称。

3. `left: 50% + translateX(-50%)`

   即使伪元素的宽度发生变化，伪元素宽度的中点始终对齐父元素宽度的中点。
