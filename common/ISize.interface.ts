
import { IBaseEntity } from './Base.Interface';
export interface ISize<TUserId = string> extends IBaseEntity<TUserId> {
    size: string;
}