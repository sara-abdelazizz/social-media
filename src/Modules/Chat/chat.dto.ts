import z from "zod";
import { IOAuthSocket } from "../Gateway/getaway.dto";
import { getChatSchema } from "./chat.validation";
import { Server } from "socket.io";

export interface ISayHiDTO {
  message: string;
  socket: IOAuthSocket;
  callback: any;
  io:Server;
}

export interface ISendMessageDTO {
  content: string;
  socket: IOAuthSocket;
  sendTo: string;
  io:Server;

}
export type IGetChatDTO = z.infer<typeof getChatSchema.params>;
