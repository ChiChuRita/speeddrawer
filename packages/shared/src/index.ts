import { Type } from "avsc";

//Replace this with your own code, just for example. You can probably create a better structure for everything.

const ChatMessageType = Type.forSchema({
    type: "record",
    name: "ChatMessage",
    fields: [{ name: "content", type: "string" }],
});

export class ChatMessage {
    public content: string;

    constructor(content: string) {
        this.content = content;
    }

    static fromBuffer(buffer: Buffer): ChatMessage {
        return ChatMessageType.fromBuffer(buffer) as ChatMessage;
    }

    toBuffer(): Buffer {
        return ChatMessageType.toBuffer(this);
    }
}

const MessageType = Type.forSchema({
    type: "record",
    name: "Message",
    fields: [
        { name: "type", type: "string" },
        { name: "payload", type: "bytes" },
    ],
});

export class Message {
    public type: string; //USE ENUMS
    public payload: Buffer;

    constructor(type: string, payload: Buffer) {
        this.type = type;
        this.payload = payload;
    }

    static fromBuffer(buffer: Buffer): Message {
        return MessageType.fromBuffer(buffer) as Message;
    }

    toBuffer(): Buffer {
        return MessageType.toBuffer(this);
    }
}
