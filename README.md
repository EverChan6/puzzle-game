# 拼图大师

一个基于 Next.js 的在线拼图游戏，支持经典模式和高级模式。玩家可以选择预设图片或上传自定义图片，并记录游戏进度与成绩。

## 功能

- 经典拼图模式
- 高级模式：逐块生成并放置拼图碎片
- 预设图片与自定义图片上传
- 游戏计时、步数统计和完成记录
- 高级模式游戏存档与恢复
- IndexedDB 保存自定义图片，避免浏览器 `localStorage` 配额溢出
- 响应式界面与深色模式支持

## 技术栈

- Next.js 16（App Router）
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Lucide React
- Vercel Analytics

## 本地开发

### 环境要求

- Node.js 20 或更高版本
- pnpm

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 可用脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 创建生产构建 |
| `pnpm start` | 启动生产服务器 |
| `pnpm lint` | 运行 ESLint |

## 项目结构

```text
app/
  page.tsx                 # 应用入口与模式切换
  layout.tsx               # 根布局、字体和元数据
components/
  puzzle-game.tsx          # 经典模式
  advanced/                # 高级模式及其画布组件
  image-selector.tsx       # 图片选择与上传
  game-history.tsx         # 游戏记录
lib/
  puzzle-types.ts          # 游戏类型定义
  puzzle-utils.ts          # 拼图生成、记录和存档工具
  image-database.ts        # IndexedDB 图片存储
```

## 数据存储

游戏记录和高级模式存档的轻量元数据保存在浏览器 `localStorage` 中。自定义图片保存在 IndexedDB 中，并通过图片 ID 与记录或存档关联，从而避免将大型 Base64 Data URL 写入 `localStorage`。

清除游戏记录时，应用也会清理关联的自定义图片数据。

## 部署

项目可以直接部署到 Vercel：

1. 将仓库导入 Vercel。
2. 使用默认的 Next.js 构建设置。
3. 点击 **Deploy**。

也可以使用 Vercel CLI 或项目提供的 GitHub 集成完成部署。

## 许可证

该项目当前未声明开源许可证。
