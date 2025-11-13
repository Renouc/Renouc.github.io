# Babel 的基本使用

## Babel 的工作流程

1. 解析（parse）：把源码变成 AST（抽象语法树）。

2. 转换（transform）：通过一系列 plugin/preset 对 AST 做访问与修改。

3. 生成（generate）：把修改后的 AST 输出成新的源码（或者生成 source map）。

## 核心概念

当你使用 Babel 来转换代码，且并未配置任何插件与预设时，你会发现输出的代码并无改变。

这是因为 Babel 本身并没有转换的功能，它需要通过一系列的插件（plugin）来完成转换。

预设则是一个插件集合，引入预设后，Babel 就会自动引入该预设所包含的插件。
