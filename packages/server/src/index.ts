import "dotenv/config";
import { Server } from "ws";
import { ChatMessage, Message } from "@speeddrawer/shared";

const port = parseInt(process.env.PORT || "13370");
const wss = new Server({ port });

//message test, please don´t use this in production
const msg = new ChatMessage("testing");
const message = new Message("chat", msg.toBuffer());
const message2 = Message.fromBuffer(message.toBuffer());
console.log(ChatMessage.fromBuffer(message2.payload));
