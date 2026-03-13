
import { IBaseEntity } from './Base.Interface';
export interface IUnit<TUserId = string> extends IBaseEntity<TUserId> {
    unitName: string;

}