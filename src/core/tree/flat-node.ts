/**
 * 扁平化的树节点，附带层级信息。
 *
 * 用于将树形数据（Department、PermissionNode、WorkCenter 等）
 * 展开为 FlatList/FlashList 可渲染的一维数组。
 *
 * @typeParam T - 树节点的数据类型
 */
export interface FlatNode<T> {
  item: T;
  depth: number;
  hasChildren: boolean;
}
