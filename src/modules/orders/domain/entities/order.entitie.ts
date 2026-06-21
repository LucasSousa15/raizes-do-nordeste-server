import { IOrder, IOrderItem, OrderChannel, OrderStatus } from "../@types/order";

export class Order {
  private props: IOrder;

  private constructor(props: IOrder) {
    this.props = props;
  }

  public static create(props: Omit<IOrder, 'id' | 'createdAt' | 'updatedAt'>): Order {
    return new Order({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public get id(): string {
    return this.props.id;
  }

  public get storeId(): string {
    return this.props.storeId;
  }

  public get customerId(): string {
    return this.props.customerId;
  }

  public get channel(): OrderChannel {
    return this.props.channel;
  }

  public get items(): IOrderItem[] {
    return this.props.items;
  }

  public get totalAmount(): number {
    return this.props.totalAmount;
  }

  public get status(): string {
    return this.props.status;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public updateItems(newItems: IOrderItem[]): void {
    this.props.items = newItems;
    this.props.updatedAt = new Date();
  }

  public updateTotalAmount(newTotal: number): void {
    this.props.totalAmount = newTotal;
    this.props.updatedAt = new Date();
  }

  public updateStatus(newStatus: OrderStatus): void {
    this.props.status = newStatus;
    this.props.updatedAt = new Date();
  }

  public static fromPrisma(props: IOrder): Order {
    return new Order(props);
  }
}
