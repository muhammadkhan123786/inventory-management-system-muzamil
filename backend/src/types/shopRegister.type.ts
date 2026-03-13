import { Types } from "mongoose";
import { IRegisterSharedInterface } from "../../../common/IRegisterSharedInterface";

export type IShopRegisterBackendInterface =
    IRegisterSharedInterface<Types.ObjectId>;