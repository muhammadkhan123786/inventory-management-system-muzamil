
import { IBaseEntity } from '../Base.Interface';
export interface IBusinessTypes<TUserId = string> extends IBaseEntity<TUserId> {
    businessTypeName: string;
}