import { IPromotion } from 'src/modules/promotions/domain/@types/promotion';

export class Promotion {
  private props: IPromotion;

  private constructor(props: IPromotion) {
    this.props = props;
  }

  public static fromPrisma(props: IPromotion): Promotion {
    return new Promotion(props);
  }

  public get id(): string {
    return this.props.id;
  }

  public get code(): string {
    return this.props.code;
  }

  public get discount(): number {
    return this.props.discount;
  }

  public get isActive(): boolean {
    return this.props.isActive;
  }

  public get expiresAt(): Date {
    return this.props.expiresAt;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public isValid(): boolean {
    return this.props.isActive && this.props.expiresAt > new Date();
  }
}
