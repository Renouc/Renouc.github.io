---
title: css预处理器sass
tags:
  - css
categories:
  - 前端
date: 2025-03-11 22:12:57
---

Sass 是一个 CSS 预处理器，它允许你使用类似于 CSS 的语法来写样式表，但功能更加强大。

<!-- more -->

# scss 和 sass

SCSS（Sassy CSS）和 Sass 是同一工具（Sass 预处理器）的两种不同语法风格，它们本质上是同一技术的两种写法。以下是它们的关系和区别：

## 共同点

同一工具：SCSS 和 Sass（旧称“缩进语法”）都是 Sass 预处理器的语法格式，最终都会被编译为标准 CSS。
功能一致：两者支持相同的功能（变量、嵌套、混合宏、继承等）。

## 区别

| **特性**       | ** SCSS（主流）**          | **Sass（缩进语法）（旧版）** |
| -------------- | -------------------------- | ---------------------------- |
| **语法风格**   | 使用 `{}` 和 `;`，兼容 CSS | 依赖缩进，无 `{}` 和 `;`     |
| **文件扩展名** | `.scss`                    | `.sass`                      |
| **学习成本**   | 对 CSS 用户更友好          | 需要适应无符号的缩进语法     |

> **建议**：优先使用 SCSS（社区主流，兼容性更好）。

## 为什么有两种语法？

- 历史原因：
  Sass（缩进语法） 是 Sass 最早的语法（2006 年），受 HAML 影响，强调简洁。
  SCSS 于 2010 年推出，目的是更贴近原生 CSS，降低迁移成本。

- 兼容性：
  SCSS 是 CSS 的超集，所有合法的 CSS 代码都是合法的 SCSS 代码，直接重命名 .css 为 .scss 即可使用。
  Sass（缩进语法）与 CSS 差异较大，需改写代码。

# 编译 scss

1. 安装 sass

```bash
npm i sass
```

2. 使用

```js
// 编译scss
function compileScss(scssFilePath) {
  const { css } = sass.compile(scssFilePath)
  return css
}
```

# 基础语法

## 嵌套

```scss
body {
  color: red;
  .container {
    color: pink;
  }
}
```

## 变量

```scss
// 全局变量
$color1: red;
$color2: green;
$color3: blue;

body {
  $color4: black;
  .container {
    $color5: orange !global; // !global 在局部作用域中定义全局变量

    color: $color4;
    background-color: $color1;
  }

  p {
    color: $color5;
  }
}
```

## 数据类型

在 sass 中支持 7 种数据类型：

- 数值
- 字符串
- 布尔
- 空值 null
- 数组
- 字典
- 颜色

### 数值类型

- 数值类型可以进行算术运算
- 单位不同的数值不能进行运算，会报错。
- 无单位的数值可以和任何值进行运算，但是运算结果是带单位的。
- 带单位的数值不能作为除数

```scss
$num1: 100;
$num2: 200px;
$num3: 300px;

.container {
  width: $num1;
  height: $num2;

  .box1 {
    width: $num3;
    height: $num3 / 2;
  }

  .box2 {
    width: ($num1 / 2) + px;
  }
}
```

编译后：

```css
.container {
  width: 100;
  height: 200px;
}
.container .box1 {
  width: 300px;
  height: 150px;
}
.container .box2 {
  width: 800px;
}
```

### 字符串类型

- 支持两种：有引号字符串 和 无引号字符串
- 引号可以是单引号也可以是双引号

```scss
$img-path: '/img/';
$img-name1: img1;
$img-suffix: '.png';

.box {
  background: url($img-path + $img-name1 + $img-suffix);
}
```

编译后：

```css
.box {
  background: url('/img/img1.png');
}
```

### 布尔类型

```scss
$isActive: true;

.box {
  @if $isActive {
    color: blue;
  }
  background-color: red;
}
```

编译后：

```css
.box {
  color: blue;
  background-color: red;
}
```

### 空值

```scss
$void: null;

.box {
  color: $void;
  background-color: red;
}
```

编译后：

```css
.box {
  background-color: red;
}
```

### 数组

```scss
// 空格或者逗号 分隔
$color1s: 'red', 'green', 'blue';
$color2s: 'pink' 'orange' 'purple';

@each $color in $color1s {
  .#{$color} {
    color: $color;
  }
}

.box {
  color: nth($color2s, 1); // 索引从1开始
}
```

编译后：

```css
.red {
  color: 'red';
}

.green {
  color: 'green';
}

.blue {
  color: 'blue';
}

.box {
  color: 'pink';
}
```

### 字典

```scss
$colorMap: (
  'success': 'green',
  'warning': 'yellow',
  'error': 'red',
);

.success {
  background-color: map-get($colorMap, 'success');
}

.warning {
  background-color: map-get($colorMap, 'warning');
}

.error {
  background-color: map-get($colorMap, 'error');
}
```

编译后：

```css
.success {
  background-color: 'green';
}

.warning {
  background-color: 'yellow';
}

.error {
  background-color: 'red';
}
```

### 颜色

支持原生 CSS 中各种颜色的表示方式，十六进制、RGB、RGBA、HSL、HSLA、颜色英语单词。
Sass 还提供了内置的 Colors 相关的各种函数，可以方便我们对颜色进行一个颜色值的调整和操作。

#### 基础调整函数

| 函数                      | 作用                | 示例                                                 |
| ------------------------- | ------------------- | ---------------------------------------------------- |
| lighten($color, N%)       | 增加亮度            | `lighten(#336699, 20%) → #6699cc`                    |
| darken($color, N%)        | 减少亮度            | `darken(#336699, 20%) → #003366`                     |
| saturate($color, N%)      | 增加饱和度          | `saturate(#808080, 100%) → #ff0000` (当原色为灰色时) |
| desaturate($color, N%)    | 减少饱和度          | `desaturate(red, 50%) → #bf4040`                     |
| opacify($color, N)        | 增加不透明度（0-1） | `opacify(rgba(red, 0.5), 0.2) → rgba(255,0,0,0.7)`   |
| transparentize($color, N) | 减少不透明度        | `transparentize(red, 0.3) → rgba(255,0,0,0.7)`       |

#### 高级混合函数

```scss
// 线性混合
$mix: mix(#f00, #00f, 50%); // → #7f007f

// 颜色比例混合
$weighted-mix: scale-color(#f00, $lightness: 50%);

// HSLA 调整
$hue-adjusted: adjust-hue(#f00, 120deg); // 色相旋转 → #00ff00
```

#### 颜色计算

```scss
// 颜色对比度计算
$contrast-ratio: contrast(#fff, #000); // → 21

// 灰度转换
$grayscale: grayscale(#f00); // → #808080
```
