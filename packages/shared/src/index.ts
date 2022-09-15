import { Type } from "avsc";
import { consoleLog } from "./console-log";

export enum MessageType {
    CHANGE_ROOM,
    LEAVE_ROOM,
    CHAT_MESSAGE,
    CHANGE_USERNAME,
}

export interface GenericMessage {
    type: MessageType;
    payload: Buffer;
}

const MessageSchema = Type.forSchema({
    type: "record",
    name: "Message",
    fields: [
        { name: "type", type: "string" },
        { name: "payload", type: "bytes" },
    ],
});

export const msgFromBuffer = (buffer: Buffer) => {
    const rawMessage = MessageSchema.fromBuffer(buffer);
    return {
        type: MessageType[rawMessage.type as keyof typeof MessageType],
        payload: rawMessage.payload,
    } as GenericMessage;
};

const msgToBuffer = (type: MessageType, schema: Type, message: any): Buffer => {
    return MessageSchema.toBuffer({
        type: MessageType[type],
        payload: schema.toBuffer(message),
    });
};

// Create new schemas and message classes based on the template:
const ChatMessageSchema = Type.forSchema({
    type: "record",
    name: "ChatMessage",
    fields: [
        { name: "content", type: "string" },
        { name: "username", type: "string" },
    ],
});

export class ChatMessage {
    username: string;
    content: string;
    constructor(username: string, content: string) {
        this.username = username;
        this.content = content;
    }

    static fromBuffer(message: GenericMessage): ChatMessage {
        return ChatMessageSchema.fromBuffer(message.payload) as ChatMessage;
    }

    toBuffer(): Buffer {
        return msgToBuffer(MessageType.CHAT_MESSAGE, ChatMessageSchema, this);
    }
}

const LeaveRoomSchema = Type.forSchema({
    type: "record",
    name: "LeaveRoomMessage",
    fields: [
        { name: "content", type: "string" },
        { name: "username", type: "string" },
    ],
});

export class LeaveRoomMessage {
    username: string;
    content: string;
    constructor(username: string, content: string) {
        this.username = username;
        this.content = content;
    }

    static fromBuffer(message: GenericMessage): LeaveRoomMessage {
        return LeaveRoomSchema.fromBuffer(message.payload) as LeaveRoomMessage;
    }

    toBuffer(): Buffer {
        return msgToBuffer(MessageType.LEAVE_ROOM, LeaveRoomSchema, this);
    }
}
const ChangeRoomSchema = Type.forSchema({
    type: "record",
    name: "ChatMessage",
    fields: [{ name: "room", type: "string" }],
});

export class ChangeRoomMessage {
    room: string;
    constructor(room: string) {
        this.room = room;
    }

    static fromBuffer(message: GenericMessage): ChangeRoomMessage {
        return ChangeRoomSchema.fromBuffer(
            message.payload
        ) as ChangeRoomMessage;
    }

    toBuffer(): Buffer {
        return msgToBuffer(MessageType.CHANGE_ROOM, ChangeRoomSchema, this);
    }
}
