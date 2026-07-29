---
layout: post
title: ViberCoding手记(20260729)
subtitle: '玩偶聊天室的诞生'
cover: "https://photo.wangxuan.me/albums/2026-07-29-logo/icon.png"
date: 2026-07-29
category: Tech
tags: AI编程 ViberCoding
---
最近腾讯的混元模型限时免费，所以codebuddy和workbuddy玩得有点肆无忌惮。


# 玩偶聊天室
<img src="https://photo.wangxuan.me/albums/2026-07-29-logo/icon.png"  width="100" />

不记得什么时候产生的这个想法了，总觉得在一个聊天室里，每个人扮演一个角色，读一些电影对白或者话剧台词，可能会很好玩。目前来看，能有足够多声音角色来实现这个想法的库只有edge-tts。现在python是有免费可用的edge-tts包的。那就让AI直接用tkinter写一版看看吧。很快就完成了，看起来是这样：
![](https://photo.wangxuan.me/albums/2026-05-28-blog/20260729135308_6_26.png)
虽然还行，界面也差强人意，只能勉强玩玩，这个只能说是验证了我的想法可实现。不得不承认，我觉得这个应用理想中的运行平台应该是手机端。现在问题就清晰了：python实现，手机端应用。能选的框架可能就只有kivy了。这是个有点历史的跨平台框架了，几年前玩过，我记得windows平台输入中文的问题一直没解决，现在问一下AI，回答是：仍然没解决。但是它说在安卓端没有问题，可以正常输入。于是我决定让AI用kivy来改写了。谁曾想这居然是个大坑，即使有AI它依然是大坑。因为我之前就有切换GUI框架的打算，特意让AI生成代码的时候把表现和逻辑分层，所以代码很快就迁移完成。代码在windows下也能跑，它的界面是这样的。

![](https://photo.wangxuan.me/albums/2026-05-28-blog/20260729140507_7_26.png)
![](https://photo.wangxuan.me/albums/2026-05-28-blog/20260729140530_8_26.png)

看着还行，把这个打成apk包试试吧。谁曾想打包才是噩梦的开始，windows下不能直接打，我不想用WSL，于是在虚拟机里打，我有装了ubuntu26.04的虚拟机。打包过程无比漫长，动不动一两个小时，下载依赖包那叫一个慢，我打了两天才打出第一个apk包，这个包装在手机上，直接就是闪退。连到android studio里看logcat，把错误信息给AI去改，要命的是：需要clean 重新打包，依赖包会重新下。反反复复，折腾了足足有两天，终于能在手机上跑起来了。结果，那个体验这是一言难尽，丑就算了，还奇慢，最不能忍的是输入的时候输入法界面直接把下半屏遮住，输入框被挡了个严严实实，基本是半盲输入。算了，算了，放弃了...

不知怎么得我突然灵机一动：让AI把edge-tts用dart改写一下，用flutter实现，有没有搞头呢？其实之前ViberCoding不盛行的时候，我曾手动让AI对话改写过，一开始能用，微软变动的时候就不能用了，太不稳定就放弃了，现在有各种AI工具，让它根据python的库实时改不就行了？
说干就干，直接在workbuddy里，把edge-tts得github地址贴进去，让它用dart改写。没想到出奇得顺利！
代码在这：https://gitee.com/wangyidao/dart-edge-tts

于是用flutter把界面重写了一下，改了一些bug，今天算是完成了1.0版。它现在是这样的：
![](https://photo.wangxuan.me/albums/2026-05-28-blog/20260729142708_9_26.png)
![](https://photo.wangxuan.me/albums/2026-05-28-blog/20260729142822_10_26.png)
![](https://photo.wangxuan.me/albums/2026-05-28-blog/20260729143036_11_26.png)


# 拼拼古诗
<img src="https://photo.wangxuan.me/albums/2026-07-29-logo/poem.png"  width="100" />

既然dart版的edge-tts都有了，我可以把拼拼古诗改回去，也用这个包。  
另外增加了搜索，和语速控制。  
现在是这样：

![](https://photo.wangxuan.me/albums/2026-05-28-blog/20260729143247_12_26.jpg)
![](https://photo.wangxuan.me/albums/2026-05-28-blog/20260729143507_13_26.jpg)


# 草灰笔记
<img src="https://photo.wangxuan.me/albums/2026-07-29-logo/ashes_note_logo.png" width="100" />

这个应用我每天都在用，遇到问题就会修改，想到功能也会增加。  
最近是加了一个优化：全角的引号和双引号高亮显示，避免复制代码执行的时候报错。  
还加了一个功能，就是RSS阅读器（没错，我就是这么老派）。以前都是在foxmail里看RSS订阅，现在都是在草灰笔记里了。

![](https://photo.wangxuan.me/albums/2026-05-28-blog/20260729144229_14_26.png)
