---
layout: post
title: FastJson转Java对账字段不区分大小写
subtitle: ''
date: 2023-06-02
category: Tech
tags: [java,fastJson]
---

昨天遇到参数key大小写不一致导致校验签名失败的问题，查了很长时间才找到原因。看了一下FastJson源码，发现JSON.toObject中转换成对象的时候会忽略大小写。

所以，当使用了JSON.toObject将json转成Java对象后，再用JSON.toObject转成json，key值就变了。

写个方法验证一下：

``` java
public class Person {
	private String nickName;

	public String getNickName() {
		return nickName;
	}

	public void setNickName(String nickName) {
		this.nickName = nickName;
	}
	
}

```

``` java
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;

public class JsonToObject {

	public static void main(String[] args) {
		JSONObject json1 = new JSONObject();
		json1.put("nickName", "shawn1");
		System.out.println(json1);
		Person p1 = json1.toJavaObject(Person.class);
		System.out.println(p1.getNickName());
		JSONObject json11 = (JSONObject)JSON.toJSON(p1);
		System.out.println(json11);
		System.out.println("--------------------");
		
		JSONObject json2 = new JSONObject();
		json2.put("nickname", "shawn2");
		System.out.println(json2);
		json2.toJavaObject(Person.class);
		Person p2 = json2.toJavaObject(Person.class);
		System.out.println(p2.getNickName());
		JSONObject json22 = (JSONObject)JSON.toJSON(p2);
		System.out.println(json22);
		System.out.println("--------------------");
		
		JSONObject json3 = new JSONObject();
		json3.put("nIcknAme", "shawn3");
		System.out.println(json3);
		json3.toJavaObject(Person.class);
		Person p3 = json3.toJavaObject(Person.class);
		System.out.println(p3.getNickName());
		JSONObject json33 = (JSONObject)JSON.toJSON(p3);
		System.out.println(json33);
		System.out.println("--------------------");
	}	

}

```

输出：
``` shell
{"nickName":"shawn1"}
shawn1
{"nickName":"shawn1"}
--------------------
{"nickname":"shawn2"}
shawn2
{"nickName":"shawn2"}
--------------------
{"nIcknAme":"shawn3"}
shawn3
{"nickName":"shawn3"}
--------------------

```

JSON.toObject中转换成对象的时候忽略了大小写，可以增强健壮性，但Java类是区分大小写的，如果有两个仅仅带小写不同的属性，可能就出问题了。

给Person增加一个属性再试一下：

``` java
public class Person {
	private String nickName;

	public String getNickName() {
		return nickName;
	}

	public void setNickName(String nickName) {
		this.nickName = nickName;
	}
	
	private String nickname;

	public String getNickname() {
		return nickname;
	}

	public void setNickname(String nickname) {
		this.nickname = nickname;
	}
	
}
```

``` java

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;

public class JsonToObject {

	public static void main(String[] args) {
		JSONObject json1 = new JSONObject();
		json1.put("nickName", "shawn1");
		System.out.println(json1);
		Person p1 = json1.toJavaObject(Person.class);
		System.out.println("nickName:"+p1.getNickName()+"\t nickname:"+p1.getNickname());
		JSONObject json11 = (JSONObject)JSON.toJSON(p1);
		System.out.println(json11);
		System.out.println("--------------------");
		
		JSONObject json2 = new JSONObject();
		json2.put("nickname", "shawn2");
		System.out.println(json2);
		json2.toJavaObject(Person.class);
		Person p2 = json2.toJavaObject(Person.class);
		System.out.println("nickName:"+p2.getNickName()+"\t nickname:"+p2.getNickname());
		JSONObject json22 = (JSONObject)JSON.toJSON(p2);
		System.out.println(json22);
		System.out.println("--------------------");
		
		JSONObject json3 = new JSONObject();
		json3.put("nIcknAme", "shawn3");
		System.out.println(json3);
		json3.toJavaObject(Person.class);
		Person p3 = json3.toJavaObject(Person.class);
		System.out.println("nickName:"+p3.getNickName()+"\t nickname:"+p3.getNickname());
		JSONObject json33 = (JSONObject)JSON.toJSON(p3);
		System.out.println(json33);
		System.out.println("--------------------");
	}	

}
```

输出：

``` shell
{"nickName":"shawn1"}
nickName:shawn1	 nickname:null
{"nickName":"shawn1"}
--------------------
{"nickname":"shawn2"}
nickName:null	 nickname:shawn2
{"nickname":"shawn2"}
--------------------
{"nIcknAme":"shawn3"}
nickName:null	 nickname:shawn3
{"nickname":"shawn3"}
--------------------

```

这个结果符合你的预期吗？

所以，用JSON.toObject的时候还是的慎重。

以上。