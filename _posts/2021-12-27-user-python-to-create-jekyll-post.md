---
layout: post
title: python脚本创建jekyll post
subtitle: 'rake 的替代方案'
date: 2021-12-27
category: tech
tags: [python,jekyll]
---

我的博客 http://wangxuan.me 是用jekyll搭建托管在github上的。用了很多年，一直都感觉不错。jekyll中有个创建post的Rakefile，可以用 rake post title="" 这个命令来创建post模版。我也很喜欢用。但是执行rake命令需要安装ruby，而我平时是不用ruby的，虽然mac上装了，但是新NUC上我不想再仅仅为了用这一个命令就把ruby装上，我想找个python脚本的替代方案，结果，没找到，于是只好自己动手写一个。

主要用argparse模块来实现，比直接用sys.argv优雅一点。
看一下帮助：

``` shell

$ python3 new_post.py -h

创建post

optional arguments:
  -h, --help            show this help message and exit
  -et ENGLISH_TITLE, --english-title ENGLISH_TITLE
                        英文标题
  -ct CHINESE_TITLE, --chinese-title CHINESE_TITLE
                        中文标题
  -sub SUBTITLE, --subtitle SUBTITLE
                        中文标题
  -cat CATEGORY, --category CATEGORY
                        分类
  -tags TAGS, --tags TAGS
                        标签 多个用逗号分隔
```

看一个例子，就是生成这篇文章的例子：

``` shell

$ python3 new_post.py -et "user python to create jekyll post" -ct "python脚本创建jekyll post" -cat tech -tags python,jekyll

_posts/2021-12-27-user-python-to-create-jekyll-post.md 创建成功！

```
_posts/2021-12-27-user-python-to-create-jekyll-post.md 中生成的内容，如下：

``` txt
---
layout: post
title: python脚本创建jekyll post
subtitle: 'rake 的替代方案'
date: 2021-12-27
category: tech
tags: [python,jekyll]
---
```

完整的代码如下：

``` python
import argparse
from datetime import date
import os

def create_post(post_name,ct,sub,date_,cat,tags):
    post = open(post_name,'w')
    post.write("---\n")
    post.write("layout: post\n")
    post.write("title: %s\n" % ct)
    post.write("subtitle: '%s'\n" % sub)
    post.write("date: %s\n" % date_)
    post.write("category: %s\n" % cat)
    post.write("tags: [%s]\n" % tags)
    post.write("---\n")
    post.close()

    print("%s 创建成功！" % post_name)

if __name__ == '__main__':
    # print(sys.argv)
    parser = argparse.ArgumentParser(description='创建post')
    parser.add_argument('-et', '--english-title', help='英文标题')
    parser.add_argument('-ct', '--chinese-title', help='中文标题')
    parser.add_argument('-sub', '--subtitle', help='中文标题')
    parser.add_argument('-cat', '--category', help='分类')
    parser.add_argument('-tags', '--tags', help='标签 多个用逗号分隔')
    args = parser.parse_args()
    # print(type(args),args)
    et = args.english_title if args.english_title else ""
    ct = args.chinese_title if args.chinese_title else ""
    sub = args.subtitle if args.subtitle else ""
    cat = args.category if args.category else ""
    tags = args.tags if args.tags else ""
    # print(et,ct)
    et = et.replace(" ","-")
    today = date.today()
    date_ = today.strftime("%Y-%m-%d")
    post_name = "_posts/%s-%s.md" % (date_, et)
    # print(post_name)
    if os.path.exists(post_name):
        print(os.path.abspath(post_name))
        str = input("%s已存在 是否覆盖？Y-是 N-否 :"% post_name)
        if 'Y' == str:
            create_post(post_name,ct,sub,date_,cat,tags)
    else:
        create_post(post_name,ct,sub,date_,cat,tags)
```

如果你也用jekyll，恰好也不想装ruby，可以试一下这个。:)

Enjoy!