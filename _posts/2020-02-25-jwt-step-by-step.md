---
layout: post
title: "jwt搭建springboot服务步骤"
subtitle: '一步一步使用jwt搭建springboot服务'
date: 2020-02-25
cover: ""
category: 技术
tags: [jwt,springboot]
---

之前通过参考 [SpringBoot集成SpringSecurity和JWT做登陆鉴权](https://www.jianshu.com/p/54603b9933ca) 搭建过一次。这两天需要搭建一个全新的，趁这个机会我把整个过程记录下来，供需要的人做参考。

1. 制作springboot模版工程

    登录 [https://start.spring.io/](https://start.spring.io/)
    现在(2020-2-25)springboot的最新发行版是2.2.4，但是生成以后，我把这个版本改成了饿2.1.1 因为于swagger2.9.2版本冲突导致无法启动工程。
    ![start](/pic/snapshot/20200225/1.png)

    输入工程名 描述 包名，jdk版本选8
    ![jdk](/pic/snapshot/20200225/2.png)

    依赖里暂时选这五个,有问题的话，后面可以在pom.xml文件中修改
    然后点击绿色按钮 下载工程
    ![jdk](/pic/snapshot/20200225/3.png)

2. 解压zip文件 导入到eclipse

    我的导入后有一个pom文件的Unknow问题
    需要在pom文件中的<properties>节点中加入<maven-jar-plugin.version>3.0.0</maven-jar-plugin.version>
    https://blog.csdn.net/weixin_42247563/article/details/100031885

    ![unknow](/pic/snapshot/20200225/4.png)

3. 修改pom文件

    增加依赖
  ```xml
    <dependency>
        <groupId>io.springfox</groupId>
        <artifactId>springfox-swagger2</artifactId>
        <version>2.9.2</version>
    </dependency>
    <dependency>
        <groupId>io.springfox</groupId>
        <artifactId>springfox-swagger-ui</artifactId>
        <version>2.9.2</version>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <!-- https://mvnrepository.com/artifact/org.springframework.security/spring-security-jwt -->
    <dependency>
        <groupId>org.springframework.security</groupId>
        <artifactId>spring-security-jwt</artifactId>
        <version>1.1.0.RELEASE</version>
    </dependency>
    <!-- https://mvnrepository.com/artifact/io.jsonwebtoken/jjwt -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt</artifactId>
        <version>0.9.1</version>
    </dependency>
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>fastjson</artifactId>
        <version>1.2.62</version>
    </dependency>
    <dependency>
        <groupId>org.apache.commons</groupId>
        <artifactId>commons-lang3</artifactId>
    </dependency>
    <!-- https://mvnrepository.com/artifact/com.github.pagehelper/pagehelper-spring-boot-starter -->
    <dependency>
        <groupId>com.github.pagehelper</groupId>
        <artifactId>pagehelper-spring-boot-starter</artifactId>
        <version>1.2.13</version>
    </dependency>
   ```

    修改build标签  剔除文件，修改最终打包的包名
  ```xml
    <build>
    <resources>
    <resource>
        <directory>src/main/java</directory>
        <!-- 包含 -->
        <includes>
            <include>**/*.xml</include>
        </includes>
        <!-- 排除 -->
        <excludes>
        </excludes>
    </resource>
    <resource>
        <directory>src/main/resources</directory>
        <filtering>true</filtering>
        <excludes>
            <exclude>template/*.**</exclude>
        </excludes>
    </resource>
    <resource>
        <directory>src/main/resources</directory>
        <filtering>false</filtering>
        <includes>
            <include>template/*.**</include>
        </includes>
    </resource>
    </resources>
    <plugins>
    <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
        <configuration>
            <executable>true</executable>
            <fork>true</fork>
        </configuration>
        <dependencies>
            <!--spring热部署 -->
            <dependency>
                <groupId>org.springframework</groupId>
                <artifactId>springloaded</artifactId>
                <version>1.2.8.RELEASE</version>
            </dependency>
        </dependencies>
    </plugin>
    <!—打包时剔除配置文件，将配置文件外置—>			
    <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-jar-plugin</artifactId>
        <configuration>
            <excludes>
                <exclude>**/application.properties</exclude>
            </excludes>
        </configuration>
    </plugin>
    </plugins>
    <finalName>board-service</finalName>
    </build>
   ```

4. 增加logback.xml配置文件

5. 修改application.properties 增加配置
  ```properties
    logging.level.com.xxxxxx=debug
    spring.application.name= board-service
    spring.datasource.url=jdbc:mysql:///p?useUnicode=true&characterEncoding=utf8&serverTimezone=GMT%2B8
    spring.datasource.username=xxxxxxjs
    spring.datasource.password=xxxxxxxx
    spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
    spring.datasource.max-idle=10
    spring.datasource.max-wait=10000
    spring.datasource.min-idle=5
    spring.datasource.initial-size=5
    server.port=8180
    #jwt 
    jwt.header=Authorization
    jwt.secret=mySecret
    #token 有效期一天
    jwt.expiration=86400
    #如果想要首尾加上空格，可以使用转义字符。
    #英文空格的unicode码是\u0020，中文空格的unicode码是\u3000
    jwt.tokenHead=Bearer 
    pagehelper.helperDialect=mysql
    pagehelper.reasonable=true
    pagehelper.supportMethodsArguments=true
    pagehelper.params=count=countSql
  ```
  
6. 创建model类

    在model包下 创建  User,Role , UserDetail 和  ResponseUserToken
    
    UserDetail 要实现 UserDetails接口
    ![model](/pic/snapshot/20200225/5.png)

7. 引入 JwtUtils 工具类

    token生成与校验的主要逻辑都在此类中，本例中token是保存在ConcurrentHashMap中，生产上可改为redis
    ![JwtUtils](/pic/snapshot/20200225/6.png)

8. 引入token认证filter

    在config包里引入JwtAuthenticationTokenFilter.java
    
    同时需要引入JwtAuthenticationEntryPoint 和 RestAuthenticationAccessDeniedHandler 修改http返回的status，使接口在认证失败和权限不足的时候仍然返回200，在返回的json报文中给出失败的原因

9. 引入安全认证配置 WebSecurityConfig

    在此类中声明可以匿名访问，以及无需安全认证的url
    ![WebSecurityConfig](/pic/snapshot/20200225/7.png)

10. 引入  CorsConfig 使服务允许跨域访问 

    (这步是可选的，解决跨域访问问题有很多种方法，这个只是一种)
    需要注意的是：还要同时修改 JwtAuthenticationEntryPoint 和  RestAuthenticationAccessDeniedHandler 解决认证失败和权限不足时的跨域问题。这个是在实际使用中遇到的问题。

11. 数据访问

    引入 AuthMapper.java 和  AuthMapper.xml
    ![AuthMapper](/pic/snapshot/20200225/8.png)
    涉及到的表有 sys_user,sys_user_role,sys_role

12. 引入认证服务接口和实现类

    AuthService 和  AuthServiceImpl  
    
    还要引入  CustomUserDetailsServiceImpl 作为spring  security 的实现类
    
    另外还要引入自定义异常  CustomException 

13. 引入认证controller
    
    AuthController

14. 修改 BoardServiceApplication

    增加注解，指定一个默认的配置文件加载路径(配置文件也可以在启动命令中指定)
    ![BoardServiceApplication](/pic/snapshot/20200225/9.png)
    配置文件的相关信息可参考springboot 官方文档
    ![springboot](/pic/snapshot/20200225/10.png)

以上就是搭建整个工程的全部经过。

启动工程 访问 http://localhost:8180/swagger-ui.html

整个工程的代码传到了github上[https://github.com/stardust1900/board-service](https://github.com/stardust1900/board-service)仅供参考。
