export type TicketStatus = 'open' | 'replied' | 'closed';
export interface Ticket {
    id: number;
    ticketNo: string;
    tenantCode: string;
    userId: string;
    username: string;
    title: string;
    description: string;
    status: TicketStatus;
    createdAt: string;
    updatedAt: string;
}
export interface TicketReply {
    id: number;
    ticketId: number;
    content: string;
    replyBy: 'user' | 'admin';
    replyUser: string;
    createdAt: string;
}
export interface TicketDetail {
    ticket: Ticket;
    replies: TicketReply[];
}
export interface TicketListResult {
    list: Ticket[];
    total: number;
}
export declare const ticketService: {
    /** 提交工单 */
    submit(title: string, description: string): Promise<Ticket>;
    /** 我的工单列表 */
    myList(params?: {
        status?: TicketStatus;
        page?: number;
        pageSize?: number;
    }): Promise<TicketListResult>;
    /** 我的工单详情 */
    myDetail(ticketId: number): Promise<TicketDetail>;
    /** 用户追加回复 */
    reply(ticketId: number, content: string): Promise<TicketReply>;
};
