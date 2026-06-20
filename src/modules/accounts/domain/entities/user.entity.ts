import { IUser } from "../@types/users";

export class User {
    private _id: string;
    private props:  IUser;

    constructor(props: IUser, id?: string) {
        this._id = id ?? crypto.randomUUID();
        this.props = props;
    }    

    public static create(props: IUser, _id?: string): User {
        return new User({
            ...props
        }, 
        _id);
    }

    get id(): string {
    return this.id;
    }
    get name(): string {
        return this.props.name;
    }

    get email(): string {
        return this.props.email;
    }

    get password(): string {
        return this.props.password;
    }

    get role(): string {
        return this.props.role;
    }

    get status(): string {
        return this.props.status;
    }

    get profile(): string | undefined {
        return this.props.profile;
    }
}

