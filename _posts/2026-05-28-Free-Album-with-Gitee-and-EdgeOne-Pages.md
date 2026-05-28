---
layout: post
title: 用Gitee和EdgeOne Pages搭建支持外链的免费相册
subtitle: 'AI生成代码'
cover: "https://photo.wangxuan.me/.compressed/2026-05-28-blog/20260528103916_99_26.png"
date: 2026-05-28
category: Tech
tags: AI编程 免费相册
---
我一直想给我的博客找个免费的图床，但是一直没找到合适的。因为是用的github pages，国内访问速度堪忧，所有我一直尽量不在博客里贴图片，甚至连题图都省了。

现在有AI了，我可以让AI按照我的要求来生成个支持外链的相册。我提供想法，AI提供代码~

众所周知，我是个抠门的人，我只想让AI来生成代码，但是我不想花钱。甚至AI Agent赠送的积分我也能省则省，看看我怎么做的。

## 1. 写需求，让AI优化需求。使用千问完成。

在千问对话框下面的更多里，选择代码。
![1.png](https://photo.wangxuan.me/.compressed/2026-05-28-blog/20260528100210_89_26.png)

我只写了一句话：使用 Vite 创建一个纯前端相册，读取albums目录下以YYYY-MM-dd-开头的文件夹里的图片，生成缩略图，图片详情展示Exif信息...

原来怎么写的不记得了，大概是这么个意思。点击优化指令。它就会把需求细化，然后发送它就会生成代码。
![](https://photo.wangxuan.me/.compressed/2026-05-28-blog/20260528095403_88_26.png)

## 2. 生成工程代码。元宝，和deepseek完成。

在千问里试了几次，千问只会生成一个单独的html文件，这个不是我想要的。你千问不听话，我用其他的，反正AI有的是。

```
 使用 Vite 创建一个纯前端相册展示工程，不依赖后端服务。工程需满足以下要求：  
- 启动时自动扫描本地 `albumns/` 目录（模拟为静态资源路径，使用 Vite 的 `import.meta.glob` 功能动态导入该目录下所有子文件夹）；
- 仅识别以 `YYYY-MM-dd-` 格式开头的子文件夹（如 `2024-05-20-vacation`），每个文件夹视为一个相册， `YYYY-MM-dd-` 后面文字为相册名称；
- 对每个相册内的图片文件（支持 `.jpg`, `.jpeg`, `.png`, `.webp`），生成缩略图并展示在相册列表页；缩略图使用 Canvas 或 CSS `object-fit: cover` 实现等比裁剪，尺寸统一为 200×150 像素；
- 点击缩略图进入图片详情页，显示：
  - 原图（居中、最大宽度 90vw，支持缩放/拖拽查看）；
  - EXIF 信息（包括拍摄时间、相机型号、GPS 坐标（若存在）、曝光参数等），使用开源轻量库如 `exif-js` 或 `piexifjs` 解析（需通过 CDN 引入）；
  - 当前图片的可复制外链地址（基于 Vite 开发服务器的静态资源路径，如 `/albumns/2024-05-20-vacation/photo.jpg`），提供一键复制按钮；
- 页面具备基础导航：相册列表页（默认首页）与图片详情页（通过 URL hash 或 URLSearchParams 切换，如 `#album=2024-05-20-vacation&photo=photo.jpg`），支持浏览器前进/后退；
- UI 要求简洁响应式：使用原生 CSS Flex/Grid 布局，无外部 UI 框架；相册列表采用网格布局（每行 3～4 个缩略图），详情页含返回按钮；
- 所有资源路径均相对于 `albumns/` 目录，开发时将 `albumns` 放置于 Vite 项目 `public/` 目录下，确保可被直接访问；
- 构建后仍能通过静态服务器运行（即不依赖 Node.js 运行时读取文件系统）。


项目结构为：
photo-album/
├── albums/                # 你的相册目录（自行创建并按格式放入图片）
├── index.html             # 前端页面（已内嵌完整交互逻辑）
├── package.json
├── vite.config.js         # Vite 配置 + 后端 API（读取文件、生成缩略图、解析 EXIF）
└── .thumbnails/           # 自动生成的缩略图缓存（无需手动管理，建议 .gitignore 忽略）

请生成完整、可直接运行的代码，包含 Vite 兼容的模块化脚本结构，并附带简要注释说明关键逻辑。
```
把这段话，复制到了元宝和deepseek里，让他们都帮我生成代码。生成后，我比较了一下，貌似元宝生成的好一点。

## 3. 优化代码。Qcoder完成。
将生成的代码按照目录结构整理好。导入到vscode。把Qcoder插件装上，当然codebuddy，copilot等等其他编程助手也可以。反正大多数每月都送免费积分，我是把能装的都装了。
Qcoder本月的积分还没用完，就先用它，不行就换其他的，再不行我就用非遗手艺古法编程，自己动手改。
![](https://photo.wangxuan.me/.compressed/2026-05-28-blog/20260528101952_90_26.png)
来来回回，几轮交互，代码算是完成了。

## 4. 部署代码。通过EdgeOne Pages部署。

首先你得有gitee账号，github也行的。把AI生成的代码提交到git上。还有，就是你要有个域名。

然后在EdgeOne Pages里设置。找不到的，直接用这个链接：  [https://console.tencentcloud.com/edgeone/pages](https://console.tencentcloud.com/edgeone/pages)

选择Pages选项卡
![](https://photo.wangxuan.me/.compressed/2026-05-28-blog/20260528102505_91_26.png)

创建项目，选择从git导入。这里会让你授权，我的是已经授权过的。
![](https://photo.wangxuan.me/.compressed/2026-05-28-blog/20260528102527_92_26.png)
![](https://photo.wangxuan.me/.compressed/2026-05-28-blog/20260528102551_93_26.png)

然后就可以看到你在git上创建的项目了。

选择刚刚上传的想入导入，配置项目，其他的不用动，就框架预设选vite。点击开始部署。
![](https://photo.wangxuan.me/.compressed/2026-05-28-blog/20260528102702_94_26.png)
![](https://photo.wangxuan.me/.compressed/2026-05-28-blog/20260528102902_95_26.png)
![](https://photo.wangxuan.me/.compressed/2026-05-28-blog/20260528104211_100_26.png)
部署完成需要配置域名。因为我的域名没有备案，加速区域只能选“全球可用区（不含中国大陆）”。
![](https://photo.wangxuan.me/.compressed/2026-05-28-blog/20260528102922_97_26.png)
配置完成，再装个免费的证书，支持ssl访问，就大功告成了。
![](https://photo.wangxuan.me/.compressed/2026-05-28-blog/20260528103002_98_26.png)
这是我的：[https://photo.wangxuan.me](https://photo.wangxuan.me)
