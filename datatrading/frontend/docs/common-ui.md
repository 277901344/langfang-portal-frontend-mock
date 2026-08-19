# 统一 UI 设计规范 (基于 Ant Design 5 官方标准)

本规范基于 **Ant Design 5** 官方设计体系，定义 trading 前端必须遵循的视觉一致性规则。

---

## 1. Design Token 架构 (三层令牌)

Ant Design 5 采用层次化令牌系统，所有平台必须通过 `ConfigProvider` 统一配置：

| 层级 | 说明 | 示例 |
|------|------|------|
| **Seed Token** | 基础种子令牌，影响所有派生变量 | `colorPrimary`, `borderRadius` |
| **Map Token** | 由 Seed Token 派生的梯度变量 | `colorPrimaryBg`, `colorPrimaryHover` |
| **Alias Token** | 语义化别名，控制批量组件样式 | `colorLink`, `colorText` |

---

## 2. 色彩系统

### 2.1 核心色彩令牌 (Seed Token)

```typescript
import { ConfigProvider } from 'antd';

const sharedThemeConfig = {
  token: {
    colorPrimary: '#1677ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1677ff',
    colorTextBase: '#000',
    colorBgBase: '#fff',
  }
};
```

### 2.2 色彩使用规范

| 场景 | 使用色彩 | Token 引用 |
|------|----------|------------|
| 主操作按钮 | 科技蓝 | `colorPrimary` |
| 链接文字 | 科技蓝 | `colorLink` |
| 成功提示 | 安全绿 | `colorSuccess` |
| 警告提示 | 告警黄 | `colorWarning` |
| 错误/拦截 | 熔断红 | `colorError` |
| 禁用状态 | 灰色 | `colorTextDisabled` |

---

## 3. 字体系统 (Typography)

### 3.1 字体阶梯

| 级别 | 字号 | 行高 | 用途 |
|------|------|------|------|
| Title h1 | 38px | 46px | 页面主标题 |
| Title h2 | 30px | 38px | 模块标题 |
| Title h3 | 24px | 32px | 卡片标题 |
| Title h4 | 20px | 28px | 分组标题 |
| Title h5 | 16px | 24px | 小标题 |
| **Body (基准)** | **14px** | **22px** | 正文内容 |
| Caption | 12px | 20px | 辅助说明 |

### 3.2 字体族

```typescript
token: {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
}
```

---

## 4. 间距系统 (Spacing)

| 尺寸 | 像素值 | 用途 |
|------|--------|------|
| **小 (small)** | 8px | 紧凑元素间距 |
| **中 (middle)** | 16px | 默认元素间距 |
| **大 (large)** | 24px | 区块级间距 |

---

## 5. AI 开发强制约束

- 禁止使用内联 `style={{ color: '#xxx' }}`
- 禁止在 `.css` 文件中硬编码颜色值
- 禁止引入非 Ant Design 的第三方 UI 库
- 必须通过 `ConfigProvider` 注入主题配置
- 必须使用 `Space` 组件管理间距
- 必须使用 `Typography` 组件处理文本
