---
layout: post
title: 使用jasypt对springboot配置信息加密
date: 2023-11-23
category: Tech
tags: [jasypt,springboot]
---

###    1.pom文件增加依赖


``` xml 
        <dependency>
		        <groupId>com.github.ulisesbocchio</groupId>
		        <artifactId>jasypt-spring-boot-starter</artifactId>
		        <version>3.0.5</version>
		</dependency>
```

###    2.修改启动类增加StringEncryptor实现

jasypt密码可以放到配置文件或者启动命令中，与其这样不如直接写到代码里

``` java 

    @Primary
    @Bean("jasyptStringEncryptor")
    public StringEncryptor stringEncryptor() {
        PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
        SimpleStringPBEConfig config = new SimpleStringPBEConfig();
        config.setPassword("xxxx");//这里改成你的密码
        config.setAlgorithm("PBEWITHHMACSHA512ANDAES_256");
        config.setKeyObtentionIterations("1000");
        config.setPoolSize("1");
        config.setProviderName("SunJCE");
        config.setSaltGeneratorClassName("org.jasypt.salt.RandomSaltGenerator");
        config.setIvGeneratorClassName("org.jasypt.iv.RandomIvGenerator");
        config.setStringOutputType("base64");
        encryptor.setConfig(config);
        return encryptor;
    }

```

注意：上面的@Primary 注解必须加上，覆盖默认实现。

###    3.本地写一个加密类，对你要加密的敏感信息加密

``` java
import org.jasypt.encryption.pbe.PooledPBEStringEncryptor;
import org.jasypt.encryption.pbe.config.SimpleStringPBEConfig;

public class JasyptTest {

	public static void main(String[] args) {
		PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
        SimpleStringPBEConfig config = new SimpleStringPBEConfig();
        config.setPassword("xxxx");//改成你的密码
        config.setAlgorithm("PBEWITHHMACSHA512ANDAES_256");
        config.setKeyObtentionIterations("1000");
        config.setPoolSize("1");
        config.setProviderName("SunJCE");
        config.setSaltGeneratorClassName("org.jasypt.salt.RandomSaltGenerator");
        config.setIvGeneratorClassName("org.jasypt.iv.RandomIvGenerator");
        config.setStringOutputType("base64");
        encryptor.setConfig(config);
        
        String originStr = "xxxx" ;//原始字符串
        String encStr = encryptor.encrypt(originStr);
        System.out.println("originStr encrypt is {}"+ encStr);//加密后的字符串，这个贴到配置文件中
        System.out.println("originStr is {}"+ encryptor.decrypt(encStr));//验证一下解密

	}

}
```

###    4.修改配置文件

将加密后的信息用前面用 ENC( ) 包起来

例如：

原始配置：

``` java
spring.datascoure.password=yourpassword
```
改成：

``` java
spring.datascoure.password=ENC(JL2t1CZpj+cTQ30IFKu0lkoZCVpYbVIhLm1MRbBpaNI])
```

(完)

参考:

[1] [https://zhuanlan.zhihu.com/p/480828512](https://zhuanlan.zhihu.com/p/480828512)

[2] [https://github.com/ulisesbocchio/jasypt-spring-boot](https://github.com/ulisesbocchio/jasypt-spring-boot)