import { IBaseEntity } from '../Base.Interface';

export interface ITechnicianInspectionList<TUserId = string> extends IBaseEntity<TUserId> {
    technicianInspection: string;
    technicianInspectionDescription: string
}

