---
layout: post
title: 规则引擎easyRules中组合规则的使用
subtitle: 'easyRules4.1.0的用法'
date: 2023-06-02
category: Tech
tags: [rule engine,easyRules,java]
---

这两天想要做支付路由，要根据支付信息将支付请求转发到不同的支付渠道，可能要用到规则引擎，于是研究了一下开源的规则引擎产品。[规则引擎核心知识与开源产品对比选型](https://ranying666.github.io/2021/03/11/rule-engine/) ，这篇文章对规格引擎和开源产品有详细的介绍。从文中得知目前活跃的项目有uRule和easyRule。通过询问new bing ^_^，这两个项目的比较如下：


> 你好，这是必应。我看到你的消息是一个搜索词，是关于 URule 和 EasyRule 的对比。URule 和 EasyRule 都是 Java 规则引擎，但是它们有很大的不同。下面是一些主要的区别¹：
>
>    - URule 是一个成熟的规则引擎，提供了多种规则表达方式，如决策表、决策树、评分卡等，并且提供了基于 Web 的设计器，可以让业务人员直接参与和修改规则。URule 基于 Rete 算法，可以高效地匹配大量的规则和数据。URule 有开源版和商业版，开源版的功能有限，没有高级功能。
>    - EasyRule 是一个轻量级的规则引擎，只提供了一种规则表达方式，就是使用 Java 代码或者注解来定义和扩展规则。EasyRule 不需要额外的学习成本，只需要掌握 Java 语言即可。EasyRule 不依赖 Rete 算法，而是按照优先级的顺序执行规则。EasyRule 是完全开源的，没有商业版。
>
>    你可以根据你的需求和场景来选择合适的规则引擎。如果你需要一个功能全面、性能高效、可视化友好的规则引擎，你可以考虑 URule；如果你需要一个简单易用、轻量级、基于 Java 代码的规则引擎，你可以考虑 EasyRule。
>
>    你对 URule 和 EasyRule 的对比有什么疑问吗？
>
>    源: 与必应的对话， 2023/6/2
>
>    (1) 规则引擎核心知识与开源产品对比选型 | ThinkingInsights. https://ranying666.github.io/2021/03/11/rule-engine/.
>
>    (2) Using EasyRule to Manage Firewall Rules - pfSense Documentation. https://docs.netgate.com/pfsense/en/latest/firewall/easyrule.html.
>
>    (3) 常见开源规则引擎对比分析_大海梦想的博客-CSDN博客. https://blog.csdn.net/wjc133/article/details/111954160.
>
>    (4) EasyRule实战 - 掘金. https://juejin.cn/post/7028949948259368990.

显然，EasyRule是比较合适的。目前EasyRule的最新版本是4.1.0，官方文档地址：https://github.com/j-easy/easy-rules/wiki 而网上的介绍文章大都停留在3.x版本。而EasyRule在4.x后做了较大的变动。我看了下最新文档，根据最新版本写了个组合规则的例子。

首先，在pom文件中增加依赖。需要easy-rules-support，因为组合规则的接口在这个包里。

``` xml

        <dependency>
		    <groupId>org.jeasy</groupId>
		    <artifactId>easy-rules-core</artifactId>
		    <version>4.1.0</version>
		</dependency>
		<dependency>
		    <groupId>org.jeasy</groupId>
		    <artifactId>easy-rules-support</artifactId>
		    <version>4.1.0</version>
		</dependency>
```

然后，定义两个单独的规则：

``` java
package easyrule;

import org.jeasy.rules.annotation.Action;
import org.jeasy.rules.annotation.Condition;
import org.jeasy.rules.annotation.Fact;
import org.jeasy.rules.annotation.Rule;

@Rule(name = "Age rule", description = "Check if a person's age is > 18")
public class AgeRule {


    @Condition
    public boolean isAdult(@Fact("person")Person person) {
    	System.out.println("2222222222222222");
        return person.getAge() > 18;
    }
    
    @Action
    public void print(@Fact("person")Person person) {
    	System.out.println("3333333333333");
    	System.out.println(String.format("The %s is %d yeas old",person.getName(),person.getAge()));
    }
}

```

``` java
package easyrule;

import org.jeasy.rules.annotation.Action;
import org.jeasy.rules.annotation.Condition;
import org.jeasy.rules.annotation.Fact;
import org.jeasy.rules.annotation.Rule;

@Rule(name = "Gender rule", description = "Check if a person's gender is male")
public class GenderRule {

    @Condition
    public boolean isMale(@Fact("person")Person person) {
    	System.out.println("4444444444444444");
        return person.getGender().equals("male");
    }
    
    @Action
    public void print(@Fact("person")Person person) {
    	System.out.println("5555555555555555555555");
    	System.out.println(String.format("The %s is %s",person.getName(),person.getGender()));
    }
}

```

接着，通过继承UnitRuleGroup 写一个组合接口

``` java
package easyrule;

import org.jeasy.rules.annotation.Action;
import org.jeasy.rules.api.Facts;
import org.jeasy.rules.support.composite.UnitRuleGroup;

public class MyCompositeRule extends UnitRuleGroup{

	public MyCompositeRule() {
		System.out.println("1111111111111111");
		addRule(new AgeRule());
		addRule(new GenderRule());
	}
    public MyCompositeRule(Object ...rules) {
        // register sub rules
    	for(Object rule : rules) {
    		addRule(rule);
    	}
    }
    
    @Override
    public void execute(Facts facts) throws Exception {
    	//super.execute(facts);
    	System.out.println("The person is an adult male");
    }

}

```

需要注意的是：这个组合规则类不需要@Rule注解，还需要覆写execute方法。

最后，执行引擎

``` java
		RulesEngine adultEngine = new DefaultRulesEngine();
		Rules rules = new Rules();
		rules.register(new MyCompositeRule());
		
		Facts facts = new Facts();
		facts.put("person", new Person("tom",19,"male"));
		
		adultEngine.fire(rules, facts);

```

执行结果是：

``` text

1111111111111111
2222222222222222
4444444444444444
The person is an adult male

```

可以看到单独规则里的Action 并没有执行。如果想要单独规则里的Action也执行，需要在组合规则的excute方法里增加一句 super.execute(facts); 这个需要根据实际需求来选择。

以上。