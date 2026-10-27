# Surefire Plumbing & Heating — Unified All-in-One Platform

> **Next.js 14 全栈水暖综合服务与社交线索智能捕获平台**  
> 服务覆盖：Liverpool · Merseyside · Cheshire · Warrington · Runcorn · Widnes · St Helens 以及指定大曼彻斯特核心区（M1–M3）

---

## 🌟 核心功能一览

1. **客户全流程在线预约 & 实时日历估价 (`/booking`)**
   - 包含 **£40 英国标准基础上门费** 与免费线上估价。
   - 智能识别地区溢价系数（Cheshire / Greater Manchester 远距离加价）。
   - 本地轻量化图片上传存储（无需昂贵第三方图床）。
   - 免费 Resend 邮件通知及本地容灾降级日志。

2. **社交线索智能捕获工作台 (`/admin/social-leads`)**
   - **解决 Facebook 严格 CSP 与跨域限制**：支持**一键划选书签 (Bookmarklet)** 与 **Chrome 浏览器扩展插件**，划选正文自动弹出 `✅ 已同步到工作台`。
   - **AI 智能区域核验**：自动从正文识别地名（Warrington, WA1, Chester, Liverpool 等），过滤非服务区。
   - **燃气与一氧化碳安全风险拦截**：自动阻断商业营销回复，引导客户拨打 0800 111 999 燃气急救热线。
   - **地道英式英语草稿生成**：一键复制本地化自然回复，一键跳转 Facebook 原帖评论，一键转为平台在线预约工单。

3. **管理员一键生成客户账单明细 (`/admin/bookings`)**
   - 支持从预约工单**一键生成正规英国格式账单 (Official Invoice)**。
   - 自动包含 £40 标准上门费、工时劳务费、地区远程费及物料明细。
   - 支持管理员自由增删配件、物料或额外工时。
   - 提供 0% / 20% 增值税 (VAT) 切换。
   - **🖨️ 一键打印 / 另存为 A4 PDF 账单**（内置专业排版打印样式，自动隐藏管理后台界面）。
   - **📋 一键复制账单明细文本**（方便直接在 WhatsApp / 短信 / Facebook 私信发送给客户）。

---

## 🛠 技术架构与合并部署说明

- **框架**: Next.js 14 (App Router, Fullstack Architecture)
- **数据库 / ORM**: Prisma 5.22, PostgreSQL (支持 Vercel Postgres / Neon / Supabase，并带有本地 JSON 自动容灾降级)
- **样式与组件**: Tailwind CSS, Lucide React, date-fns
- **测试**: Node 24 原生测试运行器，20/20 自动化单元测试通过

---

## 🚀 部署至 GitHub & Vercel 指南

### 1. 提交至 GitHub
```bash
git add .
git commit -m "feat: merge social monitoring workbench & add invoice generator"
git push origin main
```

### 2. 部署到 Vercel (1 键部署)
1. 登录 [Vercel 官网](https://vercel.com) 并绑定您的 GitHub 账号。
2. 点击 **「Add New...」->「Project」**，选择导入 `surefire-plumbing-heating-platform` 仓库。
3. **Framework Preset** 选择 `Next.js`（默认自动识别）。
4. 在 **Environment Variables**（环境变量）中添加：
   - `APP_ENV`: `production`
   - `NEXT_PUBLIC_APP_URL`: `https://你的vercel域名.vercel.app`
   - `DATABASE_URL`: `你的PostgreSQL连接串`（如使用 Vercel Postgres 或 Neon；若暂不填，系统会自动安全启用 local/serverless fallback）
   - `ADMIN_API_KEY`: `surefire_admin_secret_key_2026`
   - `RESEND_API_KEY`: `可选，申请免费 Resend API Key`
5. 点击 **「Deploy」**，约 60 秒后部署完成！

---

## 📌 Facebook 划选书签与插件使用说明

### 方式一：⚡ 划选书签 (无需安装任何软件)
1. 打开工作台页面 `/admin/social-leads`。
2. 将 **「📌 拖我到书签栏 (Surefire 划选捕获)」** 按钮直接拖动到浏览器的书签栏。
3. 在 Facebook 群组浏览时，用鼠标划选客户求助正文。
4. 点击书签，网页右上角立即弹出 **`✅ 已同步到 Surefire 工作台！正在进行 AI 打分...`**，弹窗将在 2 秒内自动完成 AI 打分并自闭。

### 方式二：🧩 Chrome 浏览器插件 (最丝滑体验)
1. 打开 Chrome 浏览器，访问 `chrome://extensions/`。
2. 开启右上角 **「开发者模式」**。
3. 点击 **「加载已解压的扩展程序」**，选择本项目根目录下的 `chrome-extension` 文件夹。
4. 在 Facebook 任意帖子中选中文本，**鼠标右键点击「🚀 发送到 Surefire 水暖工作台」**，秒级同步！

---

## 🧪 自动化测试验证
在项目根目录下执行：
```bash
npm test
```
运行输出：**20/20 全部测试通过**（含用户真实截图案例 Sarah Shepherd WA1 浴室安装需求、Warrington 水龙头漏水需求、燃气安全拦截、£40 上门费及账单引擎核验）。
