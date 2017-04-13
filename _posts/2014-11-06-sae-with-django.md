---
layout: post
title: "sae上用django开发遇到的问题记录"
description: ""
category: 
tags: [sae,django]
---
在sae上使用django框架遇到的一些问题。

<!--more-->

#### 1. url 函数的问题

因为sae上django的版本是1.4 ，模板中这个函数的语法有了一点变化 传入参数的时候不要用'' 
比如用\{ % url urlname %\}而不是\{ % url 'urlname' % \}

#### 2. 模板过滤函数的问题

应该也是django版本的问题，使用过滤函数的时候 \'\|\'前后不能有空格


#### 3. emoji表情的问题

我做的东西保存微博的内容，但是含有emoji表情的内容在入库时报错 

>“Incorrect string value: '\xF0\x9F\x8E\xB6\xF0\x9F…' MySQL”

这是因为utf-8编码与emoji表情冲突的问题，网上有修改数据库设置的解决办法：

[Incorrect string value: '\xF0\x9F\x98\x84\xF0\x9F](http://blog.csdn.net/fuxuejun/article/details/20361669) 

但是我不需要这么做，我把emoji替换掉就好了，方法：[python 表情过滤](http://my.oschina.net/jiemachina/blog/189460)

#### 4.syncdb的问题

sae的文档里写了syncdb的方法，但我觉得不怎么靠谱。还是在本地用sqlall生成脚本，拿到sae上去执行好了。