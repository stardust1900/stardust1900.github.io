---
layout: post
title: "价值区间策略回测"
subtitle: '使用优矿对价值区间策略进行回测'
date: 2020-12-08
category: 技术
tags: [量化, 优矿]
---

前两天用小程序实现了一个我构想的简单策略-->[“价值区间策略”](http://wangxuan.me/%E6%8A%80%E6%9C%AF/2020/12/07/value-range-strategy-implements-by-mini-program.html)

那么，如果使用这个策略做量化投资的话，会有怎样的效果？我们可以做个回测看一下。为了方便，我使用优矿的策略工具来做。回测的过程分为四步：确定选股策略，获取价值区间，确定买入卖出策略和查看回测结果。

*1. 确定选股策略*

选股是影响回测结果的关键，我们知道这个策略对周期性股票效果会好一点，所以我尽量选择周期性的股票。但是，什么样特征的股票是周期性股票呢？这个很难说。我使用最简单的指标来选：上市时间长，市值比较大。最终我决定选上市10年以上(为了留最近两年时间的数据做回测，我选择2008年之前的)，市值超过100亿的。A股符合这个条件的股票有400只左右，我们从中随机选5只放入股票池。

为了调用方便，我在优矿里创建了lib函数，供回测策略的时候使用。

``` python
def getStocks(num):
    stocklist = DataAPI.EquGet(secID=u"",ticker=u"",equTypeCD=u"A",listStatusCD=u"L",field=u"",pandas="1")
    test= stocklist[(stocklist['listDate']<'2008-01-01') & (stocklist['TShEquity']>10000000000)]
    sample = test.sample(n=num)
    return sample
```

上面的代码就是选取2008年1月1号之前上市并且市值超过100亿的股票，然后从结果中随机选取样本，样本数由传入的参数决定。

*2. 获取价值区间*

获取价值区间的代码我之前就写好了，拷贝过来稍作修改就可以了，这个也封装成一个lib函数，回测的时候调用。

``` python
import math
import numpy as np

def getValueZone(secID,ticker,beginDate,endDate,znum):
    datas = DataAPI.MktEqudGet(secID=secID,ticker=ticker,tradeDate=u"",beginDate=beginDate,
                    endDate=endDate,field=u"tradeDate,closePrice",pandas="1")
    max = datas['closePrice'].max()
    min = datas['closePrice'].min()
    gap = (max-min)/znum
    begin = min
    end = min + gap
    
    prices = []

    while end <= max:
        if round(end,2) == round(max,2):
            # print("[ %s,%s]" % (begin,end))
            prices.append("[%s,%s]" % (begin,end))
        else:
            # print("[ %s,%s)" % (begin,end))
            prices.append("[%s,%s)" % (begin,end))
        begin = end
        end = end + gap
    if round(begin,2) != round(max,2):
        prices.append("[%s,%s]" % (begin,max))
        
    zones = []
    for i in range(0,znum):
        zones.append(0)
    
    for index,row in datas.iterrows():
        #向上取整
        flag = int(math.ceil((row['closePrice']-min)/gap))
        zones[flag-1] = zones[flag-1] +1
    
    maxIndex = 0
    for i in range(0,znum):
        if(zones[maxIndex] < zones[i]):
            maxIndex = i
            
    return (prices[maxIndex],zones[maxIndex])
```

*3. 确定买入卖出策略*

价值区间策略，简单的说就是在价值区间之下买入，在价值区间之上卖出。但是，之下多少，之上又多少？这个也很难找一个确定。我的选择是：只要低于价值区间的低值就买入，高出价值区间的高值30%时卖出。

``` python
        curprice = context.current_price(stock) #获取当前价
        # print("low: %s, high: %s, curprice: %s" % (low,high,curprice))
        # 低于低价时买入
        if curprice <= low and stock_account.cash >= curprice * 10000:
            stock_account.order(stock,10000)
            print('buy %s %d'% (stock,curprice * 10000))
        
        position = stock_account.get_position(stock)
            # 高于高价30%时卖出
        if position and position.available_amount > 0 and curprice >= high*(1+0.3):
            stock_account.order(stock,-10000)
            print('sell %s ' % stock)
```

代码中我每次买入卖出都是100手也就是10000股。

完整的策略代码如下：

``` python
import lib.utils as utils  
import numpy as np

# 选股
sample = utils.getStocks(5)
print(sample[['secID','secShortName']])
universe = np.array(sample['secID']).tolist()
print(universe)


start = '2019-12-01'                       # 回测起始时间
end = '2020-12-03'                         # 回测结束时间
benchmark = 'HS300'                        # 策略参考标准
freq = 'd'                                 # 策略类型，'d'表示日间策略使用日线回测，'m'表示日内策略使用分钟线回测
refresh_rate = 1                # 调仓频率，表示执行handle_data的时间间隔，若freq = 'd'时间间隔的单位为交易日，若freq = 'm'时间间隔为分钟

# 股票账号，初始资金是1000万
accounts = {
    'fantasy_account': AccountConfig(account_type='security', capital_base=10000000)
}
def initialize(context):                   # 初始化虚拟账户状态
    print 'initialize',context

def handle_data(context):  # 每个交易日的买入卖出指令
    stockList = context.get_universe()
    # print(stockList)
    today = context.current_date
    fiveYeasAgo = today.replace(year = today.year -5)
    # print("%s , %s" % (today.strftime('%Y%m%d'),threeYeasAgo.strftime('%Y%m%d')))
    strToday = today.strftime('%Y%m%d')
    str5yearsAgo = fiveYeasAgo.strftime('%Y%m%d')
    
    stock_account = context.get_account('fantasy_account')
    
    for stock in stockList:
        # 获取价值区间  获取的是5年内的数据
        result = utils.getValueZone(secID=stock,ticker="",beginDate=str5yearsAgo,endDate=strToday,znum=10)
        array = result[0][1:-1].split(",")
        low = float(array[0]) #获取低价
        high = float(array[1]) #获取高价
        curprice = context.current_price(stock) #获取当前价
        # print("low: %s, high: %s, curprice: %s" % (low,high,curprice))
        # 低于低价时买入
        if curprice <= low and stock_account.cash >= curprice * 10000:
            stock_account.order(stock,10000)
            print('buy %s %d'% (stock,curprice * 10000))
        
        position = stock_account.get_position(stock)
            # 高于高价30%时卖出
        if position and position.available_amount > 0 and curprice >= high*(1+0.3):
            stock_account.order(stock,-10000)
            print('sell %s ' % stock)
        
    return
```

*4. 进行回测*

在优矿中运行策略，因为选股是随机的，每次回测的结果也不一样。

当股票池中股票为以下五只时：

600755.XSHG         厦门国贸
600508.XSHG         上海能源
600037.XSHG         歌华有线
600339.XSHG         中油工程
600699.XSHG         均胜电子

回测结果如下：

![backtesting](/pic/snapshot/20201208/backtesting.png)

以上。

参考：

[https://uqer.datayes.com/help/faq/](https://uqer.datayes.com/help/faq/)

