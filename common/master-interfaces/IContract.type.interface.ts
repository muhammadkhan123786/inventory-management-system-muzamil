import { IBaseEntity } from '../Base.Interface';

export interface IContract<TUserId = string> extends IBaseEntity<TUserId> {
    contractType: string;
}

