import { IProduct } from "../@types/products";

export class Product {
    private props: IProduct;

    private constructor(props: IProduct) {
        this.props = props;
    }

    public static create(props: Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>): Product {
        return new Product({
            ...props,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    public get id(): string {
        return this.props.id;
    }

    public get name(): string {
        return this.props.name;
    }

    public get description(): string | undefined {
        return this.props.description;
    }

    public get price(): number {
        return this.props.price;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }

    public updateName(newName: string): void {
        this.props.name = newName;
        this.props.updatedAt = new Date();
    }

    public updateDescription(newDescription: string): void {
        this.props.description = newDescription;
        this.props.updatedAt = new Date();
    }

    public updatePrice(newPrice: number): void {
        this.props.price = newPrice;
        this.props.updatedAt = new Date();
    }

    public update(props: Partial<Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>>): void {
        if (props.name !== undefined) this.props.name = props.name;
        if (props.description !== undefined) this.props.description = props.description;
        if (props.price !== undefined) this.props.price = props.price;
        this.props.updatedAt = new Date();
    }
}