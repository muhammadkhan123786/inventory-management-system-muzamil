
import { Document, Model, model, Schema, Types } from "mongoose";

import { IChannel } from "../../../common/IChannel.interface";

import { channelSchema } from "../schemas/channel.schema";


export type channelDoc = IChannel<Types.ObjectId> & Document;
const channelDbSchema = new Schema<channelDoc>({
    ...channelSchema
}, { timestamps: true });


export const Channels: Model<channelDoc> = model<channelDoc>("Channels", channelDbSchema);
