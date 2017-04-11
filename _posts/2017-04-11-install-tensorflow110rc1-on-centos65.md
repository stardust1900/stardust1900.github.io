---
layout: post
title: "在centos6.5上安装tensorflow1.1.0rc1"
description: ""
category: 
tags: [tensorflow,centos65]
---

最近在玩机器学习的东西。稍微试了几下Scikit Learn和spark ML之后，发现还是谷歌的tensorflow在人气上火一点，于是我决定装一下tensorflow。

windows上好像只有pthon3的whl包，我开发机器上pthon的版本是2.7，不想升级3.0；在尝试了docker安装失败以后(网络原因，你懂的)，转而通过虚拟机安装。

我的虚拟机上装的是centos6.5，因为生产环境的操作系统是这个版本。

开始时，我打算装python3.5， 因为从git上 [https://github.com/tensorflow/tensorflow](https://github.com/tensorflow/tensorflow) 看到最新版本支持的是3.5。

网上搜到这篇[CentOS6 安装Python3.5 原来是python2.6 升级到python3](http://blog.csdn.net/jaket5219999/article/details/52560167) 于是照着装。后来是装成功了，但是，因为glibc的问题，tensorflow跑不起来。我以为是python版本的问题，于是转回去装python2.7...

下面记录我装python2.7和tensorflow-1.1.0rc1-cp27-none-linux_x86_64.whl 的过程

1. 装python2.7


		下载源码包 wget https://www.python.org/ftp/python/2.7.13/Python-2.7.13.tgz
		
		解压 tar -xzvf Python-2.7.13.tgz
		
		在源码根目录做编译配置 ./configure --prefix=/usr/local/python27 --enable-unicode=ucs4

**这里是重点！！一定要加上 --enable-unicode=ucs4  这个参数，不然就算装成功了后面也会遇到一个  undefined symbol: PyUnicodeUCS4_AsASCIIString 的错误。 我是遇到问题后再这篇[http://blog.csdn.net/wadqse123/article/details/44563503](http://blog.csdn.net/wadqse123/article/details/44563503)看到的解决方法。**

2. 装pip

		下载get-pip.py 
		
		https://pip.pypa.io/en/latest/installing/#id9
		
		运行
		
		python get-pip.py

3. 装tensorflow

		下载 tensorflow-1.1.0rc1-cp27-none-linux_x86_64.whl 

<img src="/pic/snapshot/20170411/tensorflow.PNG"  width="600"/>
 
    pip install tensorflow-1.1.0rc1-cp27-none-linux_x86_64.whl 的时候会报一个错：
    tensorflow-1.1.0rc1-cp27-none-linux_x86_64.whl is not a supported wheel on this platform

    用 python -m pip install --upgrade tensorflow-1.1.0rc1-cp27-none-linux_x86_64.whl 安装


4. 装glibc-2.17

参考
[http://blog.csdn.net/levy_cui/article/details/51251095](http://blog.csdn.net/levy_cui/article/details/51251095)

**需要注意的是：直接安装覆盖，不要编译到备用目录再建软链。**

```shell

wget http://ftp.gnu.org/pub/gnu/glibc/glibc-2.17.tar.xz

xz -d glibc-2.17.tar.xz

tar -xvf glibc-2.17.tar

cd glibc-2.17

mkdir build

cd build

../configure --prefix=/usr --disable-profile --enable-add-ons --with-headers=/usr/include --with-binutils=/usr/bin  

make && make install

```
5. 装GLIBCXX_3.4.14

同样参考
[http://blog.csdn.net/levy_cui/article/details/51251095](http://blog.csdn.net/levy_cui/article/details/51251095)

在
http://download.csdn.net/detail/pomelover/7524227
下载 libstdc++.so.6.0.20

放到/usr/lib64/下

    chmod +x libstdc++.so.6.0.20
    
    rm libstdc++.so.6

    ln -s libstdc++.so.6.0.20 libstdc++.so.6



到此结束。

<img src="/pic/snapshot/20170411/hello.PNG"  width="600"/>