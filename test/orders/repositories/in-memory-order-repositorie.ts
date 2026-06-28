import { FindOrdersReq, IOrder, IOrderItem, PaginatedOrders, OrderStatus } from "src/modules/orders/domain/@types/order";
import { Order } from "src/modules/orders/domain/entities/order.entitie";
import { OrderRepository } from "src/modules/orders/domain/repositories/order.repositorie";
import { ProductRepository } from "src/modules/products/domain/repositories/product.repositorie";


export class InMemoryOrderRepository implements OrderRepository {
    public items: Order[] = [];

    constructor(private productsRepository?: ProductRepository) {}

    private paginate(orders: Order[], page = 1, limit = 10): PaginatedOrders {
        const currentPage = Number.isNaN(Number(page)) ? 1 : Number(page);
        const itemsPerPage = Number.isNaN(Number(limit)) ? 10 : Number(limit);
        const start = (currentPage - 1) * itemsPerPage;
        const paginatedItems = orders.slice(start, start + itemsPerPage).map(o => ({
            id: o.id,
            storeId: o.storeId,
            items: o.items,
            customerId: o.customerId,
            channel: o.channel,
            totalAmount: o.totalAmount,
            status: o.status,
            discount: o.discount,
            createdAt: o.createdAt,
            updatedAt: o.updatedAt,
        }));

        return {
            data: paginatedItems,
            meta: {
                totalItems: orders.length,
                lastPage: Math.ceil(orders.length / itemsPerPage),
                currentPage,
                itemsPerPage,
            },
        };
    }

    private async buildItems(items: IOrderItem[]): Promise<IOrderItem[]> {
        if (!this.productsRepository) {
            return items.map(i => ({ ...i }));
        }

        const built: IOrderItem[] = [];
        for (const it of items) {
            const product = await this.productsRepository.findById(it.productId);
            if (!product) throw new Error(`Product ${it.productId} not found`);
            built.push({ productId: it.productId, quantity: it.quantity, price: product.price });
        }
        return built;
    }

    async createOrder(data: Omit<IOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
        const itemsWithPrice = await this.buildItems(data.items);

        const providedTotalAmount = data.totalAmount;
        const totalAmount = providedTotalAmount !== undefined
            ? providedTotalAmount
            : itemsWithPrice.reduce((sum, it) => sum + it.price * it.quantity, 0);

        const orderData: Omit<IOrder, 'id' | 'createdAt' | 'updatedAt'> = {
            ...data,
            items: itemsWithPrice,
            totalAmount,
            status: data.status ?? OrderStatus.PENDING,
        };

        const newOrder = Order.create(orderData);
        this.items.push(newOrder);
        return newOrder;
    }

    async findAll(params: FindOrdersReq): Promise<PaginatedOrders> {
        let filtered = this.items;
        if (params?.orderId) filtered = filtered.filter(o => o.id === params.orderId);
        if (params?.storeId) filtered = filtered.filter(o => o.storeId === params.storeId);
        if (params?.customerId) filtered = filtered.filter(o => o.customerId === params.customerId);
        if (params?.channel) filtered = filtered.filter(o => o.channel === params.channel);
        if (params?.status) filtered = filtered.filter(o => o.status === params.status);
        if (params?.minTotalAmount !== undefined) filtered = filtered.filter(o => o.totalAmount >= params.minTotalAmount!);
        if (params?.maxTotalAmount !== undefined) filtered = filtered.filter(o => o.totalAmount <= params.maxTotalAmount!);
        if (params?.createdAtStart !== undefined) filtered = filtered.filter(o => o.createdAt >= params.createdAtStart!);
        if (params?.createdAtEnd !== undefined) filtered = filtered.filter(o => o.createdAt <= params.createdAtEnd!);
        return this.paginate(filtered, params?.page ?? 1, params?.limit ?? 10);
    }

    async findById(id: string): Promise<Order | null> {
        const order = this.items.find((item) => item.id === id);
        return order ?? null;
    }

    async update(id: string, data: Partial<Omit<IOrder, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Order> {
        const index = this.items.findIndex((item) => item.id === id);
        if (index === -1) {
            throw new Error('Order not found');
        }

        const existing = this.items[index];

        if (data.items) {
            const itemsWithPrice = await this.buildItems(data.items);
            existing.updateItems(itemsWithPrice);
            existing.updateTotalAmount(itemsWithPrice.reduce((s, it) => s + it.price * it.quantity, 0));
        }

        if (data.totalAmount !== undefined) {
            existing.updateTotalAmount(data.totalAmount);
        }

        if (data.status) {
            existing.updateStatus(data.status as any);
        }
        
        return existing;
    }

    async delete(id: string): Promise<void> {
        const index = this.items.findIndex((item) => item.id === id);
        if (index === -1) {
            throw new Error('Order not found');
        }
        this.items.splice(index, 1);
    }

}
