# 卡片 (Card) 样式统一方案

## 背景
目前 `connector/frontend` (即 Service Portal) 中存在超过 40 处 `Card` 组件的使用，样式定义高度不一致。
主要问题包括：
- **阴影不一**: 有的无阴影，有的 `shadow-sm`，有的未定义。
- **边框混乱**: 有的 `bordered={false}`，有的 `border-blue-100`，有的 `variant="borderless"`。
- **圆角不一**: 有的 `rounded-xl`，有的默认。
- **内边距 (Padding)**: 手动设置 `bodyStyle={{ padding: ... }}` 的情况较多，且数值不统一 (0, 24px, 48px 等)。
- **交互**: 悬停 (Hover) 效果不统一，部分卡片缺少交互反馈。

## 解决方案：提取公共组件 (`CommonCard`)

为了彻底解决样式不统一并降低维护成本，建议封装一个通用卡片组件 **`CommonCard`**。

### 1. 组件设计思路
该组件基于 Ant Design `Card`，但锁定核心样式，收敛灵活性。

#### 核心 Props
- `title`: 标题 (可选)
- `variant`: 预设样式变体 (可选，默认 `'standard'`)
    - `'standard'`: **标准白底卡片**，带微弱阴影和圆角 (8px)，用于大多数列表或详情块。
    - `'flat'`: **扁平卡片**，无阴影，带细微边框，用于嵌套内容。
    - `'pure'`: **纯净模式**，无边框无阴影，仅作为容器 (替代 `bordered={false}`)。
- `padding`: 内边距预设或具体数值。
    - `'none'`: 0px
    - `'small'`: 16px
    - `'medium'`: 24px
    - `'large'`: 32px
    - `number`: 直接传入数值 (如 `16`)，单位 px。**默认为 16px**。
- `actions`: 底部操作栏 (可选)。
- `hoverable`: 是否启用悬停浮起效果 (可选，默认 `false`)。
- **其他属性**: 支持所有 Ant Design `Card` 组件的原生属性 (如 `cover`, `tabList`, `onTabChange`, `activeTabKey` 等)，可直接透传。

### 2. 样式规范 (CSS Modules / Tailwind)
我们将定义统一的 CSS 类，不再到处写 style 对象。

```css
/* 示例 CSS */
.common-card {
  border-radius: 8px; /* 统一圆角 */
  font-size: 14px; /* 基准字体 */
  transition: all 0.3s ease;
}

.variant-standard {
  background: #fff;
  border: 1px solid #f0f0f0;
  box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09);
}

/* Padding Small (16px) */
.padding-small .ant-card-head { padding: 0 16px; }
.padding-small .ant-card-body { padding: 16px; }
```

### 3. 典型布局模式 (Best Practices)

基于您提供的截图，我们归纳出一种最常用的 **"列表项卡片" (List Item Pattern)**，将内置于 `CommonCard` 的推荐用法中：

- **头部 (Header)**: 左侧 `Icon` + `Title`，右侧 `Status Tag` (绝对定位或 Flex 对齐)。
- **内容 (Body)**: 灰色文字，通常为 Key-Value 对齐展示 (如：产品SN号、版本号)。
- **底部 (Footer)**: 操作栏，通过 `actions` 属性传入，自动带有顶部分割线。

这种模式对应 `variant='standard'` + `padding='small'` (默认) + `hoverable`。

## 代码预览

```tsx
// src/shared/components/CommonCard/index.tsx
import React from 'react';
import { Card, type CardProps } from 'antd';
import classNames from 'classnames';
import './index.scss';

export type CardVariant = 'standard' | 'flat' | 'pure';
export type CardPadding = 'none' | 'small' | 'medium' | 'large' | number;

// Omit 'variant' as well since CardProps has its own variant prop which conflicts
interface CommonCardProps extends Omit<CardProps, 'title' | 'extra' | 'className' | 'variant'> {
    title?: React.ReactNode;
    extra?: React.ReactNode;
    variant?: CardVariant;
    padding?: CardPadding;
    className?: string; // Re-declare to match CardProps but keep explicit
    // loading, hoverable, actions, children, onClick are covered by CardProps
}

export const CommonCard: React.FC<CommonCardProps> = ({
    title,
    extra,
    variant = 'standard',
    padding = 16,
    className,
    loading,
    hoverable = false,
    actions,
    children,
    onClick,
    style,
    ...rest // Capture remaining props
}) => {
    // ... logic ...
    return (
        <Card
            // ... props ...
            {...rest}
        >
            {children}
        </Card>
    );
};
```

## 使用案例 (Usage Examples)

### 1. 标准列表卡片 (Standard List Item)
适用于：连接器列表、合约列表、产品列表。
**注意**：`padding` 默认为 16px，无需显式指定。
```tsx
<CommonCard
    title={
        <div className="flex items-center gap-2">
            <AppstoreOutlined className="text-blue-600 text-lg" />
            <span>212连接器</span>
        </div>
    }
    extra={<Tag color="success">运行中</Tag>}
    hoverable // 启用悬停效果
    actions={[
        <Button type="link">查看详情</Button>,
        <Button type="text" danger>删除</Button>
    ]}
>
    <!-- 内容区域自动拥有 16px padding -->
    <div className="space-y-2 text-gray-500 text-sm">
        <div className="flex justify-between">
            <span>产品SN号:</span>
            <span className="text-gray-800">CN-HW-2026-98251</span>
        </div>
        <div className="flex justify-between">
            <span>IP地址:</span>
            <span className="text-gray-800">172.16.0.104</span>
        </div>
    </div>
</CommonCard>
```

### 2. 详情区块卡片 (Detail Section)
适用于：详情页中的信息分块展示。
```tsx
<CommonCard
    title="基础信息"
    variant="flat" // 扁平无阴影，带细微边框
    // padding 默认为 16px, 如果需要 24px 请使用 padding="medium"
>
    <Descriptions column={2}>
        <Descriptions.Item label="创建时间">2026-02-02</Descriptions.Item>
        <Descriptions.Item label="创建人">Admin</Descriptions.Item>
    </Descriptions>
</CommonCard>
```
