# 堆（Heap）

## 基础概念

### 什么是堆？

- 堆是一个完全二叉树
- 完全二叉树：除了最后一层，其他层的节点都是满的，最后一层的节点都靠左排列
- 堆属性：每个节点都满足与其子节点的特定大小关系

### 堆的分类

1. **最小堆（小顶堆）**
   - 每个节点的值都小于等于其子节点的值
   - 根节点是整个堆中的最小值

2. **最大堆（大顶堆）**
   - 每个节点的值都大于等于其子节点的值
   - 根节点是整个堆中的最大值

### 堆的存储

堆通常使用数组实现，利用完全二叉树的特性可以方便地计算节点关系：

```
对于索引为 i 的节点：
- 父节点索引：parent(i) = Math.floor((i - 1) / 2)
- 左子节点索引：left(i) = 2 * i + 1
- 右子节点索引：right(i) = 2 * i + 2

例如数组：[1, 3, 2, 6, 5, 4]
表示的最小堆：
      1
    /   \
   3     2
  / \   /
 6   5 4
```

## 最小堆实现

```typescript
class MinHeap {
  private heap: number[];

  constructor() {
    this.heap = [];
  }

  // 获取父节点的索引
  private getParentIndex(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  // 获取左子节点的索引
  private getLeftChildIndex(index: number): number {
    return 2 * index + 1;
  }

  // 获取右子节点的索引
  private getRightChildIndex(index: number): number {
    return 2 * index + 2;
  }

  // 交换两个节点的位置
  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  // 元素入堆
  push(value: number): void {
    this.heap.push(value);
    this.siftUp(this.size() - 1);
  }

  // 上浮操作：将新插入的节点与其父节点比较，如果小于父节点则交换位置
  private siftUp(index: number): void {
    while (index > 0) {
      const parentIndex = this.getParentIndex(index);
      if (this.heap[index] >= this.heap[parentIndex]) break;
      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  // 堆顶元素出堆
  pop(): number | undefined {
    if (this.isEmpty()) return undefined;
    if (this.size() === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.siftDown(0);
    return min;
  }

  // 下沉操作：将节点与其较小的子节点交换位置
  private siftDown(index: number): void {
    while (true) {
      const leftIndex = this.getLeftChildIndex(index);
      const rightIndex = this.getRightChildIndex(index);
      let smallest = index;

      if (
        leftIndex < this.size() &&
        this.heap[leftIndex] < this.heap[smallest]
      ) {
        smallest = leftIndex;
      }

      if (
        rightIndex < this.size() &&
        this.heap[rightIndex] < this.heap[smallest]
      ) {
        smallest = rightIndex;
      }

      if (smallest === index) break;
      this.swap(index, smallest);
      index = smallest;
    }
  }

  // 获取堆顶元素
  peek(): number | undefined {
    return this.heap[0];
  }

  // 获取堆的大小
  size(): number {
    return this.heap.length;
  }

  // 判断堆是否为空
  isEmpty(): boolean {
    return this.size() === 0;
  }

  // 获取堆的内容
  getHeap(): number[] {
    return [...this.heap];
  }
}
```

## 使用示例

```typescript
// 创建最小堆实例
const minHeap = new MinHeap();

// 添加元素
minHeap.push(3);
minHeap.push(1);
minHeap.push(4);
minHeap.push(1);
minHeap.push(5);
minHeap.push(9);

console.log('初始堆:', minHeap.getHeap());
// 输出: [1, 1, 4, 3, 5, 9]

// 移除最小元素
console.log('移除的最小元素:', minHeap.pop()); // 1
console.log('移除后的堆:', minHeap.getHeap());
// 输出: [1, 3, 4, 9, 5]

// 查看堆顶元素
console.log('当前堆顶元素:', minHeap.peek()); // 1

// 检查堆的大小
console.log('堆的大小:', minHeap.size()); // 5

// 检查堆是否为空
console.log('堆是否为空:', minHeap.isEmpty()); // false
```

## 应用场景

1. **优先队列**
   - 任务调度系统
   - 事件处理系统
   - 网络请求优先级处理

2. **排序算法**
   - 堆排序
   - 获取第 K 大/小的元素

3. **图算法**
   - Dijkstra 最短路径算法
   - Prim 最小生成树算法

## 时间复杂度

| 操作                | 时间复杂度 |
| ------------------- | ---------- |
| 插入元素 (push)     | O(log n)   |
| 删除最小元素 (pop)  | O(log n)   |
| 获取最小元素 (peek) | O(1)       |
| 获取大小 (size)     | O(1)       |
