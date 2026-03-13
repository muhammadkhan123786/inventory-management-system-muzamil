
import { IBaseEntity } from './Base.Interface';
export interface IColor<TUserId = string> extends IBaseEntity<TUserId> {
    colorName: string;
    colorCode: string;
}