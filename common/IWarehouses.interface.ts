import { IBaseEntity } from "./Base.Interface";


export interface IWarehouse<
    TUserId = string,
    TPersonId = string,
    TAddressId = string,
    TContactId = string,
    TWarehouseStatusId = string
>
    extends IBaseEntity<TUserId> {
    personId: TPersonId;
    addressId: TAddressId;
    contactId: TContactId;
    wareHouseStatusId: TWarehouseStatusId;
    openTime: Date;
    closeTime: Date;
    capacity: number;
    availableCapacity: number;
}
