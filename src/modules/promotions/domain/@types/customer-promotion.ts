import { IPromotion } from "./promotion";

export interface ICustomerPromotion {
    id:string;
    customerId: string;
    promotionId: string;
    promotion?: IPromotion
    used: boolean;
    createdAt: Date;
    expiresAt?: Date;
}