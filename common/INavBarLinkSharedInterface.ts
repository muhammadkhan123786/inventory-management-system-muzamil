export interface INavBarLinkSharedInterface {
  _id: string;
  label: string;
  href: string;
  alt?: string;
  roleId?: number[];
  index?: number;
  children?: INavBarLinkSharedInterface[];
  icon?: any;
  subItems?: INavBarLinkSharedInterface[];
  className?: string
}
