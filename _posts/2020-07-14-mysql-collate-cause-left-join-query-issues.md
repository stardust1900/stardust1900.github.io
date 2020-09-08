---
layout: post
title: "mysql 表字段collate类型不同导致left join 查询性能问题"
subtitle: ''
date: 2020-07-14
cover: ""
category: 技术
tags: [mysql]
---
这是前几天遇到的问题，我记录一下。

mysql 数据库，两张数据量不算太大的表(2万条左右)关联查询时速度非常慢，查出2000条数据消耗10几秒。对关联字段添加索引也没有效果。
起初以为是因为跨库查询导致的，把其中一张表，导入到同一个库中，相关字段都加上索引，测试发现仍然很慢。

网上搜到了这篇 [MySQL下LeftJoin的性能优化](https://blog.csdn.net/F2004/article/details/7484917)

使用  show full columns from xxxxx; 命令查看关联表数据。发现一个字段的Collation是utf8mb4_general_ci，另外一个是utf8_general_ci。
使用以下命令修改字段类型

```sql

ALTER TABLE tablename CHANGE fieldname fieldname VARCHAR(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
--例子
ALTER TABLE student CHANGE firstname firstname VARCHAR(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

```

然后测试，发现性能显著提升。