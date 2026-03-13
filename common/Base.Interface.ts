export interface IBaseEntity<TUserId = string> {
    _id?: string;
    userId: TUserId;
    isActive?: boolean;
    isDeleted?: boolean;
    isDefault?: boolean;
}