import { NavLinksInterface } from "@/types/NavLinksInterface";
import { navigation } from "@/data/permissions";

interface NavItem {
  _id: number;
  label: string;
  href: string;
  icon: any;
  roleId: number[];
  subItems?: NavItem[];
}
export function getRoleBaseNavBarLinks(roleId: number): NavLinksInterface[] {
    return navigation.filter((link) => link.roleId?.includes(roleId));
}


