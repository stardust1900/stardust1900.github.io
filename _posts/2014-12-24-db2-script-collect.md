---
layout: post
title: "db2 常用语句整理"
description: ""
category: 技术
tags: [db2]
---
这是一篇总结文章，将常用的sql语句做了简单的整理。希望对你有用 ：）

<!--more-->
#### 执行文件中的sql脚本

1.执行以;结尾的脚本

	db2  -tvf xxx.sql -l xxx.log;

2.执行以@结尾的脚本

	db2 -td@ -f xxx.sql

#### 导出表中数据到ixf文件

	db2 "export to xxx.ixf of ixf select * from schema.tablename where ..."

#### 导出表中数据到csv文件

    db2 "export to xxx.csv of del select * from schema.tablename where ..."

#### 从ixf文件导入数据到数据库表
1.创建表并导入

	db2 "import from xxxx.ixf of ixf COMMITCOUNT 2000 create into schema.tablename" (2000 条提交一次）

2.仅插入（增量导入）

	db2 "import from xxx.ixf of ixf commitcount 2000 messages xxx.log insert into schema.tablename"

3.已存在数据修改不存在数据插入（全量导入）

	db2 "import from xxx.ixf of ixf commitcount 2000 messages xxx.log insert_update into schema.tablename";

4.跳过xx条后导入

	db2 "import from xxx.ixf of ixf COMMITCOUNT 2000 SKIPCOUNT 1000 insert into schema.tablename"

#### 查看表空间

	select tabschema,tabname,tbspace from syscat.tables;

	db2 list tablespaces

#### 统计所有节点表空间使用率

	select substr(TABLESPACE_NAME,1,20) as TBSPC_NAME,bigint(TOTAL_PAGES * PAGE_SIZE)/1024/1024 as "TOTAL(MB)",
	used_pages*PAGE_SIZE/1024/1024 as "USED(MB)", free_pages*PAGE_SIZE/1024/1024 as "FREE(MB)" 
	from table(snapshot_tbs_cfg('DB_NAME', -2)) as snapshot_tbs_cfg

#### 查看表空间使用率

	select substr(tbsp_name,1,20) as TABLESPACE_NAME,substr(tbsp_content_type,1,10) as TABLESPACE_TYPE,sum(tbsp_total_size_kb)/1024 as TOTAL_MB,
    sum(tbsp_used_size_kb)/1024 as USED_MB,sum(tbsp_free_size_kb)/1024 as FREE_MB,tbsp_page_size AS PAGE_SIZE 
    from SYSIBMADM.TBSP_UTILIZATION group by tbsp_name,tbsp_content_type,tbsp_page_size
  	order by 1

#### 修改扩展表空间大小

	alter tablespace xxxx RESIZE (ALL 30 M)

	ALTER TABLESPACE xxxx EXTEND(ALL 300 M)

#### 表主键的相关操作

 1：查找主键

    describe indexes for table <instancename>.<tablename>
    例子：db2 "DESCRIBE INDEXES FOR TABLE Students"

2：删除表主键

    alter table <instancename>.<tablename> drop primary key
    例子：db2 "ALTER TABLE Students DROP PRIMARY KEY"

3：增加表主键

    alter table <instancename>.<tablename> add CONSTRAINT <primarykeyname> PRIMARY KEY (<columnname>)
    例子： db2 "ALTER TABLE Students ADD CONSTRAINT StudentsKey PRIMARY KEY(sid)"

#### 查看创建索引

1.查查看表索引

	db2 "describe indexes for table POSL.APMS_MCHT show detail"

	select *  from SYSCAT.INDEXES  where TABNAME='表名'

	db2 "select  tabname  from syscat.indexes"

2.创建索引

	CREATE INDEX <INDEX_NAME> ON <TABLE_NAME> (<COLNAME1,COLNAME2…>) 

#### 创建备份表

	create table XXXXX_BAK as
	(
	select * from   XXXXX
	)definition only;
	insert into XXXXX_BAK  select * from XXXXX;

	create table XXXXX_BAK like XXXXX;
	insert into XXXXX_BAK  select * from XXXXX;

#### 修改表名

	rename table xxxxx_BAK to xxxxx;

#### 创建序列

	CREATE SEQUENCE xxxx_SEQ AS DECIMAL(31,0) START WITH 10000 INCREMENT BY 1 MINVALUE 1 NO MAXVALUE NO CYCLE CACHE 500 ORDER;

#### 关联修改

	update xxx.table1 as t1 set (t1.col1)=(select t2.col1 from xxx.table2 t2 where t1.id=t2.id) WHERE t1.id in (select id from xxx.table2 )
要求id必须是主键
