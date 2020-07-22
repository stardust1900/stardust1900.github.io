---
layout: post
title: "aop方法调用多次的问题"
date: 2020-07-22
category: 技术
tags: [spirng aop]
---

这两天接手一个老项目，是一个springboot工程打成war包运行在tomcat容器里的项目，开发过程中发现一个用aop切面打印的日志一直都是打印两次。

日志切面类如下:

``` java 
    @Aspect
    @Component
    @Slf4j
    public class LogRecordAspect {
        @Around("execution(* com.sharebenefit.web.controller.*.*(..))")
        public Object logAround(ProceedingJoinPoint joinPoint) {
            log.info("logAround开始:[{}] 参数为:{}", joinPoint.getTarget().getClass().getName() + "." + joinPoint.getSignature().getName(), joinPoint.getArgs()); //方法执行前的代理处理
            try {
                long startTime = System.currentTimeMillis();
                Object obj = joinPoint.proceed(joinPoint.getArgs());
                long usedTime = System.currentTimeMillis() - startTime;
                log.info("logAround结束:现在时间是:{} -> 处理用时:{}ms -> 返回为:{}", new Date(), usedTime, JSON.toJSONString(obj));  //方法执行后的代理处理
                return obj;
            } catch (ServiceException ex) {
                log.error("业务异常", ex);
            } catch (Throwable e) {
                log.error("系统异常", e);
            }
        }
    }
```

一开始以为是@Around注解的问题，但是我使用@BeforeMethod 注解 发现也是执行两次。

在网上搜到了这篇文章[aop执行两次的原因](https://blog.csdn.net/lands92/article/details/79003282)，于是怀疑我遇到的问题也是初始化了多个前面实例导致的。于是在切面类中加了一句日志：

``` java 
    @Aspect
    @Component
    @Slf4j
    public class LogRecordAspect {
        @Around("execution(* com.sharebenefit.web.controller.*.*(..))")
        public Object logAround(ProceedingJoinPoint joinPoint) {
            log.info("LogRecordAspect:{}",this);  //<---- 这是增加的日志
            log.info("logAround开始:[{}] 参数为:{}", joinPoint.getTarget().getClass().getName() + "." + joinPoint.getSignature().getName(), joinPoint.getArgs()); //方法执行前的代理处理
            try {
                long startTime = System.currentTimeMillis();
                Object obj = joinPoint.proceed(joinPoint.getArgs());
                long usedTime = System.currentTimeMillis() - startTime;
                log.info("logAround结束:现在时间是:{} -> 处理用时:{}ms -> 返回为:{}", new Date(), usedTime, JSON.toJSONString(obj));  //方法执行后的代理处理
                return obj;
            } catch (ServiceException ex) {
                log.error("业务异常", ex);
            } catch (Throwable e) {
                log.error("系统异常", e);
            }
        }
    }
```

重新执行后日志如下：

[<img src="/pic/snapshot/20200722/1.png"  />](/pic/snapshot/20200722/1.png)

可见，的确是初始化了两个实例。

查看 application.xml 发现也使用了 context:component-scan 标签。

问题定位！

解决方法是：在@Component 中指定bean的名称，这样spring就只初始化一个实例了。

``` java 
@Aspect
@Component(value="logRecordAspect") //<-- 指定实例名称
@Slf4j
public class LogRecordAspect {
    @Around("execution(* com.sharebenefit.web.controller.*.*(..))")
    public Object logAround(ProceedingJoinPoint joinPoint) {
        log.info("logAround开始:[{}] 参数为:{}", joinPoint.getTarget().getClass().getName() + "." + joinPoint.getSignature().getName(), joinPoint.getArgs()); //方法执行前的代理处理
        try {
            long startTime = System.currentTimeMillis();
            Object obj = joinPoint.proceed(joinPoint.getArgs());
            long usedTime = System.currentTimeMillis() - startTime;
            log.info("logAround结束:现在时间是:{} -> 处理用时:{}ms -> 返回为:{}", new Date(), usedTime, JSON.toJSONString(obj));  //方法执行后的代理处理
            return obj;
        } catch (ServiceException ex) {
            log.error("业务异常", ex);
            return new CommonResponse(ex.getErrorCode(), ex.getMessage(), null);
        } catch (Throwable e) {
            log.error("系统异常", e);
            return new CommonResponse(ErrorCode.SYS_ERR.getCode(), "系统异常，请稍后再试!", e.getMessage());
        }
    }
}
```

查看日志
[<img src="/pic/snapshot/20200722/2.png"  />](/pic/snapshot/20200722/2.png)

问题解决，以上。