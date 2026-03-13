
export interface ICommonPersonalInfoInterface<TPersonId = string, TAddressId = string, TContactId = string> {
    personId: TPersonId,
    addressId: TAddressId,
    contactId: TContactId
}