
import { IBaseEntity } from './Base.Interface';
export interface IOrderStatus<TUserId = string> extends IBaseEntity<TUserId> {
    orderStatus: string;

}