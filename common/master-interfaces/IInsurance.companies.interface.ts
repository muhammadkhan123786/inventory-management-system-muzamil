import { IBaseEntity } from '../Base.Interface';

export interface IInsuranceCompanies<TUserId = string> extends IBaseEntity<TUserId> {
    insuranceCompanyName: string;

}

