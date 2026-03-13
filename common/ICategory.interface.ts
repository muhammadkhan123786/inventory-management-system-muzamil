
//  Update By Muzamil Hassan 7/1/2026

import { IBaseEntity } from './Base.Interface';
export interface ICategory<TUserId = string, TId = string, IParentId = string | null > extends IBaseEntity<TUserId> {
    categoryName: string;
    parentId?: IParentId | ICategory | TId | null;
        children?: ICategory<TUserId, TId>[];
}

