import { IBaseEntity } from '../Base.Interface';
export interface IPricingAgreement<TUserId = string> extends IBaseEntity<TUserId> {
    pricingAgreementName: string;
}