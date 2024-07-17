---
layout: post
title: BigDecimal的精度与刻度
subtitle: '为什么你应该用字符串构造BigDecimal对象'
cover: ""
date: 2024-07-16
category: Tech
tags: [java]
---
BigDecimal是Java中用于高精度算术运算的类。当您需要精确地处理非常大或非常小的数字时，例如在金融计算中，它特别有用。由于众所周知得原因，Double这种类型在某些情况下会出现丢失精度的问题，所以在需要对较为敏感的数据(比如与金额有关的)进行运算时，我们都会用BigDecimal。但是，用BigDecimal不代表就一定没问题，我们今天就讨论一下关于BigDecimal的问题。

## 精度与刻度

要正确使用BigDecimal，首先要清楚精度(precision)和刻度(scale)的概念。

 * Precision（精度）：表示数值的总位数，包括小数点前后的位数。例如，数值 123.45 的精度是 5，因为它有 5 位数字。

 * Scale（刻度）：表示小数点后的位数。例如，数值 123.45 的刻度是 2，因为小数点后有 2 位数字。

举个例子，如果一个数值类型定义为 DECIMAL(7, 2)，那么它的精度是 7，刻度是 2。这意味着这个数值最多可以有 7 位数字，其中 2 位在小数点后，5 位在小数点前。
(p.s. DECIMAL这个数值类型通常是用在数据库中的，JAVA中并没有这个类型。用这个例子是因为它可以最清晰地说明精度与刻度)

BigDecimal类中也有获取精度和刻度的方法

``` java
    BigDecimal num = new BigDecimal("12.1234");
	System.out.println(String.format("precision:%s scale:%s", num.precision(),num.scale()));

    //输出：precision:6 scale:4
```

## 除法中的刻度

在用BigDecimal做除法运算，使用divide方法的时候，可以指定刻度，也可以不指定。

当指定刻度，即保留几位小数的时候，需要指定进位模式(RoundingMode)。
可选的模式有UP、DOWN、CEILING、FLOOR、HALF_UP、HALF_DOWN、HALF_EVEN、UNNECESSARY。
JDK api中用一个表格比较了这几种模式的区别

**Result of rounding input to one digit with the given rounding mode**
|Input Number	|UP	|DOWN	|CEILING	|FLOOR	|HALF_UP	|HALF_DOWN	|HALF_EVEN	|UNNECESSARY|
|:---           |:---|:---|:---|:---|:---|:---|:---|:---|
|5.5	        |6	 |5   |6   |5	|6	 |5	  |6   |throw ArithmeticException|
|2.5	        |3	 |2   |3   |2	|3	 |2	  |2   |throw ArithmeticException|
|1.6	        |2	 |1   |2   |1	|2	 |2	  |2   |throw ArithmeticException|
|1.1	        |2	 |1   |2   |1	|1	 |1	  |1   |throw ArithmeticException|
|1.0	        |1	 |1   |1   |1	|1	 |1	  |1   |1|
|-1.0	        |-1	 |-1  |-1  |-1	|-1  |-1  |-1  |-1|
|-1.1	        |-2	 |-1  |-1  |-2	|-1  |-1  |-1  |throw ArithmeticException|
|-1.6	        |-2	 |-1  |-1  |-2	|-2  |-2  |-2  |throw ArithmeticException|
|-2.5	        |-3	 |-2  |-2  |-3	|-3  |-2  |-2  |throw ArithmeticException|
|-5.5	        |-6	 |-5  |-5  |-6	|-6  |-5  |-6  |throw ArithmeticException|

按指定的规则进位，保留几位小数，这没有问题。

如果不指定刻度呢？

``` java
    BigDecimal one = new BigDecimal("1");
	BigDecimal eight = new BigDecimal("8");
    System.out.println(one.divide(eight));//输出 0.125
	BigDecimal three = new BigDecimal("3");
    System.out.println(one.divide(three));// java.lang.ArithmeticException: Non-terminating decimal expansion; no exact representable decimal result.

```
当结果能除尽的时候正常处理，当除不尽即结果是无限循环小数的时候，程序抛出异常。
看一下源码：
``` java
public BigDecimal divide(BigDecimal divisor) {
        /*
         * Handle zero cases first.
         */
        if (divisor.signum() == 0) {   // x/0
            if (this.signum() == 0)    // 0/0
                throw new ArithmeticException("Division undefined");  // NaN
            throw new ArithmeticException("Division by zero");
        }

        // Calculate preferred scale
        int preferredScale = saturateLong((long) this.scale - divisor.scale);

        if (this.signum() == 0) // 0/y
            return zeroValueOf(preferredScale);
        else {
            /*
             * If the quotient this/divisor has a terminating decimal
             * expansion, the expansion can have no more than
             * (a.precision() + ceil(10*b.precision)/3) digits.
             * Therefore, create a MathContext object with this
             * precision and do a divide with the UNNECESSARY rounding
             * mode.
             */
            MathContext mc = new MathContext( (int)Math.min(this.precision() +
                                                            (long)Math.ceil(10.0*divisor.precision()/3.0),
                                                            Integer.MAX_VALUE),
                                              RoundingMode.UNNECESSARY);
            BigDecimal quotient;
            try {
                quotient = this.divide(divisor, mc);
            } catch (ArithmeticException e) {
                throw new ArithmeticException("Non-terminating decimal expansion; " +
                                              "no exact representable decimal result.");
            }

            int quotientScale = quotient.scale();

            // divide(BigDecimal, mc) tries to adjust the quotient to
            // the desired one by removing trailing zeros; since the
            // exact divide method does not have an explicit digit
            // limit, we can add zeros too.
            if (preferredScale > quotientScale)
                return quotient.setScale(preferredScale, ROUND_UNNECESSARY);

            return quotient;
        }
    }
```
MathContext mc = new MathContext( (int)Math.min(this.precision() +(long)Math.ceil(10.0*divisor.precision()/3.0),Integer.MAX_VALUE),RoundingMode.UNNECESSARY);

这一句算了一个刻度，然后进位方式选了UNNECESSARY。所以当除不尽的时候就抛异常了。

也就是说它断定，如果一个除法能除尽，它的小数位小于this.precision() +(long)Math.ceil(10.0*divisor.precision()/3.0)

>这句话的意思是，如果 this 除以 divisor 的商是一个有限小数，那么这个小数的位数不会超过以下公式计算的结果：  
$a.precision() + \lceil \frac{10 \cdot b.precision}{3} \rceil$  
其中：  
•  a.precision() 是 this 的精度，即 this 的总位数。  
•  b.precision() 是 divisor 的精度，即 divisor 的总位数。  
•  ceil 是向上取整函数。  
这个公式的作用是估算有限小数的最大位数。具体来说，它考虑了 this 和 divisor 的精度，并通过一个比例关系来确定商的小数位数上限。  
举个例子，如果 this 的精度是 5，divisor 的精度是 3，那么公式计算如下：  
$5 + \lceil \frac{10 \cdot 3}{3} \rceil = 5 + \lceil 10 \rceil = 5 + 10 = 15$  
因此，商的有限小数位数不会超过 15 位。

插一句啊，这是为什么？

AI是这样回答的：

> 这个公式的提出者并没有明确的记录，但它基于数论中的一些基本原理。证明这个公式需要用到基本算术定理（Fundamental Theorem of Arithmetic），即每个整数都可以唯一地分解为素数的乘积。  
证明思路  
>1. 有限小数的条件：  
一个分数 $\frac{a}{b}$只有在其分母 (b) 仅包含 2 和 5 作为素因子时，才会有一个有限小数。这是因为 10 的唯一素因子是 2 和 5。
>2. 小数位数的估算：  
假设我们有一个分数 $\frac{a}{b}$，其中 (a) 和 (b) 是整数，并且 (b) 仅包含 2 和 5 作为素因子。我们可以将 (b) 表示为 $(2^m \times 5^n)$，其中 (m) 和 (n) 是非负整数。
>3. 小数位数的上限：  
为了使分数 $\frac{a}{b}$ 变成一个整数，我们需要将其乘以 $(10^{\max(m, n)})$。因此，有限小数的最大位数可以通过以下公式估算：  
$a.precision + \lceil \frac{10 \cdot b.precision}{3} \rceil$  
其中 (a.precision) 是分子 (a) 的位数，(b.precision) 是分母 (b) 的位数。  

>具体例子  
假设我们有两个数：  
•  this = 12345（精度为 5，因为有 5 位数字）  
•  divisor = 678（精度为 3，因为有 3 位数字）  
我们想知道 12345 除以 678 的商，如果是有限小数，它的小数部分最多有多少位。根据公式：  
$5 + \lceil \frac{10 \cdot 3}{3} \rceil = 5 + \lceil 10 \rceil = 5 + 10 = 15$
因此，12345 除以 678 的商，如果是有限小数，小数部分最多有 15 位。

额...是数论啊？那我走，打扰了，打扰了...
![](/assets/images/meme/daraole.jpg)
## 为什么你应该用字符串来构造BigDecimal

聪明的你应该早就发现了，BigDecimal的构造方法有很多个。应该用哪个呢？很多人都知道应该用字符串，可是为什么呢？  
因为，当你不用字符串的时候，会用很多意想不到的惊喜。

``` java
    BigDecimal strnum = new BigDecimal("12.1234");
    System.out.println(String.format("precision:%s scale:%s", strnum.precision(),strnum.scale()));//输出 precision:6 scale:4

    BigDecimal num = new BigDecimal(12.1234);
    System.out.println(String.format("precision:%s scale:%s", num.precision(),num.scale()));//输出precision:50 scale:48
```
下面一个刻度是48，这是什么鬼？

再试试除法

``` java
    BigDecimal one = new BigDecimal("0.1");
	BigDecimal eight = new BigDecimal("8");
    System.out.println(one.divide(eight));//输出 0.0125

    BigDecimal _1 = new BigDecimal(0.1);
	BigDecimal _8 = new BigDecimal(8);
    System.out.println(_1.divide(_8));//输出 0.0125000000000000006938893903907228377647697925567626953125
```

为什么会出现这种结果？这个原因众所周知：

>二进制（也称为基数2）不能精确表示某些十进制数，尤其是那些在十进制中有有限小数位但在二进制中需要无限小数位的数。例如，0.1 和 0.2 在二进制中无法精确表示。  
这是因为二进制系统只能使用 0 和 1 来表示数值，而某些十进制数在转换为二进制时会变成无限循环小数。例如：  
•  0.1 在二进制中表示为 0.00011001100110011...（无限循环）  
•  0.2 在二进制中表示为 0.0011001100110011...（无限循环）  
由于计算机的存储空间有限，这些无限循环小数只能被截断，从而导致精度损失。这就是为什么在使用浮点数进行计算时，可能会出现精度问题。

如果你看源码你会发现 public BigDecimal(double val) 和  public BigDecimal(String val)的实现完全不同。或许你也会想为什么呢？为什么要实现两套不同的呢？你就直接这样：
``` java
public BigDecimal(double val) {
    this(String.valueOf(val));
}
```
不就完了？

至于JDK团队实现两套的原因是什么？你知道吗？欢迎留言告诉我:)

