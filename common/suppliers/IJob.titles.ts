import { IBaseEntity } from '../Base.Interface';
export interface IJobTitles<TUserId = string> extends IBaseEntity<TUserId> {
    jobTitleName: string;
}