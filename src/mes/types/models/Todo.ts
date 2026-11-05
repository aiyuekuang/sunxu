/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TodoPriority } from './TodoPriority';
import type { TodoSource } from './TodoSource';
import type { TodoStatus } from './TodoStatus';
import type { TodoType } from './TodoType';
import type { User } from './User';
export type Todo = {
    assignee?: User;
    assigneeId: string;
    assigner?: User | null;
    assignerId?: string | null;
    /**
     * 过程附件URL列表
     */
    attachments?: Array<string>;
    /**
     * 协同人ID列表
     */
    collaboratorIds?: Array<string>;
    companyId: string;
    completedAt?: string | null;
    /**
     * 工作内容
     */
    content: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    documentNo?: string | null;
    dueDate?: string | null;
    entityId?: string | null;
    entityType?: string | null;
    /**
     * 实际完成时间
     */
    finishedAt?: string | null;
    id: string;
    /**
     * 计划完成时间
     */
    plannedEndAt?: string | null;
    /**
     * 计划开始时间
     */
    plannedStartAt?: string | null;
    priority: TodoPriority;
    /**
     * 处理结果
     */
    result?: string | null;
    source: TodoSource;
    /**
     * 实际开始时间
     */
    startedAt?: string | null;
    status: TodoStatus;
    title: string;
    type: TodoType;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};
