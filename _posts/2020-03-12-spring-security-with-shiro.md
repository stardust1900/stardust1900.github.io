---
layout: post
title: "在spring security中使用shiro的加密验证方法"
date: 2020-03-12
cover: ""
category: Tech
tags: [spring security,shiro]
---
有个叫若依的后台管理框架挺流行的，我们也在用。经过一段时间发展，若依有了两个版本，前后端分离和未分离版本，前一个版本用的是spring security验证框架，后一个用的是shiro。

有时候我们需要跟若依共用数据库搭建springboot服务，之前用jwt+spring security搭建过，所以拿过来直接用，用的时候发现问题，登录总是失败无法获取token。定位半天才发现，这个老版本的若依用的是shiro。于是，问题来了，怎么在现有的工程中，改动最少，把spring security 的验证方法改成shiro的验证方法(MD5加盐)？

从AuthenticationManager.authenticate,这个入口开始，一步一步看源码，不过spring的代码代理来注入去，看着让人头大，很难把整个流程理清楚，所以也很难找到切入点。直到看到 DaoAuthenticationProvider 这个类的时候才豁然开朗。
![DaoAuthenticationProvider](/pic/snapshot/20200312/1.jpg)
密码验证是在这里做的，我只要照着DaoAuthenticationProvider写一个实现类替换它就行了。

```java
import org.apache.shiro.crypto.hash.Md5Hash;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.AbstractUserDetailsAuthenticationProvider;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import com.xxxxxx.data.board.model.UserDetail;


public class DaoAuthenticationProvider extends AbstractUserDetailsAuthenticationProvider{

	private UserDetailsService userDetailsService;
	
	public DaoAuthenticationProvider(UserDetailsService userDetailsService) {
		this.userDetailsService = userDetailsService;
	}
	
	@Override
	protected void additionalAuthenticationChecks(UserDetails userDetails,
			UsernamePasswordAuthenticationToken authentication) throws AuthenticationException {
		if (authentication.getCredentials() == null) {
			logger.debug("Authentication failed: no credentials provided");

			throw new BadCredentialsException(messages.getMessage(
					"AbstractUserDetailsAuthenticationProvider.badCredentials",
					"Bad credentials"));
		}
		String newPassword = authentication.getCredentials().toString();
		
		if (!matches((UserDetail)userDetails, newPassword)) {
			logger.debug("Authentication failed: password does not match stored value");
			throw new BadCredentialsException(messages.getMessage(
					"AbstractUserDetailsAuthenticationProvider.badCredentials",
					"Bad credentials"));
		}
		
	}

	public boolean matches(UserDetail userDetail, String newPassword) {
        return userDetail.getPassword().equals(encryptPassword(userDetail.getUsername(), newPassword, userDetail.getSalt()));
    }
 
	public String encryptPassword(String username, String password, String salt) {
        return new Md5Hash(username + password + salt).toHex().toString();
    }
	
	@Override
	protected UserDetails retrieveUser(String username, UsernamePasswordAuthenticationToken authentication)
			throws AuthenticationException {
		UserDetails loadedUser = this.userDetailsService.loadUserByUsername(username);
		if (loadedUser == null) {
			throw new InternalAuthenticationServiceException(
					"UserDetailsService returned null, which is an interface contract violation");
		}
		return loadedUser;
	}

}

```

然后要做的就是修改 WebSecurityConfig 将新的实现类注入

![WebSecurityConfig](/pic/snapshot/20200312/2.png)

如此就把spring security 的 BCrypt方式加密 替换成了 shiro 的MD5加盐方式加密。
