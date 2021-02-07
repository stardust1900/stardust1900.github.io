---
layout: post
title: "熟悉这个能让你的开发效率提高10倍"
date: 2021-02-07
category: 技术
tags: [java,apache-commons]
---

如果你是Java程序员，这个开源项目你一定见过，而且一定直接或者间接的使用过。

就是Apache-Commons，这个项目是个工具集，其中包含了非常多好用的工具类，如果熟悉这些工具类，能让你非常高效地写代码。
比如最常用的StringUtils,IOUtils,FileUtils...

举个例子：

* 字符串判空

``` java
    //硬刚的做法
    if(someString == null || someString.isEmpty()){
        //do something
    }

    //优雅的做法，使用StringUtils
    if(StringUtils.isEmpty(someString)) {
        //do something
    }
```

* 关闭流

``` java
    //硬刚的做法
    InputStream  in = null;
    OutputStream out = null;
    try{

    }catch(Excetpion e){

    }finally{
        if(in != null){
            try{
                in.close();
            }catch(IOException e){

            }
        }
        if(out != null){
            try{
                out.close();
            }catch(IOException e){

            }
        }
    }

    //优雅的做法，使用IOUtils
    InputStream  in = null;
    OutputStream out = null;
    try{

    }catch(Excetpion e){

    }finally{
        IOUtils.closeQuietly(in);
        IOUtils.closeQuietly(out);
    }
```

* 下载文件

``` java

    //颖刚的做法
    //你需要建立url链接
    //打开流
    //写入文件
    //关闭流
    //做一堆异常处理
    //blabla...

    //优雅的做法，使用FileUtils 只要三行代码
    URL source = new URL(url);
    File destination = new File(storePath);
    FileUtils.copyURLToFile(source, destination);

```

* 取Md5值

``` java
    //硬刚的做法
    //写一个md5工具类
    //做摘要对象
    //做16进制处理
    //可能还有base64处理
    //blabla...

    //优雅的做法 使用DigestUtils
    String md5str = DigestUtils.md5Hex(someString);

```

Apache Commons中还有很多使用的工具类，有空的时候去扫几眼api，相信我，它总能给你带来惊喜。