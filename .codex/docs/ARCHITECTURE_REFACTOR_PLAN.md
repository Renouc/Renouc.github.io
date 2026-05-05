# 个人网站架构重构技术方案

## 目标

重构当前 VitePress 个人网站的信息架构，让导航、侧边栏、目录结构和文章归属保持一致。

本次重构只处理架构划分、目录归属、导航配置和必要索引页，不重写文章正文，不做视觉改版，不引入新框架。

## 当前问题

- `fragment` 承载过多类型内容，包括 Node、Git、npm、Koa、SOLID、前端实践等，分类边界不清。
- 顶部导航、侧边栏和实际文件分布不完全一致。
- 部分文章没有侧边栏入口，例如 `frontend/react/base.md`、`frontend/next/middleware.md`、`frontend/next/pages-router.md`、`frontend/next/render.md`。
- 部分索引页只需要确认链接有效，不承担正文内容。
- 存在空文件 `src/fragment/rollup.md`，需要确认后删除或迁移。

## 重构原则

- 默认保持旧链接可访问，避免破坏已有外链和搜索入口。
- 每篇文章只归入一个主分类，以主要读者意图为准。
- 不在本次重构中重写正文内容。
- 不新增复杂抽象，优先使用 VitePress 现有能力。
- 配置拆分只服务于降低导航和侧边栏维护成本。

## 目标目录结构

```txt
src/
  index.md
  frontend/
    index.md
    javascript/
    typescript/
    react/
    next/
    engineering/
    practice/
  backend/
    index.md
    node/
    koa/
    graphql/
  ai/
    index.md
    agent/
    local-models/
  engineering/
    index.md
    git/
    npm/
    monorepo/
    library/
  devops/
    index.md
    docker/
  principles/
    index.md
    solid.md
  meta/
    index.md
    site-building.md
```

## 文章迁移映射

| 当前路径 | 目标路径 |
| --- | --- |
| `src/index.md` | `src/index.md` |
| `src/blog-building.md` | `src/meta/site-building.md` |
| `src/frontend/index.md` | `src/frontend/index.md` |
| `src/frontend/javascript/*` | `src/frontend/javascript/*` |
| `src/frontend/typescript/*` | `src/frontend/typescript/*` |
| `src/frontend/react/*` | `src/frontend/react/*` |
| `src/frontend/next/*` | `src/frontend/next/*` |
| `src/frontend/engineering/*` | `src/frontend/engineering/*` |
| `src/fragment/i18n.md` | `src/frontend/practice/i18n.md` |
| `src/fragment/input_entry.md` | `src/frontend/practice/input-entry.md` |
| `src/fragment/underline_animation.md` | `src/frontend/practice/underline-animation.md` |
| `src/fragment/monitor.md` | `src/frontend/practice/monitor.md` |
| `src/fragment/env.md` | `src/backend/node/env.md` |
| `src/fragment/fs_exists.md` | `src/backend/node/fs-exists.md` |
| `src/fragment/fs_rm.md` | `src/backend/node/fs-rm.md` |
| `src/fragment/stdio.md` | `src/backend/node/stdio.md` |
| `src/fragment/stream.md` | `src/backend/node/sse-stream.md` |
| `src/fragment/koa.md` | `src/backend/koa/index.md` |
| `src/fragment/graphql.md` | `src/backend/graphql/index.md` |
| `src/fragment/git.md` | `src/engineering/git/index.md` |
| `src/fragment/npm.md` | `src/engineering/npm/index.md` |
| `src/fragment/monorepo.md` | `src/engineering/monorepo/index.md` |
| `src/fragment/library_development.md` | `src/engineering/library/index.md` |
| `src/fragment/solid.md` | `src/principles/solid.md` |
| `src/ai/ai-agent.md` | `src/ai/agent/index.md` |
| `src/ai/ollama.md` | `src/ai/local-models/ollama.md` |
| `src/devops/docker.md` | `src/devops/docker/index.md` |
| `src/fragment/rollup.md` | 空文件，确认无内容后删除 |

## 旧路径兼容策略

迁移后保留旧路径页面作为兼容入口，旧页面只负责跳转到新地址。

旧页面模板：

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

兼容页面只用于已迁移路径，不参与新侧边栏组织。

## 导航规划

顶部导航调整为：

- `前端`：`/frontend/`
- `后端 / Node`：`/backend/`
- `AI`：`/ai/`
- `工程化`：`/engineering/`
- `DevOps`：`/devops/`
- `原则`：`/principles/`

首页主要入口同步调整为上述分类，避免继续突出 `fragment`。

## 侧边栏规划

将 `.vitepress/config/sidebar.ts` 拆分为按主题维护的模块：

```txt
.vitepress/config/sidebar/
  index.ts
  frontend.ts
  backend.ts
  ai.ts
  engineering.ts
  devops.ts
  principles.ts
```

`.vitepress/config/sidebar/index.ts` 聚合各主题侧边栏，`.vitepress/config/index.ts` 继续只引入 `sidebar`，保持外部使用方式不变。

侧边栏只列真实文章分组，不添加分类索引块。分类首页通过顶部导航访问，不在侧边栏重复出现。例如不要在 `/frontend/` 侧边栏顶部添加“前端 / JavaScript / TypeScript / React / Next.js”这类目录块。

## 索引页要求

每个一级目录必须有 `index.md`，内容只做分类索引，不写长文。

索引页只包含：

- 当前分类下的主要文章链接

需要保留或新增的必要索引页：

- `src/frontend/index.md`
- `src/frontend/practice/index.md`
- `src/backend/index.md`
- `src/backend/node/index.md`
- `src/ai/index.md`
- `src/engineering/index.md`
- `src/devops/index.md`
- `src/principles/index.md`
- `src/meta/index.md`

## 实施步骤

1. 新建目标目录和必要的 `index.md`。
2. 按迁移映射移动文章文件。
3. 对已移动文章保留旧路径兼容页面。
4. 删除确认无内容的 `src/fragment/rollup.md`。
5. 更新 `.vitepress/config/nav.ts`。
6. 拆分并更新侧边栏配置。
7. 更新 `src/index.md` 首页入口。
8. 执行构建验证。
9. 检查导航、侧边栏和旧路径跳转是否符合预期。

## 验收标准

- `npm run build` 成功。
- 顶部导航不再依赖 `fragment`。
- 每个一级分类都有索引页。
- 每篇非兼容文章都能从导航或侧边栏访问。
- 已迁移旧路径能跳转到新路径。
- 文章正文除必要标题或链接修正外不被重写。

## 不在本次范围

- 不重写文章内容。
- 不新增标签、搜索增强、评论、RSS 或统计功能。
- 不更换 VitePress 主题。
- 不调整部署方式。
- 不执行 `commit` 或 `push`，除非用户后续明确确认。
