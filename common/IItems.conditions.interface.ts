
import { IBaseEntity } from './Base.Interface';
export interface IItemsConditions<TUserId = string> extends IBaseEntity<TUserId> {
    itemConditionName: string;
}