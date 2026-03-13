import { IBaseEntity } from './Base.Interface';

export interface IProductVariants<TUserId = string, TColorId = string, TSizeId = string> extends IBaseEntity<TUserId> {
    sizeId?: TSizeId;
    colorId?: TColorId;
    material: string;
    length?: number;
    width?: number;
    height?: number;
    grossWeight?: number;
}