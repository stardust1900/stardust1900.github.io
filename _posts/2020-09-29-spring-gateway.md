---
layout: post
title: "spring cloud gateway使用总结"
date: 2020-09-29
category: 技术
tags: [spring,gateway]
---

最近使用spring gateway组件做了一个机构网关，我把使用过程中遇到的问题做个总结。

* 1.路径转发使用正则保留部分url

有时候做路径转发，我们只需要替换第一个/后面的内容，即context patn，后面的内容保留。
[官方文档](https://docs.spring.io/spring-cloud-gateway/docs/2.2.5.RELEASE/reference/html/#the-rewritepath-gatewayfilter-factory)中有例子

``` yml
spring:
cloud:
    gateway:
    routes:
    - id: rewritepath_route
        uri: https://example.org
        predicates:
        - Path=/red/**
        filters:
        - RewritePath=/red(?<segment>/?.*), $\{segment}
```

这个是配置方式的，也可以用编程方式，我就是这样实现的

``` java
@Bean
public RouteLocator myRoutes(RouteLocatorBuilder builder) {
    return builder.routes()
            .route("allinpay",
                    r -> r.path("/allinpay/**")
                            .filters(f -> f.rewritePath("/allinpay/(?<segment>/?.*)", "/allinpay/${segment}")
                                    .modifyRequestBody(JSONObject.class, JSONObject.class,new AllinpayRequestBodyRewriteFunction(aibankConfig))
                                    .modifyResponseBody(JSONObject.class, JSONObject.class,new AllinpayResponseBodyRewriteFunction(aibankConfig))
                                    )
                            .uri(allinpayUrl))
            .build();
}
```

* 2.application/x-www-form-urlencoded 请求体参数内容获取

通过gateway自带的过滤器，获取header ，url后缀参数，json参数都很方便，但是当contentType为application/x-www-form-urlencoded 时要获取 request body中的参数内容就需要自定义过滤器做处理。
参考了网上很多资料，我的实现代码如下：

``` java
@Slf4j
public class AllinpaycardRequestParamFilter implements GatewayFilter, Ordered {
    private final List<HttpMessageReader<?>> messageReaders;

    public AllinpaycardRequestParamFilter() {
		this.messageReaders = HandlerStrategies.withDefaults().messageReaders();
	}
    @Override
	public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        HttpHeaders reqHeaders = exchange.getRequest().getHeaders();
		MediaType contentType = reqHeaders.getContentType();
        ServerRequest serverRequest = ServerRequest.create(exchange, messageReaders);
        if (HttpMethod.POST.name().equals((serverRequest.methodName()))) {
            Mono<String> modifiedBody = serverRequest.bodyToMono(String.class).flatMap(body -> {
                Map<String, Object> params = Arrays.stream(body.split("&")).map(s -> s.split("="))
				.collect(Collectors.toMap(arr -> arr[0], arr -> arr[1]));
                //TODO 处理参数



                String newBody = params.entrySet().stream().map(e -> e.getKey() + "=" + e.getValue()).collect(Collectors.joining("&"));

				return Mono.just(newBody);
            })
        }
    }
}
``` 


* 3.response 如果用gzip压缩过，取出response 内容做处理

直接用string取出来的内容是乱码，需要做解压处理
下面是代码片段：

``` java
    @Override
	public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerRequest serverRequest = new DefaultServerRequest(exchange);
        if (HttpMethod.POST.name().equals((serverRequest.methodName()))) {

			Mono<Void> mono = serverRequest.bodyToMono(String.class).defaultIfEmpty("null").flatMap(reqBody -> {
				log.info("reqBody:{}", reqBody);
				if ("null".equals(reqBody)) {
					// 重写原始响应
					BodyHandlerServerHttpResponseDecorator responseDecorator = new BodyHandlerServerHttpResponseDecorator(
							initBodyHandler(exchange, startTime, traceLog), exchange.getResponse());

					return chain.filter(exchange.mutate().response(responseDecorator).build());
				} else {
					// 重写原始请求
					ServerHttpRequestDecorator decorator = new ServerHttpRequestDecorator(exchange.getRequest()) {
						@Override
						public HttpHeaders getHeaders() {
							HttpHeaders httpHeaders = new HttpHeaders();
							// httpHeaders.putAll(super.getHeaders());
							httpHeaders.putAll(reqHeaders);
							return httpHeaders;
						}

						@Override
						public Flux<DataBuffer> getBody() {
							// 打印原始请求日志
							log.info("[Trace:{}]-gateway request:headers=[{}],body=[{}]", "orgCode", getHeaders(),
									reqBody);
							return Flux.just(reqBody)
									.map(bx -> exchange.getResponse().bufferFactory().wrap(bx.getBytes()));
						}
					};
					// 重写原始响应
					BodyHandlerServerHttpResponseDecorator responseDecorator = new BodyHandlerServerHttpResponseDecorator(
							initBodyHandler(exchange, startTime, traceLog), exchange.getResponse());

					return chain.filter(exchange.mutate().request(decorator).response(responseDecorator).build());
				}
			});
			log.info("mono:{}", mono);
			return mono;
		
        }
    }
``` 

上面的代码有一个地方需要注意，就是defaultIfEmpty("null")，当请求body为null的时候，给其赋了默认值"null",方法体中对这个值做单独处理，否则当请求body为null的时候，过滤器终止处理，不会往下传递，请求不到目标地址。

``` java
protected BodyHandlerFunction initBodyHandler(ServerWebExchange exchange, long startTime,
			GwTraceLogWithBLOBs traceLog) {
		return (resp, body) -> {
			// 拦截
			String trace = exchange.getRequest().getHeaders().getFirst("trace");

			Map<String, Object> attributes = exchange.getAttributes();
			log.info("attributes:{}", attributes);
			HttpHeaders httpHeaders = new HttpHeaders();
			if (null != exchange.getAttribute("original_response_content_type")) {
				MediaType originalResponseContentType = MediaType
						.parseMediaType(exchange.getAttribute("original_response_content_type"));
				httpHeaders.setContentType(originalResponseContentType);
			}

			DefaultClientResponseAdapter clientResponseAdapter = new DefaultClientResponseAdapter(body, httpHeaders);

			Mono<DataBuffer> bodyMono = clientResponseAdapter.bodyToMono(DataBuffer.class);

			return bodyMono.flatMap((rspBody) -> {
				long elapsedTime = System.currentTimeMillis() - startTime;
				HttpHeaders respHeaders = resp.getHeaders();
				String respHeaderStr = respHeaders.toString();
				String bodyStr = null;
				if (null != respHeaders.get("Content-Encoding") && respHeaders.get("Content-Encoding").contains("gzip")) {
					try {
						GZIPInputStream gzip = new GZIPInputStream(rspBody.asInputStream());
						InputStreamReader isr = new InputStreamReader(gzip);
						BufferedReader br = new BufferedReader(isr);
						StringBuilder sb = new StringBuilder();
						String temp;
						while ((temp = br.readLine()) != null) {
							sb.append(temp).append("\r");
						}
						bodyStr = sb.toString();
					} catch (IOException e) {
						log.error("",e);
					}
					//重置读取流位置
					rspBody.readPosition(0);
				} else {
					byte[] content = new byte[rspBody.readableByteCount()];
					rspBody.read(content);
					// 释放掉内存 不能释放 否则 报response already commit 错误
					//DataBufferUtils.release(rspBody);
					bodyStr = new String(content, Charset.forName("UTF-8"));
					log.info("bodyStr:{}",bodyStr);
					//重置读取流位置
					rspBody.readPosition(0);
				}
				log.info("[Trace:{}]-gateway response:ct=[{}], status=[{}],headers=[{}],body=[{}]", trace, elapsedTime,
						resp.getStatusCode(), respHeaderStr, bodyStr);
				return resp.writeWith(Flux.just(rspBody));
			}).then();

		};
	}
``` 

使用 Mono<DataBuffer> 接收 response内容，如果是经过gzip压缩的，对其进行解压处理。处理完成后，要把流位置重置一下，rspBody.readPosition(0);不然客户端读不到响应内容。


* 4.异常处理

gateway出异常时 返回的是非常不友好的 堆栈页面，需要自定义异常处理。

参考 这篇[springcloud-gateway 网关异常处理](https://www.jianshu.com/p/b5284d71f914)即可。

* 5.请求报文超限问题

网上查了很多，修改配置也没有生效

spring.codec.max-in-memory-size=20MB # 这个配置没有用

重写了ModifyRequestBodyGatewayFilterFactory 的初始方法才解决问题

``` java


	/**
	 * 解决请求报文超限问题 覆盖GatewayAutoConfiguration中ModifyRequestBodyGatewayFilterFactory的初始化方法
	 * 指定最大值 
	 * 
	 * @param codecConfigurer
	 * @return
	 */
	@Bean
	@Primary
	public ModifyRequestBodyGatewayFilterFactory newModifyRequestBodyGatewayFilterFactory(ServerCodecConfigurer codecConfigurer) {
		
		log.info("ServerCodecConfigurer:{}",codecConfigurer);
//		List<HttpMessageReader<?>> messageReaders = HandlerStrategies.builder().codecs(new Consumer<ServerCodecConfigurer>(){
//			@Override
//			public void accept(ServerCodecConfigurer t) {
//				t.defaultCodecs().maxInMemorySize(20 * 1024 * 1024);
//			}}).build().messageReaders();
		codecConfigurer.defaultCodecs().maxInMemorySize(20 * 1024 * 1024); //20M
		return new ModifyRequestBodyGatewayFilterFactory(codecConfigurer.getReaders());
	}
}

```

以上。


