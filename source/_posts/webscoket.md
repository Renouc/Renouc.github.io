---
title: webscoket
date: 2023-10-22 22:05:51
banner_img: img/webscoket_banner.jpg
index_img: img/webscoket_banner.jpg
categories: js随笔
tags: [通信, 前端]
---

WebSockets（中文称为“网络套接字”或“网络插座”）是一种在单个 TCP 连接上提供全双工通信通道的协议。它允许客户端（通常是个 Web 浏览器）与服务器之间进行实时、双向通信。WebSockets 通常用于 Web 开发中，用于需要低延迟、实时互动的应用程序，例如在线聊天、在线游戏和协作工具。

## 服务端

要使用 Node.js 启动一个 WebSocket 服务器，您可以使用 ws 库，这是一个流行的 WebSocket 库，它允许您轻松创建 WebSocket 服务器和客户端。
安装 ws 库

```sh
npm i ws
```

启动一个 webscoket 服务器

```js
const WebSocket = require('ws')

// 创建一个WebSocket服务器，监听端口8080
const wss = new WebSocket.Server({ port: 8080 })

// 当有新的WebSocket连接时，执行以下操作
wss.on('connection', (ws) => {
  console.log('客户端连接成功！')

  // 监听来自客户端的消息
  ws.on('message', (message) => {
    console.log(`收到消息: ${message}`)

    // 向客户端发送消息
    ws.send('服务器收到消息：' + message)
  })

  // 监听客户端断开连接
  ws.on('close', () => {
    console.log('客户端断开连接')
  })
})
```

## 客户端

在客户端可以通过浏览器提供的 [WebScoket](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket) 对象来监听和接收服务端发送的消息，并且发送消息。

```js
const WebSocket = new WebSocket('ws://localhost:8080')

WebSocket.onopen = () => {
  console.log('已连接到WebSocket服务器')
  WebSocket.send('Hello, WebSocket Server!')
}

WebSocket.onmessage = (event) => {
  console.log('收到来自服务器的消息: ' + event.data)
}

WebSocket.onclose = () => {
  console.log('WebSocket连接已关闭')
}
```
