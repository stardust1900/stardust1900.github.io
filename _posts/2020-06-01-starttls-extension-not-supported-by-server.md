---
layout: post
title: "smtplib发送邮件报STARTTLS extension not supported by server"
# subtitle: ''
date: 2020-06-01
# cover: ""
category: 问题
tags: [python]
---

一直运行正常的发送报表程序，昨天突然报 “STARTTLS extension not supported by server”，不知道邮件服务器变更了什么配置。

搜了一下这个问题，stackoverflow上有问题的解决方式。[STARTTLS extension not supported by server](https://stackoverflow.com/questions/6355456/starttls-extension-not-supported-by-server?answertab=active)

测试了一下，去掉指定端口，可以发送成功。
把修改前后的代码贴一下，供遇到此问题的人参考：

```python
    try:
        smtpObj = smtplib.SMTP(mail_host,587)

        smtpObj.ehlo()
        smtpObj.starttls()
        smtpObj.ehlo
        smtpObj.login(mail_user,mail_pass)
        smtpObj.sendmail(sender, receivers+cc, message.as_string())
        print ("邮件发送成功")
        smtpObj.close()
    except smtplib.SMTPException as e :
        print ("Error: 无法发送邮件 ",e)
```

修改后：

```python
    try:
        smtpObj = smtplib.SMTP(mail_host)
        smtpObj.login(mail_user,mail_pass)
        smtpObj.sendmail(sender, receivers+cc, message.as_string())
        print ("邮件发送成功")
        smtpObj.close()
    except smtplib.SMTPException as e :
        print ("Error: 无法发送邮件 ",e)
```

以上。