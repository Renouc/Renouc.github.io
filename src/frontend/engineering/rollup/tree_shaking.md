# Tree Shaking

**Tree Shaking** 是 Rollup 中一项重要的静态优化技术，用于在打包时**移除未被引用的模块导出**，以减小最终 bundle 的体积。
Rollup 通过 **静态分析 ES Module 依赖图** 来判断哪些代码实际被使用（“活跃导出”），并在生成阶段仅输出这些部分。

## 一、Tree Shaking 的工作原理

1. **依赖图分析（Dependency Graph）**
   Rollup 会对所有 `import` / `export` 语句进行静态分析，构建模块间的依赖关系。

2. **导出标记（Mark Phase）**
   它会从入口文件出发，递归标记被使用的导出（live bindings）。

3. **代码生成（Generate Phase）**
   在生成最终 bundle 时，仅输出被标记为“活跃”的导出，未使用的代码会被移除。

## 二、使用 Tree Shaking 的注意事项

1. **使用 ES Module 语法**

   Rollup 只能对 ES Module（`import` / `export`）进行静态分析。
   CommonJS (`require` / `module.exports`) 是动态的，无法静态确定依赖，因而无法被完全 Tree Shaking。

2. **保持函数无副作用（pure functions）**

   在 Rollup 中，可以通过特殊注释告诉打包器哪些代码是“无副作用”的，从而允许它在未被使用时安全地删除。

   包含 `@__PURE__` 或 `#__PURE__` 的注释标记特定的**函数调用**或**构造函数调用**为无副作用。

   ```js
   /*#__PURE__*/
   console.log('--这段信息打包时会被移除--');
   ```

   包含 `@__NO_SIDE_EFFECTS__` 或者 `#__NO_SIDE_EFFECTS__` 的注释标记函数声明本身是无副作用的。

   ```js
   /*@__NO_SIDE_EFFECTS__*/
   function impure() {
     console.log('会被移除');
   }

   const impureArrowFn = () => {
     console.log('不会被移除');
   };

   impure();
   impureArrowFn();
   ```

   > 💡 配置项 `treeshake.annotations` 控制 Rollup 是否启用这些注释的识别，默认值为 true。关闭后，注释将被忽略。

3. **导出形式不限于具名导出**

   Tree Shaking 的触发条件与导出形式无关——无论是具名导出（named export）还是默认导出（default export），只要模块或导出成员未被引用，Rollup 都会尝试在打包时将其移除。

   不过需要注意的是，两种导出形式的可优化粒度不同：
   - 对于 具名导出，Rollup 能静态分析出哪些具体导出被使用，从而精确删除未引用的部分；
   - 对于 默认导出，一旦被引用，Rollup 会将整个默认导出视为一个整体保留，无法仅移除其中的部分成员。

4. **动态导入与代码分割**

   `import()` 动态导入本身不会触发 Tree Shaking，而是让 Rollup 为每个动态模块单独打包。
   这些模块内部依然会执行 Tree Shaking。

## 三、与 Webpack 的区别

- **Rollup**：基于 ES Module 静态分析，优化力度更强，适合库打包。
- **Webpack**：依赖 Babel 和 Terser 进行副作用分析，适合应用打包。
