
import { IBaseEntity } from './Base.Interface';
export interface IChannel<TUserId = string> extends IBaseEntity<TUserId> {
    channelName: string;

}