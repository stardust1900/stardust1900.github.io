---
layout: post
title: "nginx + uwsgi + django 环境搭建与部署（读书会部署笔记）"
description: ""
category: 
tags: []
---
将读书会的代码部署到腾讯云上，准备环境也折腾了很久。把过程记录一下。

##安装git

    sudo apt-get git

##安装mysql server和客户端
    sudo apt-get install mysql-server

    sudo apt-get install mysql-client

    sudo apt-get install libmysqlclient-dev

##安装 pip
    sudo apt-get install python-pip python-dev build-essential

    sudo pip install --upgrade pip

##安装 virtualenv

    sudo pip install --upgrade virtualenv

创建readingparty 运行环境

    virtualenv readingParty

到readingParty/bin 目录下
激活环境配置

    source activate

###安装django

    pip install Django==1.7

###安装mysql模块

    pip install MySQL-python

###安装 uwsgi

    pip install uwsgi


##安装ffmpeg
因为用到了ffmpeg所以也需要安装，在ffmpeg官网上看到了ppa的安装方法

    apt-get install python-software-properties(使用add-apt-repository命令需要安装这个)

    sudo add-apt-repository ppa:gwibber-daily/ppa

    sudo apt-get update

    sudo apt-get install ffmpeg

用这种方法安装完成以后，仍然无法转换amr文件，命令行报错

最后还是用编译源码的方式安装
[ubuntu上安装ffmpeg](http://thierry-xing.iteye.com/blog/2017864) 这里有详细步骤

我在安装的过程中 ./configure && make && make install 总是报错 报一个权限的问题 （系统是ubuntu 12.04） 但是分步执行的时候可以编译安装成功。。。

##安装 nginx

    sudo apt-get install nginx

###至此所有工具安装完毕，接下来是配置

##配置uwsgi
我查到了一些配置的方法，[VPS上配置NGINX+UWSGI+DJANGO+MYSQL](http://mp.weixin.qq.com/s?__biz=MjM5NTQ3NDAwMw==&mid=200793185&idx=1&sn=1895a4524b52bffbe27b6bfe76dc6fe8&3rd=MzA3MDU4NTYzMw==&scene=6#rd)
这篇文章中是用xml的方法配置uwsgi的，我按照这种方法配置了以后，用ps -ef | grep uwsgi 命令可以看到uwsgi
进程，但是nginx配置完成访问时总是报 Internal Server Error。后来改用了ini文件来配置
{% highlight ini %}
[uwsgi]
socket = 127.0.0.1:8077
chdir = /home/ubuntu/github/reading-party/server/readingParty
wsgi-file = /home/ubuntu/github/reading-party/server/readingParty/readingParty/wsgi.py
processes = 4
threads = 2
stats = 127.0.0.1:9191
buffer-size = 32768
{% endhighlight %}


##配置nginx
在/etc/nginx/sites-available/default 文件中添加
{% highlight sh %}
server {

    listen   80;
    server_name local;
    access_log /home/ubuntu/github/reading-party/server/readingParty/logs/access.log;
    error_log /home/ubuntu/github/reading-party/server/readingParty/logs/error.log;

    #charset koi8-r;

    #access_log  logs/host.access.log  main;

    location / {
     include        uwsgi_params;
     uwsgi_pass     127.0.0.1:8077;
    }

    #error_page  404              /404.html;

    # redirect server error pages to the static page /50x.html
    #
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   html;
    }

    location /static/ {
        alias  /home/ubuntu/github/reading-party/server/readingParty/static/;
        index  index.html index.htm;
    }

    location /media/ {
        alias  /home/ubuntu/github/reading-party/server/readingParty/readingParty/media/;
    }
}
{% endhighlight %}

用 sudo /etc/init.d/nginx start  启动nginx


用uwsgi --ini reading-party.ini &  命令启动uwsgi
用 sudo nginx -s  reload  重新加载配置

ok，到此全部部署完成，网址可以访问了[http://reading-party.com](http://reading-party.com)