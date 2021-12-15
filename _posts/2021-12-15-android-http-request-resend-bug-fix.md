---
layout: post
title: "android端http请求重发问题定位过程"
subtitle: 'okhttp自动重发问题定位'
date: 2021-12-15
category: tech
tags: [okhttp,android]
---

昨天生产系统上报出一个问题：用户做一次扫码交易，出现了两条交易记录。幸好支付渠道对支付码有限制只成功了一笔，没有出现多扣钱的问题。

现在我们要排查一下，为什么做一次操作会出现两条交易记录。

我们的后台服务是部署了双机，通过阿里云的SLB做负载。在部署服务的两台机器上分别查到了两次交易记录的日志。

一台机器 2021-12-14 13:56:30.100 收到请求，中间调用支付渠道服务耗时2秒，最终2021-12-14 13:56:33.023 返回结果。

另一台机器 2021-12-14 13:56:31.275 收到请求，调用支付渠道服务时报错，2021-12-14 13:56:31.908 返回结果。

后台服务分别收到了请求，现在要确认的是：是SLB转发了两次，还是客户端做了两次请求。

联系阿里云的人协助排查SLB的日志。最终在SLB上也找到了两次请求。两次请求的IP还不一样。一个是移动的一个是电信的。因为商户仅有一台智能POS机，不可能是同时用两台做扫码支付。

猜测是android或java的重发机制。在网络上确实查到有人遇到过类似的问题[Android或者Java发送Http自动重发请求的解决方案](https://blog.csdn.net/ljz2009y/article/details/24384909?locationNum=13&fps=1)

> 由于设置了链接与获取数据的超时时间，客户端在发送数据之后，检测到可能并没有发送成功到后端，这个时候http底层会自动重发请求（注意是Http底层，所以应用端不会知道发送了多次请求）。如果应用端自动重发了多次请求，后端也回复了多次请求，但是前段仅仅会只回复1次请求。所以为了解决这个问题，只要在DefaultHttpClient设置如下代码即可解决：

> defaultHttpClient.setHttpRequestRetryHandler(new DefaultHttpRequestRetryHandler(0,false));

于是，我们可以给出一个解释：
***用户做扫码操作时，网络出现问题，智能POS从WiFi连接自动切换到了移动连接，此时客户端做了一次请求重发。***

因为智能POS是android系统，我们部署在智能POS上的支付app是使用okhttp发起后端请求的，需要修改okhttp相关的代码来规避这个问题.

当然，网上也能找到遇到类似问题的人[实现OkHttp自定义重试次数](https://blog.csdn.net/qq_18244417/article/details/111244263?spm=1001.2101.3001.6650.1&utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7ECTRLIST%7Edefault-1.no_search_link&depth_1-utm_source=distribute.pc_relevant.n)
我们不需要自定义重试次数，我们要禁止重试。所以只需要在构建okhttpClient的时候加一句

>  retryOnConnectionFailure(false)

至此，问题定位修改完成，待系统升级后继续观察。