---
layout: post
title: "DbVisualizer 中执行 db2 explain plan"
description: ""
category: 
tags: []
---
因为要做sql语句优化，以前没玩过db2，网上找了一些方法，但是很多都是介绍在命令行下执行Explain plan的。比如这篇[DB2执行计划的创建使用和更新](http://wenku.baidu.com/view/971d26838762caaedd33d49e.html)总的感觉：操作起来实在是不方便。
自己摸索了一下手上现成的工具DbVisualizer，我的版本是9.1.5。（网上下的破解版，嘘。。。）

我把方法记录一下：
在连接设置的properties选项卡下，选择Explain plan，选中Use User Defined Plan Table，如果你没有执行过EXPLAIN.DDL(参见上面链接的文章)勾选Create Plan Table，然后点Apply。

<img src="/pic/snapshot/20141113/dbVisualizer.PNG"  width="600"/>

在sql commander窗口中写下需要分析的sql语句。然后选择SQL Commander --Execute Explain plan--Execute Explain plan

<img src="/pic/snapshot/20141113/dbVisualizer.PNG"  width="600"/>

然后就可以看分析结果了
树视图
<img src="/pic/snapshot/20141113/dbVisualizer.PNG"  width="600"/>

图表视图
<img src="/pic/snapshot/20141113/dbVisualizer.PNG"  width="600"/>

至于每项的意义，就需要查查文档了。我主要看索引的使用情况，大体看一下就可以了。