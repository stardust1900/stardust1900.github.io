---
layout: post
title: "小程序实现价值区间策略"
date: 2020-12-07
cover: ""
category: 技术
tags: [小程序,量化]
---
所谓价值区间策略是指:
查找一段时间内（1年，3年或5年）某只股票收盘价的最高和最低价，把最低到最高价等分为5个或10个区间，统计收盘价落在各区间的次数。次数最多的区间为价值区间。

操作方式:
如果当前股价在价值区间之下，买入；
在价值区间之上，卖出。


这个策略很简单，实现方式也不复杂。并且，我用的全都是免费资源：小程序云开发的数据库，weui组件，we-chars图形组件和tushare接口

用到了we-charts来画柱状图（画出来的虽然比较难看...）

用tushare接口来获取数据。

实现过程主要分两步：

*1. 查询股票*

可以通过tushare的股票列表来查询股票。但是这里有个问题：

这个接口不能直接用来查单只股票，因为用户不知道所要查寻股票的ts_code.而且每次都调接口查，消耗太多的接口查询次数。我用的方法是：外面写程序调用接口，然后导入到小程序的云开发的数据库里。

调tushare接口导出股票列表的代码如下：

``` python

import tushare as ts
print(ts.__version__)
ts.set_token('xxxxxxx')
pro = ts.pro_api()
pro = ts.pro_api('xxxxx')
data = pro.query('stock_basic', exchange='', list_status='L', fields='ts_code,symbol,name,area,industry,list_date')

print(type(data))
data.to_csv('stocks.csv')

```

因为很多股票的代码是00000开头的，比如平安银行 000001，这样直接倒入到小程序云数据库里的变化，编码直接变成1了。我们要对股票编码做个处理：加个引号。

``` python
import pandas as pd

df = pd.read_csv('stocks.csv',dtype={"symbol": str})

print(df.head())
print(df.columns)
print(df[0:0])

# print(df.loc[:, ['ts_code', 'symbol']])

df2 = df.loc[:, ['ts_code', 'symbol','name']]
df2['symbol']=df2['symbol'].apply(lambda x: "'"+x+"'")
print(df2.head())
df2.to_csv("test.csv",index=False)
```

将test.csv 直接导入到小程序云数据库就可以了，虽然股票编码是带引号的，但是对于后面的搜索没什么影响，展示的时候也可以把引号替换掉。


导入完成后，可以用正则表达式，对股票编码和名称进行模糊查询

查询结果中，把股票编码的引号替换掉。

``` javascript
db.collection('stocks').where(_.or([
        {
          name: db.RegExp({
            regexp: value,
            options: 'i',
          })
        },
        {
          symbol: db.RegExp({
                regexp: value,
                options: 'i',
              })
        }
      ])).limit(5).get({
        success: function (res) {
          console.log(res)
          var result = new Array();
          for(let record of res.data) {
            result.push({text:record.symbol.replace(/'/g,"")+record.name,value:record.ts_code});
          }
          console.log(result)
        }
      });
```

*2. 查询股票收盘价，做分组和统计*

选定股票以后，拿到ts_code,就可以调用tushare接口，查询行情信息。

``` javascript
wx.request({
      url: 'https://api.waditu.com', 
      data: {
        api_name: 'daily',
        token: 'xxxxx',
        //params:{"ts_code":ts_code,"trade_date":"20201111","start_date":"","end_date":""},
        params:{"ts_code":ts_code,"start_date":start_date,"end_date":end_date},
        fields:"ts_code,trade_date,close"
      },
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
        // 'content-type': 'application/x-www-form-urlencoded'
      },
      success (res) {
        var records = res.data.data.items;
        that.dealData(records);
      },
      fail(error) {
        console.log(error);
      }
    });
```

接下来就是，划分区域，统计次数了

``` javascript
dealData:function(records) {
        var min = records[0][2];
        var max = records[0][2];
        //先遍历一遍找出 最高和最低价
        for(let record of records) {
          var price = record[2];
          if(min > price) {
            min = price;
          }

          if(max < price) {
            max = price;
          }
        }
        console.log("min:"+min+" max:"+max);
        //计算每个区间的价格差
        var gap = Number(((max-min)/this.data.znum).toFixed(3));
        console.log("gap:"+gap);

        var zbegin = min;
        var zend = Number((min + gap).toFixed(3));
        var prices = new Array();
        console.log("zend:"+zend+" max:"+max+" "+(zend<max))
        //初始化价格区间
        while(zend < max ){
          prices.push("["+zbegin.toFixed(3)+","+zend.toFixed(3)+")");
          zbegin = zend;
          zend = Number((zend+gap).toFixed(3));
        }
        console.log("zbegin:"+zbegin);
        prices.push("["+zbegin.toFixed(3)+","+max.toFixed(3)+"]");
        console.log("prices:"+prices);
        var zones = new Array();
        console.log(records);
        //统计每个区间的次数
        for(let record of records) {
          var price = record[2];
          var flag = Math.ceil((price-min)/gap);
          if(flag == 0) {
            flag = 1;
          }
          var idx = flag -1;
        //  console.log("price:"+price+" flag:"+flag);
        //  console.log("zones["+idx+"] : "+zones[idx]);
          if(zones[idx]) {
            zones[idx] = zones[idx]+1;
          }else{
            zones[idx]= 1;
          }
        }
        console.log("zones:"+zones);
        this.setData({prices:prices,zones:zones});
        var maxTimes = zones[0];
        //获取最大次数
        for(var times of zones) {
          if(maxTimes<times) {
            maxTimes = times;
          }
        }
        this.setData({
          maxTimes:maxTimes
        })
        this.drawChart(prices,zones);
  }
```
至此，处理结束。

感兴趣的同学，可以扫下面的二维码体验一下。

![锡安斋](/pic/weixin/zion.jpg)

参考：

https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-sdk-api/database/Database.RegExp.html

https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-sdk-api/database/collection/Collection.where.html

https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-sdk-api/database/command/Command.or.html


https://waditu.com/document/2?doc_id=25

https://waditu.com/document/2?doc_id=27


以上。