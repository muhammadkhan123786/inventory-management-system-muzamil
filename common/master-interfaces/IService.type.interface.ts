import { IBaseEntity } from '../Base.Interface';

export interface ITechnicianServiceType<TUserId = string> extends IBaseEntity<TUserId> {
    technicianServiceType: string;
}

