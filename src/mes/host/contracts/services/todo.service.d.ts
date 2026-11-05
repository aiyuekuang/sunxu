import type { TodoListItemDto } from '../generated/models/TodoListItemDto.d.ts';
import type { TodoUnreadCountDto } from '../generated/models/TodoUnreadCountDto.d.ts';
export type { TodoListItemDto } from '../generated/models/TodoListItemDto.d.ts';
export type { TodoListDto } from '../generated/models/TodoListDto.d.ts';
/** 前端别名 */
export type TodoListItem = TodoListItemDto;
export type TodoType = 'approval' | 'task' | 'reminder';
export type TodoStatus = 'pending' | 'in_progress' | 'done' | 'cancelled';
export type TodoPriority = 'high' | 'medium' | 'low';
export type TodoCount = TodoUnreadCountDto;
export declare const todoService: {
    list(params: {
        page?: number;
        pageSize?: number;
        type?: TodoType;
        types?: TodoType[];
        status?: TodoStatus;
        statuses?: TodoStatus[];
        entityType?: string;
        keyword?: string;
        orderBy?: string;
        orderDir?: "ASC" | "DESC";
    }): Promise<import("./_base.d.ts").PaginatedList<TodoListItemDto>>;
    count(): import("../../../types/generated/index").Promise<TodoUnreadCountDto>;
    start(id: string): import("../../../types/generated/index").Promise<import("../../../types/generated/index").Todo>;
    complete(id: string, result: string): import("../../../types/generated/index").Promise<import("../../../types/generated/index").Todo>;
    cancel(id: string): import("../../../types/generated/index").Promise<import("../../../types/generated/index").Todo>;
};
