---
layout: post
title: "若依后管的多服务实现"
date: 2020-05-13
cover: ""
category: Tech
tags: [若依,springboot,代理,vue]
---

有时候我们需要多系统多数据库共用一个后管平台，让运维人员通过一个入口登录系统管理后台数据。后管系统用的是开源系统--若依，现在我需要对系统做改造，以满足管理多系统多数据库的需求。我们想到了两种方案：配置多数据源和使用代理。

我们选择了使用代理的方式，我记录一下怎么实现的，和实现过程中遇到的问题是如何解决的。

1. 配置代理

    修改若依原有的service

    引入org.mitre.dsmiley.httpproxy 

    在pom文件中增加依赖

    ```xml
    <dependency>
        <groupId>org.mitre.dsmiley.httpproxy</groupId>
        <artifactId>smiley-http-proxy-servlet</artifactId>
        <version>1.7</version>
    </dependency>
    ```

    application.yml中增加

    ```
    canislupus:
        proxy:
            servlet_url: /canislupus/*
            target_url: http://localhost:8883/canislupus
    ```

    访问/canislupus/* 的请求都会被转发

    增加代理类

    ```java 
    package com.ruoyi.framework.config.proxy;

    import java.util.Map;

    import javax.servlet.Servlet;

    import org.mitre.dsmiley.httpproxy.ProxyServlet;
    import org.springframework.beans.factory.annotation.Value;
    import org.springframework.boot.web.servlet.ServletRegistrationBean;
    import org.springframework.context.annotation.Bean;
    import org.springframework.context.annotation.Configuration;

    import com.google.common.collect.ImmutableMap;

    @Configuration
    public class CanislupusProxyServletConfiguration {

        @Value("${canislupus.proxy.servlet_url}")
        private String servletUrl;
        
        /**
        * 读取配置中代理目标地址
        */
        @Value("${canislupus.proxy.target_url}")
        private String targetUrl;
        
        @Bean
        public Servlet createProxyServlet(){
            // 创建新的ProxyServlet
            return new ProxyServlet();
        }
        
        @Bean
        public ServletRegistrationBean<Servlet> proxyServletRegistration(){
            ServletRegistrationBean<Servlet> registrationBean = new ServletRegistrationBean<Servlet>(createProxyServlet(), servletUrl);
            //设置网址以及参数
            Map<String, String> params = ImmutableMap.of(
                    "targetUri", targetUrl,
                    "log", "true");
            registrationBean.setInitParameters(params);
            registrationBean.setName("canislupus");
            return registrationBean;
        }

    }

    ```

    如果http://localhost:8883/canislupus 是可以访问的，

    访问http://host:port/canislupus 的时候请求会被转发，可以看到如下日志：

    ```
    canislupus: proxy GET uri: /canislupus/platform/convergepre/list -- http://localhost:8883/canislupus/platform/convergepre/list
    ```

2. 解决文件导出的问题

    若依的文件下载方式是在服务短生成文件，将文件名返回，通过共用的download方法接收文件名来下载文件。当后台是多服务的时候，因为文件生成在不同的机器上无法通过共用的download方法来下载。需要对export方法做改造，是方法返回流而不仅仅是文件名。

    ```java
    @PreAuthorize("@ss.hasPermi('platform:convergepre:export')")
        @Log(title = "平台列表", businessType = BusinessType.EXPORT)
        @GetMapping("/export")
        public void export(TlParamConvergepre tlParamConvergepre,HttpServletResponse response, HttpServletRequest request)
        {
            List<TlParamConvergepre> list = tlParamConvergepreService.selectTlParamConvergepreList(tlParamConvergepre);
            ExcelUtil<TlParamConvergepre> util = new ExcelUtil<TlParamConvergepre>(TlParamConvergepre.class);
            AjaxResult result = util.exportExcel(list, "convergepre");
            String fileName = String.valueOf(result.get("msg"));
            System.out.println(fileName);
            String realFileName = System.currentTimeMillis() + fileName.substring(fileName.indexOf("_") + 1);
            String filePath = RuoYiConfig.getDownloadPath() + fileName;

            response.setCharacterEncoding("utf-8");
            response.setContentType("multipart/form-data");
            try {
                response.setHeader("Content-Disposition",
                        "attachment;fileName=" + FileUtils.setFileDownloadHeader(request, realFileName));
                FileUtils.writeBytes(filePath, response.getOutputStream());
            } catch (UnsupportedEncodingException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            }
        
        }
    ```

    前端下载的时候需要通过接收流的方式来生成文件

    ```javascript
        if (getToken()) {
            var token = 'Bearer ' + getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
        }
        var url = '/dev-api/canislupus/platform/convergepre/export';
        console.log(url)
        axios.get(url,{
        responseType: 'blob',  //指定reponseType 为blog
        headers:{'Authorization':token}
        }).then(res => {
        let blob = res.data
        let reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onload = (e) => {
        let a = document.createElement('a')
        let fileName = decodeURI(res.headers['content-disposition'].split('fileName=')[1])
        a.download = fileName
        a.href = e.target.result
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        }
        })
    ```
    上面这个是网上搜到的标准写法。

    当使用若依封装的request的时候总是报错，排查了很长时间才发现是response拦截器的问题，因为返回流的时候没有data.code拦截器报错了。

    需要把request.js中的拦截器修改一下

    ```javascript
    // 响应拦截器
    service.interceptors.response.use(res => {
        //下面是增加的
        if(res.request.responseType) {
        console.log(res.request.responseType)
        if("blob" === res.request.responseType) {
            return res
        }
        }
        //上面是增加的
        const code = res.data.code
        if (code === 401) {
            MessageBox.confirm(
            '登录状态已过期，您可以继续留在该页面，或者重新登录',
            '系统提示',
            {
                confirmButtonText: '重新登录',
                cancelButtonText: '取消',
                type: 'warning'
            }
            ).then(() => {
            store.dispatch('LogOut').then(() => {
                location.reload() // 为了重新实例化vue-router对象 避免bug
            })
            })
        } else if (code !== 200) {
            Notification.error({
            title: res.data.msg
            })
            return Promise.reject('error')
        } else {
            return res.data
        }
    },
    error => {
        console.log('err' + error)
        Message({
        message: error.message,
        type: 'error',
        duration: 5 * 1000
        })
        return Promise.reject(error)
    }
    )
    ```

    生成的js中也需要把responseType加上

    ```javascript
    // 导出平台列表
    export function exportConvergepre(query) {
    var req = request({
        url: '/canislupus/platform/convergepre/export',
        method: 'get',
        responseType: 'blob',
        params: query
    });
    console.log(req);
    return req;
    }
    ```
    这样就可以实现文件导出了。

以上