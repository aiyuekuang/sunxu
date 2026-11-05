/**
 * 统一按钮文案常量
 *
 * 全局唯一数据源，所有表单页、弹窗、操作按钮的文案必须从此文件引用。
 *
 * ## 文案规范
 *
 * | 场景           | 格式              | 示例             |
 * |---------------|-------------------|-----------------|
 * | 新增实体       | "新增"            | "新增"           |
 * | 编辑实体       | "编辑"            | "编辑"           |
 * | 编辑保存       | "保存"            | —                 |
 * | 新增提交       | "新增"            | "新增"           |
 * | 弹窗保存       | "保存"            | —               |
 * | 新增从属子项   | "添加XXX"         | "添加工序"       |
 * | 确认操作       | "确认XXX"         | "确认拆分"       |
 * | 提交审批流     | "提交"            | —               |
 * | 删除操作       | "确认删除"        | —               |
 */

// ─── 表单页按钮 ──────────────────────────────────────────────────────────────

/** 表单页标题：根据 isEdit 返回“编辑”或“新增”。 */
export const formTitle = (_entity: string, isEdit: boolean): string => (isEdit ? '编辑' : '新增');

/** 表单页提交按钮：根据 isEdit 返回“保存”或“新增”。 */
export const formSubmitText = (_entity: string, isEdit: boolean): string =>
  isEdit ? '保存' : '新增';

// ─── 弹窗按钮 ───────────────────────────────────────────────────────────────

/** 弹窗标题：根据 isEdit 返回“编辑”或“新增”。 */
export const modalTitle = (_entity: string, isEdit: boolean): string => (isEdit ? '编辑' : '新增');

/** 弹窗确认按钮：根据 isEdit 返回“保存”或“新增”。 */
export const modalConfirmText = (_entity: string, isEdit: boolean): string =>
  isEdit ? '保存' : '新增';

/** 弹窗新增从属子项：根据 isEdit 返回“保存”或“添加XXX”。 */
export const modalAddText = (entity: string, isEdit: boolean): string =>
  isEdit ? '保存' : `添加${entity}`;

// ─── 通用操作按钮 ───────────────────────────────────────────────────────────

/** 确认操作（如确认拆分、确认指派等） */
export const confirmAction = (action: string): string => `确认${action}`;

// ─── toast 提示 ─────────────────────────────────────────────────────────────

/** 表单提交成功提示：根据 isEdit 返回“保存成功”或“新增成功”。 */
export const formSuccessToast = (isEdit: boolean): string => (isEdit ? '保存成功' : '新增成功');
