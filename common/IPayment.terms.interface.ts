
import { IBaseEntity } from './Base.Interface';
export interface IPaymentTerms<TUserId = string> extends IBaseEntity<TUserId> {
    paymentTerm: string;
    description?: string;
}