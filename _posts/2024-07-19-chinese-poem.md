---
layout: post
title: 拼拼古诗
subtitle: '一个flutter实现的古诗拼图游戏'
cover: "/assets/images/20240719/p5.jpg"
date: 2024-07-19
category: Tech
tags: [flutter]
---
去年(2023年)年底我初学flutter，看了一些文档和教程，想找个东西来练练手。

小时候看过一个关于历史名人儿时事迹的短片，有一集是讲周总理的，有一个细节我记得很清楚：幼年周恩来经常要做一个游戏--有一堆纸片，每片纸上一个字，他要一个一个字拼起来拼成一首诗。

很多年前我就想，或许可以把这个游戏做成手机应用。可惜，一直没有动手。恰好可以用flutter来实现这个想法。

于是找了github上的唐诗三百首做数据源，做了个原始版本。

一开始它是这样的：

https://www.bilibili.com/video/BV1C7421K7MH

初始版本的代码在这：
https://gitee.com/wangyidao/peom_puzzle

后来，我想，或许我可以把它美化一下，增加小学到高中教科书中的诗句，可以选择年级以便调整难度。于是在github上搜一下，在这个repo  
https://github.com/chinese-poetry/huajianji  
找到了我想要的数据。

然后，又觉得可以再增加一些英文翻译。恰巧，我又搜到了维吉尼亚大学图书馆网站上的唐诗300首  
https://cti.lib.virginia.edu/frame.htm  
于是经过几番调整，现在它变成了这样。

![](/assets/images/20240719/p1.jpg)

![](/assets/images/20240719/p2.jpg)

![](/assets/images/20240719/p3.jpg)

![](/assets/images/20240719/p4.jpg)

![](/assets/images/20240719/p5.jpg)

https://www.bilibili.com/video/BV1D7421K7Xg

曾几何时，我幻想着能把这个应用上架到应用商店。还申请了软著。
![](/assets/images/20240719/p6.jpg)
后来发现，我天真了... 在这个时代，个人想发个应用太难了。

唉，算了，算了，开源吧！

[https://github.com/stardust1900/chinese_poem](https://github.com/stardust1900/chinese_poem)