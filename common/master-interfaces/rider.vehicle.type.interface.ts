import { IBaseEntity } from '../Base.Interface';

export interface IVehicleType<TUserId = string> extends IBaseEntity<TUserId> {
    vehicleType: string;
}