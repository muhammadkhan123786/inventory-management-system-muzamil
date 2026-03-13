
import { IBaseEntity } from './Base.Interface';
export interface IProductSource<TUserId = string> extends IBaseEntity<TUserId> {
    productSource: string;
}