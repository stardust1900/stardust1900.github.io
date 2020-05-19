---
layout: post
title: "使用python读取mysql数据生成excel并通过email发送"
date: 2020-05-18
cover: ""
category: 技术
tags: [python]
---
之前做了一个给领导发送每日报表的小工具，现在我把业务相关信息去掉，将实现过程记录一下，供需要的人做参考。因为功能比较简单，对初学python的人来说也是个练手的好例子。

1. 环境准备

    安装python3，我的python版本是3.7.0，安装3.0以上的应该都可以

    安装依赖

    python3 -m pip install PyMySQL （python连mysql驱动）

    python3 -m pip install --upgrade pandas （python数据分析库）

    python3 -m pip install SQLAlchemy （python orm 框架）

    python3 -m pip install openpyxl （python的excel工具库)（也可以用[XlsxWriter](https://xlsxwriter.readthedocs.io/index.html)）

2. 创建测试表并插入数据

    ```sql
    CREATE TABLE `t_movie` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `title` varchar(50) DEFAULT NULL,
        `release_date` date DEFAULT NULL,
        `director` varchar(100) DEFAULT NULL,
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

    INSERT INTO t_movie (id, title, release_date, director) VALUES (1, '肖申克的救赎', '1994-09-10', '弗兰克·德拉邦特');
    INSERT INTO t_movie (id, title, release_date, director) VALUES (2, '霸王别姬', '1993-01-01', '陈凯歌');
    INSERT INTO t_movie (id, title, release_date, director) VALUES (3, '阿甘正传', '1994-06-23', '罗伯特·泽米吉斯');
    INSERT INTO t_movie (id, title, release_date, director) VALUES (4, '这个杀手不太冷', '1994-09-14', '吕克·贝松');
    INSERT INTO t_movie (id, title, release_date, director) VALUES (5, '美丽人生', '1997-12-20', '罗伯托·贝尼尼');
    ```

3. 写python 代码 导出excel 文件

    ```python
    from sqlalchemy import create_engine
    import pandas as pd

    if __name__ == "__main__":
        engine = create_engine('mysql+pymysql://wishes:wishes@127.0.0.1:3306/wishes')  #连接mysql 

        sql = ''' select * from t_movie; '''  #查询表数据sql
        df = pd.read_sql_query(sql, engine)   #将数据读取到pandas dataframe

        df.to_excel('movie.xlsx')  # 导出数据到文件

    ```

    将上面代码保存为exportMovie.py 在文件所在目录执行 python3 exportMovie.py

    同目录下会生成movie.xlsx，打开看一下

    [<img src="/pic/snapshot/20200518/1.jpg"  />](/pic/snapshot/20200518/1.jpg)

    我们把第一列的序号去掉，然后加个表头

    ```python
    from sqlalchemy import create_engine
    import pandas as pd

    if __name__ == "__main__":
        engine = create_engine('mysql+pymysql://wishes:wishes@127.0.0.1:3306/wishes')  #连接mysql 

        sql = ''' select * from t_movie; '''  #查询表数据sql
        df = pd.read_sql_query(sql, engine)   #将数据读取到pandas dataframe

        df.columns = ['ID','片名','上映日','导演'] # 表头
        df.to_excel('movie.xlsx', index=False)  # 导出数据到文件  去掉索引列

    ```

    现在生成的文件是这样的：

    [<img src="/pic/snapshot/20200518/2.jpg"  />](/pic/snapshot/20200518/2.jpg)

    默认列宽太窄了，我们改宽一点

    ```python
    from sqlalchemy import create_engine
    import pandas as pd

    if __name__ == "__main__":
        engine = create_engine('mysql+pymysql://wishes:wishes@127.0.0.1:3306/wishes')  #连接mysql 

        sql = ''' select * from t_movie; '''  #查询表数据sql
        df = pd.read_sql_query(sql, engine)   #将数据读取到pandas dataframe

        df.columns = ['ID','片名','上映日','导演'] # 表头
        # df.to_excel('movie.xlsx',index=False)  # 导出数据到文件  去掉索引列
        writer = pd.ExcelWriter('movie.xlsx')  # 获取writer
        worksheets = writer.sheets             # 获取sheet
        df.to_excel(writer, sheet_name='Sheet1',index=False) #导出数据到文件  指定sheet名称 去掉索引列
        sheet1 = worksheets['Sheet1']
        # sheet1.column_dimensions['A'].width = 20
        sheet1.column_dimensions['B'].width = 20
        sheet1.column_dimensions['C'].width = 10
        sheet1.column_dimensions['D'].width = 20

        writer.save()
        writer.close()

    ```

    现在生成的文件是这样：

    [<img src="/pic/snapshot/20200518/3.jpg"  />](/pic/snapshot/20200518/3.jpg)

4. 发送文件

    我们新创建一个发送邮件的工具mailTool.py
    
    ```python
    #!/usr/local/bin/python3
    # -*- coding: UTF-8 -*-

    import base64
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    from email.header import Header
    from email.mime.application import MIMEApplication
    from email.mime.base import MIMEBase  
    from email import encoders  # 中文文件名乱码问题

    def send_report(fileName):
         # 第三方 SMTP 服务
        mail_host="mail.xxxx.com"  #设置服务器
        mail_user="user"    #用户名
        mail_pass="password"   #口令 

        sender = 'xxxx@xxx.com'  # 发送者
        receivers = ['aaaa@aaaa.com'] # 接收者

        #创建一个带附件的实例
        message = MIMEMultipart()

        message['From'] = sender
        message['To'] = ",".join(receivers)

        # 邮件标题
        subject = '标题标题'
        message['Subject'] = Header(subject, 'utf-8')

        # 邮件正文内容
        message.attach(MIMEText('正文正文正文‘, 'plain', 'utf-8'))

        #添加附件
        att1 = MIMEBase('application', 'octet-stream')
        att1.set_payload(open(fileName), 'rb').read())

        #这个是为了处理在手机端文件名为中文无法打开的问题
        att1.add_header('Content-Disposition', 'attachment', filename= '=?utf-8?b?' + str(base64.b64encode(f1.encode('utf-8')),'utf-8') + '?=')
        encoders.encode_base64(att1)
        
        message.attach(att1)

        #发送邮件
        try:
            smtpObj = smtplib.SMTP(mail_host,587) 
            # smtpObj = smtplib.SMTP_SSL(host=mail_host)
            # smtpObj.connect(mail_host, 587)    # 587 为 SMTP 端口号
            smtpObj.ehlo()
            smtpObj.starttls()
            smtpObj.ehlo
            smtpObj.login(mail_user,mail_pass)  
            smtpObj.sendmail(sender, receivers, message.as_string())
            print ("邮件发送成功")
            smtpObj.close()
        except smtplib.SMTPException as e :
            print ("Error: 无法发送邮件 ",e)

    ```


    引入工具类发送文件：

    ```python
    from sqlalchemy import create_engine
    import pandas as pd

    if __name__ == "__main__":
        engine = create_engine('mysql+pymysql://wishes:wishes@127.0.0.1:3306/wishes')  #连接mysql 

        sql = ''' select * from t_movie; '''  #查询表数据sql
        df = pd.read_sql_query(sql, engine)   #将数据读取到pandas dataframe

        df.columns = ['ID','片名','上映日','导演'] # 表头
        # df.to_excel('movie.xlsx',index=False)  # 导出数据到文件  去掉索引列
        writer = pd.ExcelWriter('movie.xlsx')  # 获取writer
        worksheets = writer.sheets             # 获取sheet
        df.to_excel(writer, sheet_name='Sheet1',index=False) #导出数据到文件  指定sheet名称 去掉索引列
        sheet1 = worksheets['Sheet1']
        # sheet1.column_dimensions['A'].width = 20
        sheet1.column_dimensions['B'].width = 20
        sheet1.column_dimensions['C'].width = 10
        sheet1.column_dimensions['D'].width = 20

        writer.save()
        writer.close()

        #引入工具类
        from mailTool import send_report
        #发送文件
        send_report('movie.xlsx')

    ```

以上
