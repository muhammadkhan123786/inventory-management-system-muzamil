import { IBaseEntity } from '../Base.Interface';

export interface IIcons<TUserId = string> extends IBaseEntity<TUserId> {
    iconName: string;
    icon: string;
}

