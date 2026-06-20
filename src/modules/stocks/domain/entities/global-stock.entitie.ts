import { IGlobalStock } from "../@types/global-stock";

export class GlobalStock {
  private props: IGlobalStock;

  private constructor(props: IGlobalStock) {
    this.props = props;
  }

  public static create(props: Omit<IGlobalStock, 'id' | 'createdAt' | 'updatedAt'>): GlobalStock {
    return new GlobalStock({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public get id(): string {
    return this.props.id;
  }

  public get productId(): string {
    return this.props.productId;
  }

  public get quantity(): number {
    return this.props.quantity;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public increase(amount: number): void {
    this.props.quantity += amount;
    this.props.updatedAt = new Date();
  }

  public decrease(amount: number): void {
    this.props.quantity -= amount;
    this.props.updatedAt = new Date();
  }

  public setQuantity(quantity: number): void {
    this.props.quantity = quantity;
    this.props.updatedAt = new Date();
  }
}