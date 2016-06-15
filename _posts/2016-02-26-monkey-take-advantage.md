---
layout: post
title: "猴子占便宜"
description: ""
category: 
tags: []
---
>5个水手带着1只猴子来到一座荒岛,见岛上有一堆椰子,便把这些椰子平均分成了5堆.夜深人静,一个水手偷偷起来,拿走了一堆椰子,把剩下的椰子又平均分成了5堆,结果多出了一只便给猴子吃掉了.过了一会儿,又一个水手偷偷起来,又拿走了一堆椰子,再把剩下的椰子平均分成5堆,结果还是多了一只,又让猴子吃掉了.就这样一个晚上,5个水手都偷偷重新分了一次椰子,每次都多出一只让猴子尝了鲜.第二天早上,岛上依然平均堆放着5堆椰子.
 
>问:原先的椰子至少有多少个?

这是一个从我很小时候就困扰我的问题。。。昨天晚上突然又想起来，于是写了个程序，把答案算出来了。。。

```java
public class Monkey {
    /*
	 * @param args
	 */
	public static void main(String[] args) {

		for (int i = 5; i < 100000; i++) {
			Flag flag = new Flag();
			flag.setFlag(0);
			test(i, flag);
			if(flag.getFlag() == 5 ) {
				System.out.println(i);
				break;
			}
		}
		System.out.println("end");

	}

	public static void test(int num, Flag flag) {
		int x = num % 5;
		if (x == 0) {
			int num2 = num - num / 5 - 1;

			if (num2 % 5 == 0) {
				if (flag.getFlag() == 4) {
					System.out.println("flag:" + flag.getFlag() + " num:" + num2);
					flag.setFlag(flag.getFlag() + 1);
					return;
				}
				flag.setFlag(flag.getFlag() + 1);
				test(num2, flag);
			}
		}
	}

}

class Flag {
	private int flag;

	public void setFlag(int flag) {
		this.flag = flag;
	}

	public int getFlag() {
		return flag;
	}
}

```

结果是：

>flag:4 num:5115

>15620

>end
