import { IStore } from "../../@types/store";

export class Store {
    private props: IStore;

    private constructor(props: IStore) {
        this.props = props;
    }

    public static create(props: Omit<IStore, 'id' | 'createdAt' | 'updatedAt'>): Store {
        return new Store({
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

    public get address(): string {
        return this.props.address;
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get updatedAt(): Date {
        return this.props.updatedAt;
    }
}