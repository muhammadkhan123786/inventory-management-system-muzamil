import { IBaseEntity } from "../Base.Interface";

export interface IRiderAvailabilities<TUserId=string> extends IBaseEntity<TUserId>{
    name:string,
    fromTime:string,
    toTime:string,
}