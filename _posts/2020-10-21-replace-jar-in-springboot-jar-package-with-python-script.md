---
layout: post
title: "使用python替换springboot jar包中的依赖jar"
date: 2020-10-21
category: 技术
tags: [python springboot]
---
Spring4.3 核心包报出“Spring Framework反射型文件下载0day漏洞”，需要将依赖的jar包升级到4.3.29以上。但是，因为是接手过来的项目，很多工程没有源码，不能用修改依赖重新打包的方式升级，只能直接替换jar包中的jar依赖，使用rar工具替换后做了测试，发现无法启动。只能将jar包解压后，使用jar命令重新打包。

先 jar -xvf ***.jar 解压要替换的jar。另：用unzip 命令解压也是可以的。

class文件及lib都在BOOT-INF文件夹下，直接替换即可

替换后 用 jar -cfM0 XX.jar ./  命令打打包成jar

因为需要升级的jar有几十个，一个一个手工替换太麻烦，而且容易出错，于是我写了个python 脚本。

思路是：
1. 使用subprocess调用unzip解压jar包 （使用unzip的原因是可以指定解压目录，jar命令解压的时候无法指定目录）
2. 遍历解压后的 BOOT-INF/lib 目录，和预定义的dict中需要替换的包名做比较。符合的时候将老包删除，将新包拷贝过来
3. 使用subprocess 先cd到解压目录，然后使用jar命令重新打包 (先cd 是因为 jar 只能在当前目录打包)
4. 打包完成后 将解压目录删除

代码如下：

``` python
#coding:utf-8
import os 
import subprocess
from shutil import copyfile
from shutil import rmtree

jarMap={'spring-aop':'spring-aop-4.3.29.RELEASE.jar'
,'spring-aspects':'spring-aspects-4.3.29.RELEASE.jar'
,'spring-beans':'spring-beans-4.3.29.RELEASE.jar'
,'spring-context':'spring-context-4.3.29.RELEASE.jar'
,'spring-context-support':'spring-context-support-4.3.29.RELEASE.jar'
,'spring-core':'spring-core-4.3.29.RELEASE.jar'
,'spring-expression':'spring-expression-4.3.29.RELEASE.jar'
,'spring-jdbc':'spring-jdbc-4.3.29.RELEASE.jar'
,'spring-jms':'spring-jms-4.3.29.RELEASE.jar'
,'spring-messaging':'spring-messaging-4.3.29.RELEASE.jar'
,'spring-orm':'spring-orm-4.3.29.RELEASE.jar'
,'spring-oxm':'spring-oxm-4.3.29.RELEASE.jar'
,'spring-tx':'spring-tx-4.3.29.RELEASE.jar'
,'spring-web':'spring-web-4.3.29.RELEASE.jar'
,'spring-webmvc':'spring-webmvc-4.3.29.RELEASE.jar'
,'spring-webmvc-portlet':'spring-webmvc-portlet-4.3.29.RELEASE.jar'
,'spring-websocket':'spring-websocket-4.3.29.RELEASE.jar'
}
def listJars():
    filenames=os.listdir(".")
    for f in filenames:
        if f.endswith('.jar'):
            replaceJar(f)

def replaceJar(jarName):
    #1.解压
    cmd = ('unzip -q %s -d test' % jarName)
    print(cmd)
    p = subprocess.Popen(cmd, shell=True)
    p.wait()

    #2.拷贝删除jar
    jars = os.listdir("./test/BOOT-INF/lib/")
    for jar in jars:
        pureJar = jar[0:jar.rindex('-')]
        if jarMap.has_key(pureJar):
            # print(jar)
            # print(pureJar)
            print("%s -> %s" % (jar, jarMap.get(pureJar)))
            os.remove("./test/BOOT-INF/lib/%s"%jar)
            copyfile("/Users/shawn/Downloads/spring-framework-4.3.29.RELEASE-dist/libs/%s"%jarMap.get(pureJar),
            "./test/BOOT-INF/lib/%s"%jarMap.get(pureJar))

    #3.重新压缩
    jarcmd = 'cd test && jar -cfM0 ../test2/%s ./' % jarName
    p2 = subprocess.Popen(jarcmd, shell=True)
    p2.wait()
    print("生成%s完成"%jarName)
    #4.清理test目录
    rmtree('./test')
if __name__ == '__main__':
    listJars()
    # replaceJar('account-all-1.7.0.jar')
    # jar = 'spring-aop'
    # pureJar = jar[0:jar.rindex('-')]
    # print(pureJar)

```

以上。