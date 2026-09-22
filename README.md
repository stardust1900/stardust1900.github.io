独行深山
======================

我的个人博客。

地址是：https://wangxuan.me

一个毫无前途，仍然保持乐观的梦想家;

一个备受打击，仍然死不悔改的顽固派;
            
一个写了十几年代码，仍然一无所成的程序员;
            
一个低卑的人，动机不纯的人，一个永远无法脱离低级趣味的人.

**我的公众号：**

![](/assets/img/wechat.png)

**来都来了，领个红包再走**

![](/assets/img/redpacket.jpg)

---
python3 new_post.py -et "How to prove that you are not mentally ill" -ct "如何证明自己没有精神病？" -cat Discuss -tags 疯人院

python3 new_post.py -et "Centuries of Change" -ct "欧罗巴一千年" -cat Notes -tags 欧罗巴一千年

python3 new_post.py -et "If you are the driver" -ct "如果你是油罐车司机" -cat Discuss -tags 社会热点

python3 new_post.py -et "The Gates of Europe" -ct "欧洲之门" -cat Notes -tags 乌克兰

python3 new_post.py -et "wait for the result" -ct "蹲一个结果" -cat Discuss -tags 社会热点

python3 new_post.py -et "chinese poem" -ct "拼拼古诗" -cat Tech -tags flutter

python3 new_post.py -et "Is Successor a good film" -ct "抓娃娃是部好电影吗" -cat Notes -tags 抓娃娃

python3 new_post.py -et "chinese historical torture devices cangue" -ct "中国古代刑罚中的夹棍" -cat Discuss -tags 夹棍

python3 new_post.py -et "Active Portfolio Management" -ct "主动投资组合管理" -cat Notes -tags 量化

---

## 本地开发（样式构建）

本站采用 Jekyll + Tailwind CSS。由于 GitHub Pages 原生构建不会执行 npm，
Tailwind 需要**在本地预编译**为静态 CSS 后再提交，Pages 直接引用编译产物。

```bash
# 1. 安装依赖（仅首次）
npm install

# 2. 修改样式后，编译 Tailwind 源文件 -> assets/css/main.css
npm run css:build        # 一次性构建
npm run css:watch        # 或监听模式，开发时实时编译

# 3. 本地预览站点
bundle exec jekyll serve
```

> 注意：提交前务必运行 `npm run css:build` 并将 `assets/css/main.css` 一并提交，
> 否则线上站点会丢失样式。Tailwind 源文件 `assets/css/tailwind.css`、
> `tailwind.config.js`、`postcss.config.js`、`package.json` 等已在 `_config.yml`
> 的 `exclude` 中排除，不会发布到站点产物里。

