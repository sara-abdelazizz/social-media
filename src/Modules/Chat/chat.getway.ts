import { Server } from "socket.io";
import { IOAuthSocket } from "../Gateway/getaway.dto";
import { ChatEvent } from "./chat.events";

export class ChatGateway {
  private _chatEvent = new ChatEvent();
  constructor() {}

  register = (socket: IOAuthSocket , io:Server) => {
    this._chatEvent.sayHi(socket,io);
    this._chatEvent.sendMessage(socket,io);
  };
}
