---
layout: post
title: "db2 存储过程总结"
description: ""
category: Tech
tags: [db2]
---
整个星期都在写存储过程，上一次写这玩意好像还是5，6年前。现在又花了很大力气写这个，感觉很有收获，需要总结一下。

## db2中一些常用的内置函数 ##
1.substr 截取字符串。

        用法：substr('abce'，2,2) 从第2个字符开始截取两位 结果：'bc'

2.字符串转为数字

    cast(substr('000000296000',1,10) || '.' || substr('000000296000',11,2) as decimal(12,2)) 结果:2960.00

3.hhmiss类型的字符串转为时间

因为time只能转hh:mi:ss格式的字符串 所以需要对字符串进行截取拼接。例子：

    time(substr('231320',1,2) || ':' || substr('231320',3,2) || ':' || substr('231320',5,2)) 结果：23:13:20

4.字符串转为日期

    to_date('20140703','yyyymmdd') 结果是timestamp类型的 2014-07-03 00:00:00
    to_date('20140703161923','yyyymmddhh24miss') 结果：2014-07-03 16:19:23

用char可以将日期类型转为字符串

    left((char(integer(current date))),6) 获取yyyymm格式的年月
    substr(char(current date),1,7)        获取yyyy-mm格式的年月

5.字段值相除计算占比保留两位小数

    decimal(ROUND(col_1/col_2,2),2,2) 这里还需要一个防止除零的处理：
        case when col_2=0 then 0 
    else decimal(ROUND(col_1/col_2*100,2),2,2) end

6.判断字符串中是否包含某字符

    LOCATE('R2','R1|R2|R3') 结果为：4。locate的用法和java中String.indexOf类似 只是它从1开始标识而不是0。

7.计算字符串长度

这个用length. 举一个通过身份证获取性别的例子。先判断字符串是否为18位，然后看第17位的数字是奇数还是偶数

    values  case when length('111111111111111111') = 18 then 
        case when Integer(substr('111111111111111111',17,1))/2.0 = 0 then 'F'
        else 'M' end
    else '' end

8.替换字符串中的字符

    用replace。replace('R1|R2|R11','R11','A') 结果为: R1|R2|A

##存储过程##
1.用游标还是用FOR循环

存储过程中查表获取结果如何遍历。我刚开始的时候用的是游标，但是后来出现一个问题，就是当我在一个存储过程中使用两个游标的时候创建存储过程时总是失败。而且我也找不出是怎么原因，无奈之下之后用FOR来遍历，而且我发现用FOR更方便更简洁。
{% highlight sql %}
    create procedure process_month_info()
    P: BEGIN
       DECLARE v_date Date;
       DECLARE v_ldate DATE;
       DECLARE v_at_end, a_at_end INTEGER DEFAULT 0;
       DECLARE v_merchant_no, a_merchant_no varchar(60);
       DECLARE report_day INTEGER DEFAULT 2;
       --使用游标
       DECLARE c_merchants CURSOR
           FOR select MERCHANT_NO from POSL_BUSI_DATA_STATUS where SPD_STATUS='00';
        DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_at_end = 1;

        OPEN c_merchants;
        MERCHANT_LOOP: LOOP
        set v_date = current date - 1 month;
        set v_ldate = current date - 13 month;

        FETCH c_merchants into v_merchant_no;
        IF v_at_end <> 0 THEN 
            LEAVE MERCHANT_LOOP;
        END IF;
             MONTH_LOOP: LOOP
             IF v_date <= v_ldate THEN
                LEAVE MONTH_LOOP;
             END IF;
                call posl.month_info_insert(v_merchant_no,v_date);
             SET v_date = v_date - 1 month;
            END LOOP MONTH_LOOP;
        END LOOP MERCHANT_LOOP;
    --使用FOR

         FOR param_loop as select case when int_value is null then 2 else int_value end from posl.POSL_SYS_CTRL_PARAM where PARAM_CODE = 'POSL_APPEND_REPORT_DAY'
           do
            set report_day = param_loop.int_value;
         end FOR;
         IF report_day = DAY(current date) THEN 
             set v_date = current date - 1 month;
             FOR a_merchant_loop as select MERCHANT_NO from POSL_BUSI_DATA_STATUS where SPD_STATUS='10'
               do
                call posl.month_info_insert(a_merchant_loop.MERCHANT_NO,v_date);
             end FOR;
         END IF;
    END P
{% endhighlight %}
2.存储过程的调用

在shell中 可以用 db2 "call schema.procedurename()"的方法调用

还有一种存储过程是有输出参数的，虽然我没用到，但是查资料的时候查到了也记录一下，以备不时之需。
{% highlight sql %}
        CREATE PROCEDURE get_datetime (out cdate date, out ctime time )
    	P1: BEGIN
    	     VALUES CURRENT DATE INTO cdate;
    	     VALUES CURRENT TIME INTO ctime;
    	END P1
        [db2inst1@db2serverf1 testimport]$ db2 "call posl.get_datetime(?,?)"
    	  Value of output parameters
    	  --------------------------
    	  Parameter Name  : CDATE
    	  Parameter Value : 07/02/2014
    	  Parameter Name  : CTIME
    	  Parameter Value : 09:42:32
    	  Return Status = 0
{% endhighlight %}
3.查看系统中的存储过程

    select * from syscat.routines; 系统中所有的函数和存储过程都可以通过这个表查到 routinename 对应名称。

4.在shell中 通过db2命令调用sql脚本创建存储过程

需要注意的是在sql脚本中存储过程都需要以@结尾。

warn.sql
{% highlight sql %}
drop procedure POSL.process_warn@

create procedure POSL.process_warn()
P: BEGIN
INSERT
INTO
    POSL.SPD_MERCHANT_WARN
    (
        ENTITY_OID,
        WORK_DATE,
        MERCHANT_NO,
        CANCEL_FLAG,
        IS_POS_DAILNUM_CHANGE,
        IS_TOUCH_RISK,
        IS_TOUCH_R1,
        IS_TOUCH_R2,
        IS_TOUCH_R3,
        IS_TOUCH_R4,
        IS_TOUCH_R5,
        IS_TOUCH_R6,
        IS_TOUCH_R7,
        IS_TOUCH_R8,
        IS_TOUCH_R9
    )
select 
NEXTVAL FOR POSL.SPD_MERCHANT_WARN_SEQ as ENTITY_OID,
VARCHAR_FORMAT(current TIMESTAMP,'yyyymmdd') as WORK_DATE,
a.MCHT_CD as MERCHANT_NO,
case when a.DELETE_DATE is not null and a.DELETE_DATE <= (current date) then 'Y' else 'N' end as CANCEL_FLAG,
a.IS_POS_DIAL_NO_CHG as IS_POS_DAILNUM_CHANGE,
case when LOCATE('R',b.ruletype)>0 then 'Y' else 'N' end as IS_TOUCH_RISK, 
case when LOCATE('R1',replace(b.ruletype,'R11','A'))>0 then 'Y' else 'N' end as IS_TOUCH_R1,
case when LOCATE('R2',b.ruletype)>0 then 'Y' else 'N' end as IS_TOUCH_R2,
case when LOCATE('R3',b.ruletype)>0 then 'Y' else 'N' end as IS_TOUCH_R3,
case when LOCATE('R4',b.ruletype)>0 then 'Y' else 'N' end as IS_TOUCH_R4,
case when LOCATE('R5',b.ruletype)>0 then 'Y' else 'N' end as IS_TOUCH_R5,
case when LOCATE('R6',b.ruletype)>0 then 'Y' else 'N' end as IS_TOUCH_R6,
case when LOCATE('R7',b.ruletype)>0 then 'Y' else 'N' end as IS_TOUCH_R7,
case when LOCATE('R8',b.ruletype)>0 then 'Y' else 'N' end as IS_TOUCH_R8,
case when LOCATE('R9',b.ruletype)>0 then 'Y' else 'N' end as IS_TOUCH_R9
from POSL.APMS_MCHT a, POSL.APMS_RXINFO b where a.MCHT_CD = b.MCHT_CD 
and b.createtime = char(current date);

update POSL.APMS_MCHT set IS_POS_DIAL_NO_CHG = 'N' where IS_POS_DIAL_NO_CHG = 'Y';
    
END P@
{% endhighlight %}

调用的shell 脚本

{% highlight sql %}
db2 connect to $DB user $USER using $PWD;

db2  -td@ -f warn.sql;
{% endhighlight %}

如果你的sql脚本是在windows下编辑的，执行的时候可能会出现错误。这是由换行符的格式造成的。用dos2unix命令转化一下就ok了


## db2 自定义函数##
开始时我是想用自定义函数，然后在存储过程中调用函数来实现功能。但是自定义的函数在存储过程中没法调用，我没找到调用的方法，只好放弃，只能用存储过程调存储过程。
写自定义函数的时候如果你在函数中修改了表的数据，会遇到MODIFIES SQL DATA 的问题，这是因为在自定义函数中默认是不允许修改数据的。需要用下面的声明方式创建函数而且返回类型必须是table，其他类型的都创建不了。这个需要改数据的自定义函数真的很麻烦，能不用最好不要用。
{% highlight sql %}
create function test_insert(vdate Date)
	RETURNS TABLE (cdate Date,
	                    num Integer)
	     LANGUAGE SQL
	     MODIFIES SQL DATA
	     NO EXTERNAL ACTION
	     DETERMINISTIC
	     BEGIN ATOMIC
	     insert into test_date(cdate) values(vdate);
	return select * from test_date where cdate = vdate;
	END
{% endhighlight %}

调用这个函数的方式： select * from table(posl.TEST_INSERT(current date))  as t
但是在存储过程中调用不了。。。


先写这么多吧。结束。


