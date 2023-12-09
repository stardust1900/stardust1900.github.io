---
layout: post
title: 将github pages托管到4everland
subtitle: '访问速度让人惊喜'
date: 2023-12-09
category: Tech
tags: [github,4everland]
---

最近发现了个好东西 https://www.4everland.org/，这个号称是web3.0的云计算平台，可以做web主机，云存储，去中心网关等等。如果你用vue或者react做网页应用，部署在这个上面，非常好用。我试了一下，在国内的访问速度也是让人惊喜。

我的个人博客是用的github pages，虽然凑合用，但是这个在国内的访问速度实在是差强人意。因为4everland是直接导入github仓库的，于是我产生了一个想法：能不能把我的个人博客整到4everland上面去？

答案是：能，真的是太能了。整完以后的感觉是：哎呀妈呀，真香！

跟大家介绍一下我是怎么做的，感兴趣的朋友可以试一下。

因为之前对github action不太熟悉，也浪费了不少时间，曾经一度以为我要自己写action了，不过走运的是从action市场找到了合适的action。

哪怕你没用过github action，跟着我的步骤做，也一定能成功。

## 0.设置github Token
  
  因为要通过action创建分支，需要授权

  登陆github后点击又上角头像->Settings->Developer setings->Personal access tokens->Tokens(classic)

![](/assets/images/20231209/1.png)

![](/assets/images/20231209/2.png)



  点击Generate new Token 授权确认后进入创建页面
![](/assets/images/20231209/3.png)

  在note中取个名字，选过期时间，我选的永不过期，下面的授权主要把repo和workflow勾上，我为了保险都给勾上了...

  点击下面的按钮后页面上会生成一个gh开头的字符串，把这个字符串保存好，下一步会用到。

## 1.设置secrets
  
  这个是要在action使用的变量

  在你的github pages仓库的settings中
  ![](/assets/images/20231209/4.png)

  点击New repository secret

  名字填：DEPLOY_TOKEN secret：填上一步生成的gh开头的字符串 保存。

## 2.创建workflow
  回到仓库，点击action，点new workflow，然后点set a workflow yourself
![](/assets/images/20231209/5.png)
![](/assets/images/20231209/6.png)
把下面的内容拷贝进去，保存 commit changes。github的部分就搞完了

  ```yml
  # Sample workflow for building and deploying a Jekyll site to GitHub Pages
name: Deploy Jekyll with GitHub Pages dependencies preinstalled

on:
  # Runs on pushes targeting the default branch
  push:
    branches: ["main"]

  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

# Sets permissions of the GITHUB_TOKEN to allow deployment to GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Allow only one concurrent deployment, skipping runs queued between the run in-progress and latest queued.
# However, do NOT cancel in-progress runs as we want to allow these production deployments to complete.
concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  # Build job
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Build with Jekyll
        # uses: actions/jekyll-build-pages@v1
        uses: jerryjvl/jekyll-build-action@v1
        with:
          source: ./
          destination: ./_site
      # - name: Upload artifact
      #   uses: actions/upload-pages-artifact@v2
                    
      - name: Deploy to GitHub Pages
        uses: JamesIves/github-pages-deploy-action@v4.5.0
        with:
          folder: ./_site
          token: ${{ secrets.DEPLOY_TOKEN }}
          branch: docs



  # Deployment job
  # deploy:
  #   environment:
  #     name: github-pages
  #     url: ${{ steps.deployment.outputs.page_url }}
  #   runs-on: ubuntu-latest
  #   needs: build
  #   steps:
  #     - name: Deploy to GitHub Pages
  #       id: deployment
  #       uses: actions/deploy-pages@v3

  ```
  ![](/assets/images/20231209/7.png)

  你可能会问 为什么不直接用jekyll的workflow？

  有两个问题：

  1.这个直接部署到pages上了拿不到生成的_site目录。
  
  上面使用JamesIves/github-pages-deploy-action@v4.5.0 替换 actions/jekyll-build-pages@v1 就是为了将_site目录保存到了docs分支

  2.生成的html中包含*.github.io的域名无法部署到别的域名。
  
  使用jerryjvl/jekyll-build-action@v1 替换 actions/jekyll-build-pages@v1 就是为了解决这个问题

## 3.进入4everland网站
  
  是用github账号可以直接登陆，登陆后点击projects，点右上角new project，会展示你的所有在github上的仓库，选择你的目标仓库import

  ![](/assets/images/20231209/8.png)

  修改一下工程名，选择docs分支，点击下面的deploy就可以了。

  ![](/assets/images/20231209/9.png)

  4everland会为你的工程生成一个二级域名你可以直接访问，或者你可以像我一样配置自己的域名，如果你有自己的域名的话。

  [https://wangxuan.me](https://wangxuan.me)

  好了，这样就全部完成了，赶快来试试吧。







  
  

