import { JwtPayload } from "jsonwebtoken";
import { Socket } from "socket.io";
import { HUserDocument } from "../../DB/models/user.model";

export interface IOAuthSocket extends Socket {
  credentials?: {
    user: Partial<HUserDocument>;
    decoded: JwtPayload;
  };
}
