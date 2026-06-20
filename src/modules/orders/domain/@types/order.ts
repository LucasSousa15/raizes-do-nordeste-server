export interface IOrder {
    id: string;
    storeId: string;
    items: IOrderItem[];
    customerId: string;
    channel: OrderChannel;
    totalAmount: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export enum OrderChannel {
    ONLINE = 'online',
    IN_STORE = 'in_store',
    PHONE = 'phone',
}

export enum OrderStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
}

export interface IOrderItem {
    productId: string;
    quantity: number;
    price: number;
}

export type CreateOrderItemReq = Omit<IOrderItem, 'price'>;

export interface PaginatedOrders {
    data: IOrder[];
    meta: {
        totalItems: number;
        lastPage: number;
        currentPage: number;
        itemsPerPage: number;
    };
}

export interface FindOrdersReq {
    orderId?: string;
    storeId?: string;
    customerId?: string;
    channel?: OrderChannel;
    status?: OrderStatus;
    minTotalAmount?: number;
    maxTotalAmount?: number;
    page?: number;
    limit?: number;
    createdAtStart?: Date;
    createdAtEnd?: Date; 
}

export interface CreateOrderReq {
    storeId: string;
    items: CreateOrderItemReq[];
    customerId: string;
    channel: OrderChannel;
}
