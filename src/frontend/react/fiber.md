# Fiber 结构

## Fiber 对象的结构

- elementType 原始类型，如高阶组件React.memo(App)等，直接返回包装后的组件

- type 被解析过后的类型，通过elementType解析得到
