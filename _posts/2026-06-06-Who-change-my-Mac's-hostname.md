---
layout: post
title: 谁把我苹果电脑的名字改成了小米15
subtitle: ''
cover: "https://photo.wangxuan.me/albums/2026-05-28-blog/WechatIMG7.jpg"
date: 2026-06-06
category: Tech
tags: Mac 苹果电脑
---
今天下午，我打开了我那尘封已久的MacBook Pro，无意中发现它的名字在命令行里居然变成了“Xiaomi-15”。
![](https://photo.wangxuan.me/albums/2026-05-28-blog/WechatIMG7.jpg)

我感到非常困惑，因为我从来没有更改过我的电脑名字。难道它自己给自己取了个新名字？难道是因为被我冷落太久，它给自己换了个新名字来引起我的注意？很好，这个方法不错，它的确成功地引起了我的注意。但是小米15这个名字似乎一般，我决定把它成华为Mate 40 Pro。可是，很不好意思的说，我不知道怎么改...这个好办，以前是放狗搜，现在问AI就完了。
![](https://photo.wangxuan.me/albums/2026-05-28-blog/WechatIMG11.jpg)
你瞧瞧，人家回答得多详细，修改方法都给了两个。要我选，我就选第二个。用命令行改，AI也会这么选，因为在电脑上，“两点之间命令行最短”。

但是改之前，我要先确认一下，这个机器名是不是真的被改了。
![](https://photo.wangxuan.me/albums/2026-05-28-blog/WechatIMG8.jpg)

见鬼了这不是，见鬼了这不是，三个名称里，没有一个叫“Xiaomi-15”，这是为什么呢？

接着问AI
![](https://photo.wangxuan.me/albums/2026-05-28-blog/9341645dc607a.jpeg)

![](https://photo.wangxuan.me/albums/2026-05-28-blog/1e9eb3b3cf27d8.jpeg)

根据它的解释，这个名字是因为我连上路由器，从路由器带过来的。那我验证一下，我把wifi关上再试一下。

Amazing啊，只要关上wifi，Mac的名字就恢复了！

![](https://photo.wangxuan.me/albums/2026-05-28-blog/WechatIMG9.jpg)

AI啰啰嗦嗦讲了这么多，有的地方跟我的情况也不是完全相符。我来总结归纳一下：因为我的路由器的IP分配策略是DHCP，动态给连上来的设备分配IP地址。今天分配给我的Mac的IP，以前曾经分配给过其他的设备，这个设备的名字正是Xiaomi-15，路由器把这个ip和名字绑定了。因为我的Mac没有设置hostname，系统就用这个IP从路由器上获取到了“Xiaomi-15”这个名字，就把它作为了我的机器名。

至此，结案。无用的知识又增加了一点点。
