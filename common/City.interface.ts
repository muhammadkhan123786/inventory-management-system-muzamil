import { IBaseEntity } from './Base.Interface';
export interface ICityInterface<TUserId = string, ICountryId = string> extends IBaseEntity<TUserId> {
    countryId: ICountryId
    cityName: string;
}