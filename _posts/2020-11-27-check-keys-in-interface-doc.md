---
layout: post
title: "检查接口文档与报文中的字段是否一致"
date: 2020-11-27
category: 技术
tags: [Java,JSONObject]
---

工作中在与合作方进行接口对接的时候，一般是先定接口文档，大家根据接口文档进行开发，开发完成后再做接口联调。有时候开发周期较长，需求发生变化，开发人员按照新的需求开发，文档没有同时更新，导致接口文档中定义的字段与接口报文中返回的字段不一致。当接口中字段比较多的时候，排查比较困难。我们可以通过程序来比较文档中字段和报文中字段，快速找到差异。

今天又遇到这种情况，我把我的代码记录下来了，供需要的人参考。

``` java
//以上是接口交互获取返回报文
String returnJson = "...";//接口返回的json字符串

JSONObject jb = JSONObject.parseObject(returnJson); //把字符串解析成json对象
Set<String> reportKeySet = new HashSet<String>(); // 保存报文中的字段key值
getAllKeys(jb,reportKeySet); //获取报文中的key值
Set<String> docKeySet =  parseTxt("keys.txt");//解析文档中的key 把文档中的字段复制到txt中，一行一个
compare(reportKeySet,docKeySet);

```
工具方法如下：

``` java
private void getAllKeys(JSONObject json,Set<String> keySet) {
    for(String key :json.keySet()) { 
        keySet.add(key);
        Object o = json.get(key);
        if(o instanceof JSONObject) {
            JSONObject node = (JSONObject) o;
            getAllKeys(node,keySet);
        }else if (o instanceof JSONArray) {
            System.out.println("key:"+key+" is JSONArray");
            JSONArray array = (JSONArray) o;
            for(Iterator<Object> it = array.iterator();it.hasNext();) {
                JSONObject node = (JSONObject)it.next();
                getAllKeys(node,keySet);
            }
        }
    }
}


private Set<String> parseTxt(String keyTxtPath) {
		File f = new File(keyTxtPath);
		BufferedReader br = null;
		Set<String> docKeySet = new HashSet<String>();
		try{
			br = new BufferedReader(new InputStreamReader(new FileInputStream(f)));
			String line = null;
			while ((line = br.readLine()) != null) {
				docKeySet.add(line);
			}
		}catch(Exception e){
			
		}finally{
			IOUtils.close(br);
		}
		return docKeySet;
		
	}

private void compare(Set<String> reportKeySet, Set<String> docKeySet) {
		System.out.println(docKeySet.size());
		for(Iterator<String> it = docKeySet.iterator();it.hasNext();) {
			String k = it.next();
			if(reportKeySet.contains(k)) {
				it.remove();
				reportKeySet.remove(k);
			}
		}
		
		System.out.println("report key left:");
		for(String key : reportKeySet) {
			System.out.println(key);
		}
		System.out.println("doc key left:");
		for(String key : docKeySet) {
			System.out.println(key);
		}
	}
```
需要注意的是：
1. 获取json对象中的key使用了递归调用函数
2. 比较两个Set中的key值时 要用迭代器遍历，把相同的删除，留下的就是不同的。


以上。