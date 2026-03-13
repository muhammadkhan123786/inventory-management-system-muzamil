import { IBaseEntity } from '../Base.Interface';
export interface IPaymentMethod<TUserId = string> extends IBaseEntity<TUserId> {
    paymentMethodName: string;
}