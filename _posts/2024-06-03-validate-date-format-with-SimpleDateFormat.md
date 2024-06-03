---
layout: post
title: java中SimpleDateFormat解析日期格式的问题
subtitle: '如何正确地校验日期格式'
cover: "/assets/images/20240603/cover.jpeg"
date: 2024-06-03
category: Tech
tags: [java]
---
在日常写代码的过程中，我们经常要处理各种格式的日期，常见的日期格式有：“20240601”，“2024-06-01”，“2024-6-1”。如何正确地处理日期格式，尤其是对外接口中参数的日期格式，就很重要了，一个不小心就可能出现意想不到的问题。

举一个我遇到的真实例子：我们提供的对外接口中有一个参数是日期，定义的格式是“yyyyMMdd”,就是说我们要求用户在调用接口的时候要传“20240601”这样格式的日期，但是，接口提供出去，怎么用就是别人的事了...你会发现经常有用户调用接口的时候，传“2024-06-01”这样格式的日期。如果我们不对格式做校验会出现什么问题呢？

``` java
    SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
    Date d = sdf.parse("2024-06-01");
    System.out.println(sdf.format(d));
```

你猜上面这段代码的输出是什么？

是：**20231206**

出现的问题就是：用户希望查2024年6月1日的数据，接口返回的却是2023年12月6日的数据。

如何避免这个问题？我们需要对日期格式做强校验，当用户传的日期格式不是我们希望的日期格式的时候，我们就通过报错来提示用户。

正好SimpleDateFormat父类DateFormat提供了一个方法： public void setLenient(boolean lenient)，这个方法可以控制是否容忍不正确的日期格式，它默认是true，我们需要改成false。就是不容忍错误格式，对格式做强验证。上面的代码可以改成：

``` java
    SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
    sdf.setLenient(false);
    Date d = sdf.parse("2024-06-01");
    System.out.println(sdf.format(d));
```

再运行上面的代码会抛出异常：Exception in thread "main" java.text.ParseException: Unparseable date: "2024-06-01"

当然，如果你不需要严格的日期，不希望代码抛异常，希望代码运行得更健壮，你就不要加这句：sdf.setLenient(false); 你需要根据实际情况来做决定。

以上就是我遇到过的SimpleDateFormat解析日期格式的问题。如果你有什么疑问，欢迎留言跟我讨论。