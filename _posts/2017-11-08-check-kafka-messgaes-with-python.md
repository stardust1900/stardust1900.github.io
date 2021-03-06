---
layout: post
title: "检查kafka消息的消费状态"
author: 王一刀
category: 技术
tags: [python,kafka]
---

通过kafka自带的kafka-run-class.sh工具可以检查某一group下consumer消费消息的状态
```bash
./kafka-run-class.sh kafka.tools.ConsumerOffsetChecker --zookeeper xx.xx.xx.xx:2181,xx.xx.xx.xx:2181 --group xxx
```
执行结果会列出所有消费者组的所有信息，包括Group(消费者组)、Topic、Pid(分区id)、Offset(当前已消费的条数)、LogSize(总条数)、Lag(未消费的条数)、Owner


通过kafka-consumer-groups.sh 可以列出所有consumer的group

```bash
./kafka-consumer-groups.sh --zookeeper xx.xx.xx.xx:2181,xx.xx.xx.xx:2181 --list
```

如果group很多的话，一句一句执行命令会很麻烦，可以用python脚本调用命令过滤关心的group。

比如下面的脚本就是检查所有以"com-thfund-"开头的group里是否有未消费的消息,如果有，打印出来并写到checkresult.log文件中

```python
import subprocess
zkurl = "10.88.64.21:2181,10.88.64.22:2181,10.88.64.23:2181"
# zkurl = "10.2.209.35:2181,10.2.209.36:2181,10.2.209.37:2181"
cmd1 = ["/app/thfd/comm/kafka_2.11-0.9.0.0/bin/kafka-consumer-groups.sh", "--zookeeper", zkurl, "--list "]
child1 = subprocess.Popen(cmd1,stdout=subprocess.PIPE)
result = open("checkresult.log","w")
for line1 in child1.stdout.readlines():
    if line1.startswith("com-thfund-"):
        cmd2 = ["/app/thfd/comm/kafka_2.11-0.9.0.0/bin/kafka-run-class.sh", "kafka.tools.ConsumerOffsetChecker", "--zookeeper", zkurl, "--group" ]
        cmd2.append(line1.strip("\n"))
        # print line1
        child2 = subprocess.Popen(cmd2,stdout=subprocess.PIPE)
        data = child2.stdout
        line_num=0
        breakflag = False
        for line2 in data.readlines():
            line_num +=1
            if line_num != 1 :
                lag = line2.strip("\n").split()[5]
                # print("lag: %s" % lag)
                if lag !='unknown' and int(lag) > 0:
                    print("group: %s, lag: %s" % (line1.strip("\n"),lag))
                    result.write("group: %s, lag: %s\n" % (line1.strip("\n"),lag))
                    # breakflag = True
                    # break
        # if breakflag:
        #   break
result.close()
```