import { StaticImageData } from "next/image";
import { INavBarLinkSharedInterface } from "../../../common/INavBarLinkSharedInterface";

export interface NavLinksInterface
  extends Omit<INavBarLinkSharedInterface, "children"> {
  iconSrc?: string | StaticImageData;
  // Overriding children to ensure they also use NavLinksInterface
  children?: NavLinksInterface[];
}
