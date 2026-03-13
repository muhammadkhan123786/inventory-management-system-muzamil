import { IBaseEntity } from '../Base.Interface';
export interface IProductServices<TUserId = string> extends IBaseEntity<TUserId> {
    productServicesName: string;
}