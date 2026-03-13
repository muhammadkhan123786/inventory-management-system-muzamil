
import { IBaseEntity } from './Base.Interface';
export interface IWarehouseStatus<TUserId = string> extends IBaseEntity<TUserId> {
    wareHouseStatus: string;
}