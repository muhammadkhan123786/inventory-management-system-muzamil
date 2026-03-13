import { IBaseEntity } from '../Base.Interface';

export interface IParts<TUserId = string> extends IBaseEntity<TUserId> {
    partName: string;
    partNumber: string;
    unitCost: number;
    stock: number;
}

