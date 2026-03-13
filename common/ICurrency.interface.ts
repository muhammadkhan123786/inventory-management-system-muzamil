
import { IBaseEntity } from './Base.Interface';
export interface ICurrency<TUserId = string> extends IBaseEntity<TUserId> {
    currencyName: string;
    currencySymbol: string;
}