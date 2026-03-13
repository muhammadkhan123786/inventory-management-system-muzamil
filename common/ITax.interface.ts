import { IBaseEntity } from './Base.Interface';

export interface ITax<TUserId = string> extends IBaseEntity<TUserId> {
    taxName: string;
    percentage: number,
    startDate?: Date,
    endDate?: Date
}

