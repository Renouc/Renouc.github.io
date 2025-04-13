# npm 相关

## 常用命令

### 包管理

安装依赖

```bash
# 安装package.json中所有依赖
npm i
```

```bash
# 安装指定依赖
npm i package-name
```

### 配置相关

查看全局依赖存贮位置

```bash
npm root -g
```

查看全局依赖列表

```bash
npm list -g
```

查看配置信息

```bash
npm config list
```

## 说明文件

### 模块类型

`type` 属性，可以设置项目的模块类型。默认为 commonjs，通过 `require` 引入模块。设置为 module 后，使用 `import` 引入模块。

```json
{
  "type": "module" // 可选值 commonjs | module
}
```

## 搭建 npm 私有服务器

### Verdaccio

用于搭建 `npm` 私有服务器，官网地址：https://verdaccio.org/zh-CN/

安装 `verdaccio`

```bash
npm install -g verdaccio
```

启动 `verdaccio`

```bash
verdaccio --config ./config.yaml
```

> 相关配置：https://verdaccio.org/zh-CN/docs/configuration#offline-publish