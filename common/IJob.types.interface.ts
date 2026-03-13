
import { IBaseEntity } from './Base.Interface';
export interface IJobTypes<TUserId = string> extends IBaseEntity<TUserId> {
    jobTypeName: string;
}