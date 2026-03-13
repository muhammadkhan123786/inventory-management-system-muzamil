
import { IBaseEntity } from './Base.Interface';
export interface ICountry<TUserId = string> extends IBaseEntity<TUserId> {
    countryName: string;
}