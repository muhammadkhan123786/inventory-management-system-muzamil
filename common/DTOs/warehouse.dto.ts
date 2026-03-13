import { basicCommonInfoDto } from '../DTOs/profilecommonDto';
export interface warehouseDto extends basicCommonInfoDto {
    wareHouseStatusId: string;
    openTime: Date;
    closeTime: Date;
    capacity: number;
    availableCapacity: number;
    isActive?: boolean;
    isDeleted?: boolean;
    isDefault?: boolean;
}