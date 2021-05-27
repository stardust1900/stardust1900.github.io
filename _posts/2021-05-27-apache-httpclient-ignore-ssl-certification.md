---
layout: post
title: "apache httpClient 忽略 ssl 证书"
subtitle: ''
date: 2021-05-27
category: 技术
tags: [ssl]
---
httpclient版本号4.5.12，访问https时忽略ssl证书的实现：
以访问猫酷查询卡券接口为例

``` java

import java.io.IOException;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.conn.ssl.TrustStrategy;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.ssl.SSLContextBuilder;
import org.apache.http.util.EntityUtils;

import com.alibaba.fastjson.JSONObject;

public class MallCooTest {
	 private final static SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyyMMddHHmmss");
	 
	 private final static String appId = "xxxxxx";
	 private final static String publicKey = "xxxxxx";
	 private final static String privateKey = "xxxxxx";
			 
	public static void main(String[] args) throws ClientProtocolException, IOException {
		HttpPost httpPost = new HttpPost("https://openapi10.mallcoo.cn/Coupon/v1/GetCanUse/ByMobile/");
//		CloseableHttpClient httpClient = HttpClients.createDefault();		
		CloseableHttpClient httpClient = createSSLInsecureClient();	
		httpPost.addHeader("Content-type", "application/json");
		httpPost.addHeader("Connection", "Keep-Alive");
		httpPost.addHeader("Charset", "UTF-8");
//		httpPost.addHeader("Content-Length", "0");
	
		Map<String, Object> params = new HashMap<String, Object>();
		
		params.put("InternationalMobileCode", "");
		params.put("Mobile", "xxxxxx");
		params.put("CouponType", 0);
		params.put("McShopID", null);
		params.put("CrmShopID", null);
		params.put("DevShopID", null);
		params.put("PageSize", 5);
		params.put("MinID", 0);
		
		String timeStamp = simpleDateFormat.format(new Date());
		
		
		String jsonParameter = JSONObject.toJSON(params).toString();
		String encryptString = "{publicKey:" + publicKey + ",timeStamp:" + timeStamp + ",data:" + jsonParameter
                + ",privateKey:" + privateKey + "}";
		System.out.println(encryptString);
		String sign = DigestUtils.md5Hex(encryptString).substring(8, 24).toUpperCase();
		httpPost.addHeader("AppID", appId);
		httpPost.addHeader("PublicKey", publicKey);
		httpPost.addHeader("TimeStamp", timeStamp);
		httpPost.addHeader("Sign", sign);
		StringEntity entity = new StringEntity(jsonParameter,"UTF-8");
		entity.setContentEncoding("UTF-8");    
//		entity.setContentType("application/json");    
		
		System.out.println(entity);
		httpPost.setEntity(entity);
	
		HttpResponse httpResponse  = httpClient.execute(httpPost);
		System.out.println(httpResponse);
		  // 请求结束，返回结果。并解析json。  
        String resData = EntityUtils.toString(httpResponse.getEntity()); 
        
        System.out.println(resData);
	}
	
	/**
     * 创建一个SSL信任所有证书的httpClient对象
     * 
     * @return
     */
    public static CloseableHttpClient createSSLInsecureClient() {
        try {
            SSLContext sslContext = new SSLContextBuilder().loadTrustMaterial(null, new TrustStrategy() {
                // 默认信任所有证书
                public boolean isTrusted(X509Certificate[] arg0, String arg1) throws CertificateException {
                    return true;
                }

            }).build();
            
            HostnameVerifier verifier = new HostnameVerifier(){

				@Override
				public boolean verify(String arg0, SSLSession arg1) {
					return true;
				}};
                
            SSLConnectionSocketFactory sslcsf = new SSLConnectionSocketFactory(sslContext, verifier);
            return HttpClients.custom().setSSLSocketFactory(sslcsf).build();
        } catch (KeyManagementException e) {
            e.printStackTrace();
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        } catch (KeyStoreException e) {
            e.printStackTrace();
        }
        return HttpClients.createDefault();
    }

}

```