---
title: go语言之go module
tags:
  - go module
categories:
  - go
date: 2024-10-18 23:08:34
---

go module 是 go 语言官方提供的依赖管理工具，它允许我们使用 go 语言进行依赖管理，并且可以管理多个版本的依赖。

<!-- more -->

### go module 名称

模块路径就是模块的规范名称，如 github.com/gin-gonic/gin。很多时候，模块名称加上 https:// 前缀就是源码仓库的地址。

模块名称在 go.mod 文件中，最初由 `go mod init ${module_name}` 命令指定，之后也可以手动进行修改。

模块名称可以包含子目录，如 `go get gorm.io/gorm/logger` 中的 logger 是子目录，即 package 的路径（不是 package 的名称）。

### go get 命令做了什么

项目 https://github.com/kubernetes/kube-openapi 的模块名为 k8s.io/kube-openapi。当我们 `go get k8s.io/kube-openapi`，时会向 `k8s.io/kube-openapi?go-get=1` 发送请求，服务器返回如下内容：
