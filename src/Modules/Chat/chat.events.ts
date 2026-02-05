import { Server } from "socket.io";
import { IOAuthSocket } from "../Gateway/getaway.dto";
import { ChatService } from "./chat.service";

export class ChatEvent {
  private _chatService = new ChatService();
  constructor() {}
  sayHi = (socket: IOAuthSocket , io:Server) => {
    return socket.on("sayHi", (message, callback) => {
      this._chatService.sayHi({ message, socket, callback , io });
    });
  };
  sendMessage = (socket: IOAuthSocket , io:Server) => {
    return socket.on(
      "sendMessage",
      (data: { content: string; sendTo: string }) => {
        this._chatService.sendMessage({ ...data, socket ,io});
      },
    );
  };
}
