export interface IPromotion {
  id: string;
  code: string;
  discount: number;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
}

export interface FindPromotionByCodeReq {
  code: string;
}
