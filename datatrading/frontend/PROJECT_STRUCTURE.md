# Trading 项目结构说明

本文档概述了 Trading 前端项目的目录结构与组织方式。项目遵循 **领域驱动设计 (DDD)** 理念，尽量保持高内聚、低耦合，并与现有 `sp/frontend`、`connector/frontend` 的真实结构和组织方式保持一致。

## 根目录 (Root Directory)

```text
frontend/
├── public/                 # 静态资源目录（包含 config.js 运行时配置文件）
├── scripts/                # 构建脚本目录
│   └── generate-config.js  # 多环境配置生成脚本
├── src/                    # 源代码目录
│   └── config.ts           # 运行时配置读取工具
├── openspec/               # 前端局部 OpenSpec 目录
├── .agent/                 # 本地辅助目录（与现有项目结构对齐）
├── .env.development        # 开发环境变量
├── .env.local              # 本地环境变量
├── .env.production         # 生产环境变量
├── .gitignore              # Git 忽略配置
├── AGENTS.md               # 前端协作约束
├── PROJECT_STRUCTURE.md    # 项目结构说明
├── README.md               # 前端工程说明
├── index.html              # 应用入口 HTML
├── package.json            # 项目依赖与构建命令
├── tailwind.config.js      # Tailwind 配置
├── tsconfig.json           # TypeScript 配置
├── tsconfig.app.json       # 前端应用 TypeScript 配置
├── tsconfig.node.json      # Node / Vite 配置编译选项
└── vite.config.ts          # Vite 构建工具配置
```

## 源代码目录 (`src/`)

源代码主要分为 **业务模块 (Modules)**、**共享资源 (Shared)** 和 **核心基础设施 (Core Infrastructure)** 三大部分。

### 1. 业务模块 (`src/modules/`)

这是 Trading 前端的核心业务部分。每个业务模块都尽量保持自包含。

```text
src/modules/
├── auth/              # 认证模块（登录、鉴权入口）
├── marketplace/       # 数据市场模块
├── demand-center/     # 需求中心模块
├── billing/           # 计量计费模块（实时汇总版）
├── trade-order/       # 交易订单模块
└── common/            # 通用业务页面（如 404、占位页）
```

**模块内部结构：**

每个模块通常包含以下内容，和现有项目保持同一组织习惯：

- `pages/`: React 页面组件（完整页面）
- `components/`: 仅在该模块内部使用的 UI 组件
- `types/`: 模块专属 TypeScript 类型定义
- `services/`: 模块内接口调用
- `styles/`: 模块私有样式（推荐 `index.scss`）
- `store.ts`: 模块局部状态管理（如需要）
- `routes.tsx`: 模块路由定义
- `utils.ts`: 模块专用工具函数
- `index.ts`: 模块导出入口（如需要）

### 2. 共享资源 (`src/shared/`)

被多个模块或整个应用共同使用的资源。

```text
src/shared/
├── assets/          # 全局静态资源（图片、图标等）
├── components/      # 可复用 UI 组件
├── constants/       # 全局常量
├── hooks/           # 公共 Hooks
├── services/        # 跨模块共享服务
├── styles/          # 全局样式
├── types/           # 全局类型定义
└── utils/           # 全局工具函数（如 request 封装）
```

### 3. 核心基础设施

- `src/layouts/`: 应用外壳布局（如 `BasicLayout`、`BlankLayout`）
- `src/router/`: 主路由配置，负责聚合各模块路由并应用 `AuthGuard`
- `src/store/`: 全局状态管理（如用户登录态）
- `src/App.tsx`: React 应用根组件
- `src/main.tsx`: 前端入口
- `src/config.ts`: 运行时配置读取

## 关键设计原则

1. **高内聚**：修改某个功能时，尽量只关注对应模块目录。
2. **隔离性**：模块之间尽量避免深层相互引用。
3. **最小化共享**：只有真正被多个模块复用的代码才放入 `shared/`。
4. **结构对齐**：模块目录组织方式优先与现有 `sp/frontend`、`connector/frontend` 保持一致，不另起一套规范。

## 路径别名配置

- `@/` 映射到 `src/`
- 示例：`import { post } from '@/shared/utils/request';`

