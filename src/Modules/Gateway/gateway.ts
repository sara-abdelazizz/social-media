import { Server as httpServer } from "node:http";
import { Server } from "socket.io";

import { decodedToken, TokenTypeEnum } from "../../Utils/security/token";
import { IOAuthSocket } from "./getaway.dto";
import { ChatGateway } from "../Chat/chat.getway";

let io: Server | null = null;
export const intialize = (httpServer: httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const connectedSockets = new Map<string, string[]>(); // {key ---> value}

  io.use(async (socket: IOAuthSocket, next) => {
    try {
      const { user, decoded } = await decodedToken({
        authorization: socket.handshake.auth.authorization,
        tokenType: TokenTypeEnum.ACCESS,
      });

      const userTabs = connectedSockets.get(user._id.toString()) || [];
      userTabs.push(socket.id);
      connectedSockets.set(user._id.toString(), userTabs);
      console.log(connectedSockets);

      socket.credentials = { user, decoded };

      next();
    } catch (error: any) {
      next(error);
    }
  });

  function disconnection(socket: IOAuthSocket) {
    socket.on("disconnect", () => {
      const userId = socket.credentials?.user._id?.toString() as string;
      let remainingTabs =
        connectedSockets.get(userId)?.filter((tab) => {
          return tab !== socket.id;
        }) || [];
      if (remainingTabs.length) {
        connectedSockets.set(userId, remainingTabs);
      } else {
        connectedSockets.delete(userId);
      }
      console.log(`After Delete: ${connectedSockets.get(userId)}`);
      console.log(connectedSockets);
    });
  }
  const chatGateway: ChatGateway = new ChatGateway();
  io.on("connection", (socket: IOAuthSocket) => {
    chatGateway.register(socket , getIo());
    disconnection(socket);
  });
};

export const getIo = (): Server => {
  if (!io) {
    throw new Error("socke.io is not initialized");
  }
  return io;
};
