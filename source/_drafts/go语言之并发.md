---
title: go语言之并发
tags:
  - goroutine
categories:
  - go
date: 2024-10-11 10:48:45
---

go 语言支持并发，Go 语言的并发特性是它最大的优势。

<!-- more -->

### goroutine

Goroutine 是 Go 语言支持并发的核心，一个 Go 的程序中同时创建成百上千个 goroutine 是很普遍的，一个 goroutine 会以一个很小的栈开始其生命周期，一般只需要 2KB。

Goroutine 是 Go 程序中最基本的并发执行单元。每一个 Go 程序都至少包含一个 goroutine(main goroutine)，当 Go 程序启动时它会自动创建。

在 Go 中不需要自己写进程、线程、协程。当需要并发执行某个任务时，就将该任务封装为一个函数，开启一个 goroutine 去执行这个函就可以了。

### go 关键字

在 Go 中，开启一个 goroutine 很简单，只需要在一个函数或方法的调用前加上 `go` 关键字即可。

```go
go fn()
```

匿名函数也可以。

```go
go func() {
    // ...
}()
```

### 多个 goroutine
