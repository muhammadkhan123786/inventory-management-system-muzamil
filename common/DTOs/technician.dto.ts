import { commonProfileDto } from "./profilecommonDto";
import { ITechnicianZone } from '../ITechnician.interface';

export interface technicianProfileDto extends commonProfileDto {
    userId: string;
    roleId: string;
    zones: ITechnicianZone[];
    technicianRoleId: string;
    skills: string[];
    profilePhoto?: string;        // file path / URL
    certifications?: string[];
    employeeId: string;
}