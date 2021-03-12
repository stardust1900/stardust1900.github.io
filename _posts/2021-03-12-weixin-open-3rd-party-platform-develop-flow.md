---
layout: post
title: "微信开放平台第三方平台应用开发流程"
subtitle: '微信开放平台三方平台应用开发流程'
date: 2021-03-12
category: Tech
tags: [微信开放平台]
---

## 0.启动ticket推送服务

官方接口文档：

https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/api/component_verify_ticket_service.html

这个服务应该是默认启动的，可以调用接口确认一下：

``` bash
# 调用接口

curl -X POST "https://api.weixin.qq.com/cgi-bin/component/api_start_push_ticket" -H "accept: */*" -H "Content-Type: application/json" -d "{ \"component_appid\": \"wx43548a6703d7a56b\", \"component_secret\": \"dc2b36844f88b54b96d6e315e8fa1010\" }"

# 接口返回

{"errcode":0,"errmsg":"in a normal state"}

```




## 1.获取验证票据

验证票据（component_verify_ticket），在第三方平台创建审核通过后，微信服务器会向其 ”授权事件接收URL” 每隔 10 分钟以 POST 的方式推送 component_verify_ticket

官方接口：
https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/api/component_verify_ticket.html

接收推送代码:

``` java

@PostMapping("/notify")
    public String getComponentVeriryTicket(HttpServletRequest request,@RequestParam Map<String, String> params){
    	String encodingAESKey = "giaoao1111111111111111111111111111111111111";
		String token = "giaoao";
		String componentAppId = "wx43548a6703d7a56b";
		
    	 // 微信加密签名
        String msgSignature = request.getParameter("msg_signature");
        // 时间戳
        String timeStamp = request.getParameter("timestamp");
        // 随机数
        String nonce = request.getParameter("nonce");
        String encryptType = request.getParameter("encrypt_type");
        String signature = request.getParameter("signature");
        log.info("msgSignature:{} timeStamp:{},nonce:{},encryptType:{},signature:{}",msgSignature,timeStamp,nonce,encryptType,signature);
        // 从请求中读取整个post数据
        InputStream inputStream;
        String postData = null;
        try {
			inputStream = request.getInputStream();
			postData= IOUtils.toString(inputStream,"UTF-8");
			log.info("postData:{}",postData);
	        WXBizMsgCrypt wxBizMsgCrypt = new WXBizMsgCrypt(token,encodingAESKey,componentAppId);
	        String msg = wxBizMsgCrypt.decryptMsg(msgSignature, timeStamp, nonce, postData);
	        log.info("msg:{}",msg);
		} catch (IOException e) {
			log.error("",e);
		} catch (AesException e) {
			e.printStackTrace();
		}
      
    	return "success";
    }
```
获取报文后 要对报文进行揭秘操作，官方说明:https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/Message_Encryption/Technical_Plan.html

官方demo:https://wximg.gtimg.com/shake_tv/mpwiki/cryptoDemo.zip


异常 java.security.InvalidKeyException:illegal Key Size 的解决方案：

在官方网站下载 JCE 无限制权限策略文件
下载后解压，可以看到 local_policy.jar 和 US_export_policy.jar 以及 readme.txt，如果安装了 JRE，将两个 jar 文件放到%JRE_HOME%\lib\security 目录下覆盖原来的文件；如果安装了 JDK，将两个 jar 文件放到%JDK_HOME%\jre\lib\security 目录下覆盖原来文件

接收微信推送服务的报文如下：

``` log
 |postData:<xml>
    <AppId><![CDATA[wx43548a6703d7a56b]]></AppId>
    <Encrypt><![CDATA[mPRda2sAxx/6nuHxMtBSV/icd1VsCb5zHd8zfHAtCqS8vxbMMeXH5xUshAvvGHRB+UQeVWr+TZviY0TttFF5cjs28VEf6RuCHWHvMpFNF43xABgr8HtzzUIb5/O8JuLUoFxvQB7mk7ECxm1SuT4ZBIGr3if8Gxb2K0aJAzKhqfXedlUNRND5oqLAa3XuKjC4wQ1QgdQCziBK5xZq96o+gOLJRuC1hGwRXlpkGTKJ3RBdsHtZz6aTUg+PvGMl0dYLWPLUUK5qWd7nVUBndNtkJxqxIcQpLSbbN8ErCv8S/mhaW/Kc/PnG123SO9Cj1XKKWv/8RVMqbr9AvS51AdfCsTHwnRLwSPd047+G00s3NTPBbhDCfkgLUakSERIWAZfODKiwPSuQvvtOahQfG8BVXtV3Int/ZGVDg/94zExNotE8SVQ5hbbFoY9ZmsaoMUlQgnC6qNj6FTUuOgvtRd6RzA==]]></Encrypt>
</xml>

2021-03-12 09:30:04.218 [http-nio-8280-exec-5]-INFO  (com.allinpay.liveapp.retail.controller.HelloController:194)|msg:<xml><AppId><![CDATA[wx43548a6703d7a56b]]></AppId>
<CreateTime>1615512486</CreateTime>
<InfoType><![CDATA[component_verify_ticket]]></InfoType>
<ComponentVerifyTicket><![CDATA[ticket@@@O5aMkWQut6f1uxGpexkRwxl53LpEtHVKkuNnGTZ8e4lkrG0riuaCPY16HegOX-7R4d7NbDkoNJvQ3HxPmLTsZA]]></ComponentVerifyTicket>
</xml>

```

## 2.调用接口 获取 component_access_token：

官方文档：

https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/api/component_access_token.html

调用接口需要的参数：

    component_appid 在开放平台创建第三方应用后可以查到

    component_appsecret 这个在开放平台可以设置

    component_verify_ticket 就是上一步得到的

``` bash
# 调用接口
curl -X POST "https://api.weixin.qq.com/cgi-bin/component/api_component_token" -H "accept: */*" -H "Content-Type: application/json" -d "{ \"component_appid\":  \"wx111111111111\" , \"component_appsecret\":  \"xxxxxxxxxxxxxxxx\", \"component_verify_ticket\": \"ticket@@@O5aMkWQut6f1uxGpexkRwxl53LpEtHVKkuNnGTZ8e4lkrG0riuaCPY16HegOX-7R4d7NbDkoNJvQ3HxPmLTsZA\" }"

# 接口返回：

{"component_access_token":"43_XENaRUJm4gulOvoh2KMNbhZ6GLXGY51kkBVJYNl2tRqKYGzu260GbBe5AdaYSRJnSEQTLZ5OfnuEwXir-KC9MJP8U2xb6SfNDNDTvdBQCuKweu0cNQYqKmQvnvMFmuZk6ICUbLUGLchVxwMxKJAaAJARQH","expires_in":7200}

```

## 3.调用接口获取 pre_auth_code：

官方文档：

https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/api/pre_auth_code.html

``` bash
# 调用接口

curl -X POST "https://api.weixin.qq.com/cgi-bin/component/api_create_preauthcode?component_access_token=43_XENaRUJm4gulOvoh2KMNbhZ6GLXGY51kkBVJYNl2tRqKYGzu260GbBe5AdaYSRJnSEQTLZ5OfnuEwXir-KC9MJP8U2xb6SfNDNDTvdBQCuKweu0cNQYqKmQvnvMFmuZk6ICUbLUGLchVxwMxKJAaAJARQH" -d "{ \"component_appid\": \"wx1111111111111111\" }"


# 接口返回：
{"pre_auth_code":"preauthcode@@@PS8nU53W1iZIoj9tN_F4vA2ox5nWl8MLmxu8UJ_XJN1y-lEFIoS5CDmlsc6znjnIoz_BQtWFUfoAcaoup65xWg","expires_in":1800}

```
## 4.获取接口调用授权码 authorizer_access_token
官方文档：
https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/api/authorization_info.html

### 4.1 拼授权跳转链接：

https://mp.weixin.qq.com/cgi-bin/componentloginpage?component_appid=wx43548a6703d7a56b&pre_auth_code=preauthcode@@@PS8nU53W1iZIoj9tN_F4vA2ox5nWl8MLmxu8UJ_XJN1y-lEFIoS5CDmlsc6znjnIoz_BQtWFUfoAcaoup65xWg&redirect_uri=http://mini.allinpayjs.com/wxcallback


授权页面必须从指定域名跳转，简单的授权跳转页面如下：

``` html
<html>
<body>
<button onclick="go()">test test</button>
</body>
<script>
function go(){
window.location.href = "https://mp.weixin.qq.com/cgi-bin/componentloginpage?component_appid=wx43548a6703d7a56b&pre_auth_code=preauthcode@@@PS8nU53W1iZIoj9tN_F4vA2ox5nWl8MLmxu8UJ_XJN1y-lEFIoS5CDmlsc6znjnIoz_BQtWFUfoAcaoup65xWg&redirect_uri=http://mini.allinpayjs.com/wxcallback";
}
</script>
</html>

```
引导公众号管理员点击按钮进行授权


### 4.2授权后跳转

http://mini.allinpayjs.com/wxcallback?auth_code=queryauthcode@@@20PJDNpfTJAa3oN4pCQTk1GuE35fYDTmrZLyM3pEoBi37fhXzdaqDN1y_SZVPlTiQ447tVscEkA_szhmVVuhDw&expires_in=3600


### 4.3使用授权码获取授权信息


``` bash
# 调用接口：

curl -X POST "https://api.weixin.qq.com/cgi-bin/component/api_query_auth?component_access_token=43_XENaRUJm4gulOvoh2KMNbhZ6GLXGY51kkBVJYNl2tRqKYGzu260GbBe5AdaYSRJnSEQTLZ5OfnuEwXir-KC9MJP8U2xb6SfNDNDTvdBQCuKweu0cNQYqKmQvnvMFmuZk6ICUbLUGLchVxwMxKJAaAJARQH" -d "{ \"component_appid\":\"wx43548a6703d7a56b\" , \"authorization_code\": \"queryauthcode@@@20PJDNpfTJAa3oN4pCQTk1GuE35fYDTmrZLyM3pEoBi37fhXzdaqDN1y_SZVPlTiQ447tVscEkA_szhmVVuhDw\" }"

# 接口返回：

{"authorization_info":{"authorizer_appid":"wx927858bad6f6868a","authorizer_access_token":"43_LzORzyML5BCsToFtBKlHdUxI-7JNlBE9JPt8FceZQcx5VsdtSzy-E8Ue8DaBOskQyWwDEM3Hh5lJZ42XJQ-CWESVyyECkuc-BkM5KwrZg3GBpDSwwpgLCqNpzVNaJoou1ZKb78-M6jG6IWcVDZWhADDQMJ","expires_in":7200,"authorizer_refresh_token":"refreshtoken@@@HDIjlj4Zywh_ZF8TT_LPqQOzulFPLMVbF9sczyNuHcY","func_info":[{"funcscope_category":{"id":1}},{"funcscope_category":{"id":15}},{"funcscope_category":{"id":4}},{"funcscope_category":{"id":7}},{"funcscope_category":{"id":2}},{"funcscope_category":{"id":3}},{"funcscope_category":{"id":11}},{"funcscope_category":{"id":6}},{"funcscope_category":{"id":5}},{"funcscope_category":{"id":8}},{"funcscope_category":{"id":13}},{"funcscope_category":{"id":9}},{"funcscope_category":{"id":10}},{"funcscope_category":{"id":12}},{"funcscope_category":{"id":22}},{"funcscope_category":{"id":23}},{"funcscope_category":{"id":24},"confirm_info":{"need_confirm":0,"already_confirm":0,"can_confirm":0}},{"funcscope_category":{"id":26}},{"funcscope_category":{"id":27},"confirm_info":{"need_confirm":0,"already_confirm":0,"can_confirm":0}},{"funcscope_category":{"id":33},"confirm_info":{"need_confirm":0,"already_confirm":0,"can_confirm":0}},{"funcscope_category":{"id":34}},{"funcscope_category":{"id":35}},{"funcscope_category":{"id":44},"confirm_info":{"need_confirm":0,"already_confirm":0,"can_confirm":0}},{"funcscope_category":{"id":46}},{"funcscope_category":{"id":47}},{"funcscope_category":{"id":54}},{"funcscope_category":{"id":66}},{"funcscope_category":{"id":89}}]}}

```

## 5.获取openId

官方文档：

https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/Official_Accounts/official_account_website_authorization.html


拼接调转链接：

https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx927858bad6f6868a&redirect_uri=http://mini.allinpayjs.com/wxcallback&response_type=code&scope=snsapi_base&state=STATE&component_appid=wx43548a6703d7a56b#wechat_redirect

跳转返回

http://mini.allinpayjs.com/wxcallback?code=011wQd000WmlkL1WzY000s42RR1wQd0-&state=STATE&appid=wxfd5749048f25a4b6



调用获取openId接口

``` bash
# 调用接口
curl "https://api.weixin.qq.com/sns/oauth2/component/access_token?appid=wxfd5749048f25a4b6&code=011wQd000WmlkL1WzY000s42RR1wQd0-&grant_type=authorization_code&component_appid=wx43548a6703d7a56b&component_access_token=43_SQdmRUQbqMf4Am_y3YkIMmHjrrM76qrfYAvCGaGhY43K3hSOVOhZIA_irz2m6VhoZNFVK2UHmPV1YjA2uf_4mSTkW1dXVQcVeTJbJiqEPvhWvw9kS8s06-q_X_befgeMuYW7DvpxN0disAOCUDQgAIAGPC"

# 接口返回：

{"access_token":"43_WwxK6uDw2MpjMsz9wCE-8vNPxFYCwHWAvWRcYXfkK6IgGgzPlz7mFLOtP2opCoIoutUkE0WaNyBaq3Dn7O75nA_2e1e7QvsWGJ9c4X9-c78","expires_in":7200,"refresh_token":"43_JnVKGsfOJGhegazpapQSKoyvTcG-sCJTAMgGIi1pj-8cq2Z8VjtE88WmHDVDMkpAaMwbXt6Az_mfYzfF2_3XXaoyxR6EGdgx-_nvBsc9EaA","openid":"oZYWM1W22GLNAp7IITlms87YpwFc","scope":"snsapi_base"}

```

## 6.调用获取用户基本信息(UnionID机制)

官方文档：
https://developers.weixin.qq.com/doc/offiaccount/User_Management/Get_users_basic_information_UnionID.html#UinonId


**调用接口时 access_token参数 使用 第4步接口返回的 authorizer_access_token**

``` bash
# 调用接口
curl "https://api.weixin.qq.com/cgi-bin/user/info?access_token=43_9jXJS3aI4vzk6GFexrIVly2fseEAh8hZEfP2JO5p38bjcRJ-pGJmFIUZKqHv_78t3eP1D-rfNtAb43NNQi3iofsZF5KL9hi4sgkeiXQGfjYIel3Rl81kl1PiXcSspRel89Y4KycNwIWz4-1bBUAaAKDPIO&openid=oZYWM1W22GLNAp7IITlms87YpwFc&lang=zh_CN"


# 接口返回：

{"subscribe":1,"openid":"oZYWM1W22GLNAp7IITlms87YpwFc","nickname":"王一刀","sex":1,"language":"zh_CN","city":"南京","province":"江苏","country":"中国","headimgurl":"http:\/\/thirdwx.qlogo.cn\/mmopen\/qPFdKRxKBqiaOhK8nwuNEXBz7PVmvORbj1HHyyNDF4dmJ35dTJ0aorpbMG8VztibV2icN8DjnOt5vG3KsadJOulpg\/132","subscribe_time":1585202886,"remark":"","groupid":0,"tagid_list":[],"subscribe_scene":"ADD_SCENE_QR_CODE","qr_scene":0,"qr_scene_str":""}

```

