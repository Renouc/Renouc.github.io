# 个人网站内容整改技术方案

## 目标

对当前 VitePress 个人网站的笔记内容进行精简、合并和清理，降低重复信息、空壳页面和冗长表达带来的维护成本。

本方案用于指导后续开发会话直接执行内容整改。

## 范围

本次只处理文章内容结构和文章取舍，包括：

- 删除没有独立价值的空壳正文页。
- 合并主题边界接近、拆分后阅读成本更高的短文。
- 精简主题有价值但表达冗余的长文。
- 同步更新侧边栏和必要索引页。
- 保留旧路径兼容页面，避免已有链接直接失效。

索引页只维护链接列表，不承载正文解释、背景说明、摘要或阅读顺序。

不处理以下内容：

- 不更换 VitePress 主题。
- 不调整站点视觉设计。
- 不新增搜索、标签、评论、RSS、统计等能力。
- 不重构构建流程或部署流程。
- 不主动提交或推送代码。

## 当前内容类型

当前页面需要分为三类处理，避免误删。

### 1. 兼容跳转页

这些页面已经不再承载正文，只负责旧路径跳转。

典型路径：

- `src/fragment/*`
- `src/ai/ai-agent.md`
- `src/ai/ollama.md`
- `src/blog-building.md`
- `src/devops/docker.md`

处理策略：

- 默认保留。
- 不纳入合并和精简对象。
- 不加入新侧边栏。

### 2. 空壳或弱内容页

这些页面信息量很少，不能独立支撑一篇文章。

优先处理对象：

| 路径 | 建议处理 |
| --- | --- |
| `src/frontend/react/base.md` | 删除正文入口；如需兼容旧路径，跳转到 React 相关主文章 |
| `src/frontend/react/fiber.md` | 合并到 React 渲染机制主题 |
| `src/frontend/next/render.md` | 合并到 Next.js 路由与渲染主题 |
| `src/backend/graphql/index.md` | 删除正文入口并跳转到 `/backend/`，或后续扩写后保留 |
| `src/devops/docker/index.md` | 删除正文入口并跳转到 `/devops/`，或后续扩写后保留 |
| `src/meta/site-building.md` | 保留为独立正文或删除，不并入 `src/meta/index.md` |

### 3. 冗长正文页

这些页面主题有价值，但需要压缩表达密度。

优先精简对象：

| 路径 | 精简方向 |
| --- | --- |
| `src/engineering/monorepo/index.md` | 去掉过度修饰，保留 pnpm workspace、依赖管理、命令、发布流程 |
| `src/principles/solid.md` | 每个原则统一为定义、反例、改法、检查点 |
| `src/frontend/practice/i18n.md` | 保留 React i18next 最小落地方案，删除重复 FAQ 和过长示例 |
| `src/ai/local-models/ollama.md` | 保留安装、运行、CLI、SDK、HTTP API，压缩重复配置说明 |
| `src/frontend/next/middleware.md` | 保留核心能力、matcher、Cookie/Header、重定向/重写、注意事项 |

## 整改判定规则

### 删除

满足以下条件之一可以删除正文页：

- 页面只有标题和一句话，且没有独立正文价值。
- 页面只有未完成占位内容。
- 页面内容已经完整并入新文章。

删除正文页时，如果该路径曾公开访问，必须保留兼容跳转页。

### 合并

满足以下条件之一应优先合并：

- 多篇文章描述同一技术链路的不同片段。
- 单篇文章过短，独立阅读价值不足。
- 读者实际需要连续阅读多篇才能形成完整理解。
- 侧边栏条目过细，增加检索成本。

合并后只保留一个主文章入口，其他旧路径改为兼容跳转。

### 精简

满足以下条件之一应精简：

- 示例数量过多，但没有覆盖新的关键边界。
- 解释中存在大量类比、情绪化修饰或重复总结。
- FAQ、最佳实践、总结段重复表达同一结论。
- 文章标题承诺的是实用笔记，但正文扩展成教程合集。

精简时保留可执行代码、关键概念、常见坑和结论。

### 保留

满足以下条件应保留为独立文章：

- 主题边界清晰。
- 能作为搜索入口独立命中。
- 与同目录其他文章不存在明显重复。
- 合并后会导致主文章过长或主题发散。

## 第一阶段：处理空壳和弱内容

目标是先减少低价值入口，改动风险最低。

### React

建议：

- 删除或合并 `src/frontend/react/base.md`。
- 将 `src/frontend/react/fiber.md` 并入 React 渲染机制主题。

候选目标文章：

- `src/frontend/react/virtual_dom.md`
- 后续新建 `src/frontend/react/rendering.md`

验收：

- React 侧边栏不再出现空壳文章。
- 旧路径如需保留，改为跳转页。

### Next.js

建议：

- 将 `src/frontend/next/render.md` 合并到 Next.js 路由与渲染主题。
- 暂时保留 `src/frontend/next/middleware.md` 为独立文章。

候选目标文章：

- `src/frontend/next/file-system.md`
- 后续新建 `src/frontend/next/routing-and-rendering.md`

验收：

- Next.js 侧边栏不再出现未完成页面。
- App Router、Pages Router、渲染模式的关系更清晰。

### Backend / DevOps

建议：

- `src/backend/graphql/index.md` 当前信息量不足，删除正文入口并跳转到 `/backend/`，或后续扩写后保留。
- `src/devops/docker/index.md` 当前信息量不足，删除正文入口并跳转到 `/devops/`，或后续扩写后保留。

验收：

- 不保留只有一句话的正文页。
- 如果保留旧路径，必须跳转到对应分类索引页。

## 第二阶段：主题合并

目标是减少碎片化文章，提高单篇文章完整度。

### Node.js 文件系统

合并对象：

- `src/backend/node/fs-exists.md`
- `src/backend/node/fs-rm.md`

建议目标：

- `src/backend/node/filesystem.md`

建议结构：

```md
# Node.js 文件系统常用操作

## 判断路径是否存在
## 删除文件和目录
## 推荐封装
## 常见错误
## 结论
```

旧路径：

- `/backend/node/fs-exists`
- `/backend/node/fs-rm`

合并后都跳转到 `/backend/node/filesystem`。

### Next.js 路由与渲染

合并对象：

- `src/frontend/next/file-system.md`
- `src/frontend/next/pages-router.md`
- `src/frontend/next/render.md`

建议目标：

- `src/frontend/next/routing-and-rendering.md`

保留独立：

- `src/frontend/next/middleware.md`

建议结构：

```md
# Next.js 路由与渲染

## App Router 文件约定
## Pages Router 动态路由
## 布局、模板和加载状态
## 错误页和 not-found
## 渲染模式
## 迁移时的判断标准
```

### Rollup 核心机制

合并对象：

- `src/frontend/engineering/rollup/type_hint.md`
- `src/frontend/engineering/rollup/module_resolve.md`
- `src/frontend/engineering/rollup/code_split.md`
- `src/frontend/engineering/rollup/tree_shaking.md`

建议目标：

- `src/frontend/engineering/rollup/index.md`

建议结构：

```md
# Rollup 核心机制

## 类型提示
## 模块解析
## Tree Shaking
## 代码分割
## 实践建议
```

### React 渲染机制

合并对象：

- `src/frontend/react/前端框架的理解.md`
- `src/frontend/react/virtual_dom.md`
- `src/frontend/react/fiber.md`
- `src/frontend/react/heap.md`

建议目标：

- `src/frontend/react/rendering.md`

建议结构：

```md
# React 渲染机制

## 前端框架解决的问题
## 虚拟 DOM
## Fiber
## 调度与优先级
## 最小堆在调度中的作用
## 总结
```

## 第三阶段：长文精简

目标是让文章更像个人技术笔记，而不是泛化教程。

### Monorepo

文件：

- `src/engineering/monorepo/index.md`

处理规则：

- 删除过度比喻和情绪化表达。
- 保留 pnpm workspace 的核心配置。
- 保留依赖安装、过滤执行、版本发布。
- 删除重复提示和弱价值 FAQ。

建议目标长度：

- 约 180 到 260 行。

### SOLID

文件：

- `src/principles/solid.md`

处理规则：

- 每个原则使用一致结构。
- 每个原则最多保留一个正例和一个反例。
- 删除重复的 React 场景描述。

建议结构：

```md
# SOLID 设计原则

## 单一职责原则
### 定义
### 反例
### 改法
### 检查点

## 开闭原则
...
```

建议目标长度：

- 约 250 到 350 行。

### React i18n

文件：

- `src/frontend/practice/i18n.md`

处理规则：

- 保留最小可落地配置。
- 保留资源文件组织、组件使用、语言切换。
- 删除过长案例、重复 FAQ 和泛泛总结。

建议目标长度：

- 约 220 到 320 行。

### Ollama

文件：

- `src/ai/local-models/ollama.md`

处理规则：

- 保留本地运行和集成最常用路径。
- SDK 与 HTTP API 保留最小示例。
- 配置项只保留常见项。

建议目标长度：

- 约 140 到 200 行。

## 侧边栏调整要求

每次合并或删除正文页后，必须同步更新对应侧边栏。

重点文件：

- `.vitepress/config/sidebar/frontend.ts`
- `.vitepress/config/sidebar/backend.ts`
- `.vitepress/config/sidebar/engineering.ts`
- `.vitepress/config/sidebar/devops.ts`
- `.vitepress/config/sidebar/principles.ts`
- `.vitepress/config/sidebar/ai.ts`

要求：

- 侧边栏不出现空壳正文页。
- 兼容跳转页不进入侧边栏。
- 合并后的主文章必须可从侧边栏访问。
- 侧边栏只列真实文章分组，不添加分类索引块。
- 分类首页通过顶部导航访问，不在侧边栏重复出现。

## 旧路径兼容要求

当正文页被删除、合并或移动时，旧路径必须保留跳转页面。

跳转页面模板：

```md
---
layout: doc
title: 页面已迁移
---

# 页面已迁移

本文已迁移到：[新页面标题](/new/path)

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  window.location.replace('/new/path')
})
</script>
```

注意：

- 兼容页面不写正文。
- 兼容页面不进侧边栏。
- 如果多个旧路径合并到一个新页面，多个旧页面都跳转到同一个目标。

## 执行顺序

建议按批次执行，每批完成后单独验证。

1. 第一批：空壳和弱内容页。
2. 第二批：Node.js 文件系统合并。
3. 第三批：Next.js 路由与渲染合并。
4. 第四批：Rollup 核心机制合并。
5. 第五批：React 渲染机制合并。
6. 第六批：Monorepo、SOLID、i18n、Ollama 长文精简。
7. 最后统一检查侧边栏、旧路径跳转和构建结果。

## 验证方式

每批修改后至少执行：

```bash
npm run build
```

建议人工检查：

- 顶部导航能进入各分类。
- 侧边栏没有失效链接。
- 被合并的旧路径能跳转到新页面。
- 首页和分类索引页没有指向已删除正文页。
- 文章标题、侧边栏标题和跳转目标一致。

## 完成标准

- 不再存在只有标题和一句话的正文页。
- 兼容跳转页仍可访问。
- 合并后的文章主题边界清晰。
- 长文删除重复解释后仍保留关键示例和结论。
- `npm run build` 成功。
- 本次内容整改不引入新功能和新依赖。

## 版本控制要求

内容整改完成后，由用户选择是否执行版本控制操作：

- A：执行 `commit`，并按需 `push` 到远程分支。
- B：仅保留本地修改，不执行 `commit` / `push`。

如执行提交，提交信息必须符合 Conventional Commits，例如：

```txt
docs: refactor personal site notes
```
