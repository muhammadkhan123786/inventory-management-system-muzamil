import { IBaseEntity } from '../Base.Interface';

export interface IDecision<TUserId = string> extends IBaseEntity<TUserId> {
    decision: string;
    description: string;
    color: string;
}

