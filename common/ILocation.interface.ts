
import { IBaseEntity } from './Base.Interface';
export interface ILocation<TUserId = string> extends IBaseEntity<TUserId> {
    locationName: string;

}