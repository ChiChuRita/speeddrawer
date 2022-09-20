import { Type } from "avsc";

export enum MessageType {
    INITIALIZE_USER,
    INITIALIZE_USER_RESPONSE,
    KICK_USER,
    USER_JOINED_INFO,
    USER_LEFT_INFO,
    CHANGE_ROOM,
    CHANGE_ROOM_INFO,
    GAME_START,
    GAME_START_INFO,
}

export interface GenericMessage {
    type: MessageType;
    payload: Buffer;
}

interface User {
    id: string;
    username: string;
}

const MessageSchema = Type.forSchema({
    type: "record",
    name: "Message",
    fields: [
        {
            name: "type",
            type: {
                type: "enum",
                name: "MessageType",
                symbols: [
                    "INITIALIZE_USER",
                    "INITIALIZE_USER_RESPONSE",
                    "KICK_USER",
                    "USER_JOINED_INFO",
                    "USER_LEFT_INFO",
                    "CHANGE_ROOM",
                    "CHANGE_ROOM_INFO",
                    "GAME_START",
                    "GAME_START_INFO",
                ],
            },
        },

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

class Message {
    schema: Type;
    type: MessageType;

    constructor(schema: Type, type: MessageType) {
        this.schema = schema;
        this.type = type;
    }

    toBuffer(messageObj: any): Buffer {
        return msgToBuffer(this.type, this.schema, messageObj);
    }
}

// Create new schemas and message classes based on the template:

const InitializeUserSchema = Type.forSchema({
    type: "record",
    name: "InitializeUserMessage",
    fields: [
        { name: "username", type: "string" },
        { name: "roomId", type: ["string", "null"], default: null },
    ],
});

export class InitializeUserMessage extends Message {
    username: string;
    roomId: string | null;
    private static readonly schema = InitializeUserSchema;
    private static readonly type = MessageType.INITIALIZE_USER;

    constructor(username: string, roomId: string | null) {
        super(InitializeUserMessage.schema, InitializeUserMessage.type);
        this.username = username;
        this.roomId = roomId;
    }

    static fromBuffer(message: GenericMessage) {
        return this.schema.fromBuffer(message.payload) as typeof this.prototype;
    }

    toBuffer(): Buffer {
        return super.toBuffer(this);
    }
}

const InitializeUserResponseSchema = Type.forSchema({
    type: "record",
    name: "InitializeUserMessage",
    fields: [
        { name: "userId", type: ["string", "null"], default: null },
        { name: "room", type: ["string", "null"], default: null },
        {
            name: "users",
            type: [
                {
                    type: "array",
                    items: {
                        name: "User",
                        type: "record",
                        fields: [
                            { name: "id", type: "string" },
                            { name: "username", type: "string" },
                        ],
                    },
                },
                "null",
            ],
            default: null,
        },
        { name: "ownerId", type: ["string", "null"], default: null },
    ],
});

export class InitializeUserResponseMessage extends Message {
    userId: string | null;
    room: string | null;
    users: User[] | null;
    ownerId: string | null;

    private static readonly schema = InitializeUserResponseSchema;
    private static readonly type = MessageType.INITIALIZE_USER_RESPONSE;

    constructor(
        userId: string | null,
        room: string | null,
        users: User[] | null,
        ownerId: string | null
    ) {
        super(
            InitializeUserResponseMessage.schema,
            InitializeUserResponseMessage.type
        );
        this.userId = userId;
        this.room = room;
        this.users = users;
        this.ownerId = ownerId;
    }

    static fromBuffer(message: GenericMessage) {
        return this.schema.fromBuffer(message.payload) as typeof this.prototype;
    }

    toBuffer(): Buffer {
        return super.toBuffer(this);
    }
}

const KickUserSchema = Type.forSchema({
    type: "record",
    name: "KickUserMessage",
    fields: [{ name: "userId", type: "string" }],
});

export class KickUserMessage extends Message {
    userId: string;
    private static readonly schema = KickUserSchema;
    private static readonly type = MessageType.KICK_USER;

    constructor(userId: string) {
        super(KickUserMessage.schema, KickUserMessage.type);
        this.userId = userId;
    }

    static fromBuffer(message: GenericMessage) {
        return this.schema.fromBuffer(message.payload) as typeof this.prototype;
    }

    toBuffer(): Buffer {
        return super.toBuffer(this);
    }
}

const UserJoinedSchema = Type.forSchema({
    type: "record",
    name: "UserJoinedMessage",
    fields: [
        { name: "userId", type: "string" },
        { name: "username", type: "string" },
    ],
});

export class UserJoinedMessage extends Message {
    userId: string;
    username: string;
    private static readonly schema = UserJoinedSchema;
    private static readonly type = MessageType.USER_JOINED_INFO;

    constructor(userId: string, username: string) {
        super(UserJoinedMessage.schema, UserJoinedMessage.type);
        this.userId = userId;
        this.username = username;
    }

    static fromBuffer(message: GenericMessage) {
        return this.schema.fromBuffer(message.payload) as typeof this.prototype;
    }

    toBuffer(): Buffer {
        return super.toBuffer(this);
    }
}

const UserLeftSchema = Type.forSchema({
    type: "record",
    name: "UserLeftMessage",
    fields: [
        { name: "userId", type: "string" },
        { name: "ownerId", type: "string" },
    ],
});

export class UserLeftMessage extends Message {
    userId: string;
    ownerId: string;
    private static readonly schema = UserLeftSchema;
    private static readonly type = MessageType.USER_LEFT_INFO;

    constructor(userId: string, ownerId: string) {
        super(UserLeftMessage.schema, UserLeftMessage.type);
        this.userId = userId;
        this.ownerId = ownerId;
    }

    static fromBuffer(message: GenericMessage) {
        return this.schema.fromBuffer(message.payload) as typeof this.prototype;
    }

    toBuffer(): Buffer {
        return super.toBuffer(this);
    }
}

// TODO: Add more fields probably
const ChangeRoomSchema = Type.forSchema({
    type: "record",
    name: "ChangeRoomMessage",
    fields: [{ name: "roundNumber", type: "int" }],
});

export class ChangeRoomMessage extends Message {
    roundNumber: number;
    private static readonly schema = ChangeRoomSchema;
    private static readonly type = MessageType.CHANGE_ROOM;

    constructor(roundNumber: number) {
        super(ChangeRoomMessage.schema, ChangeRoomMessage.type);
        this.roundNumber = roundNumber;
    }

    static fromBuffer(message: GenericMessage) {
        return this.schema.fromBuffer(message.payload) as typeof this.prototype;
    }

    toBuffer(): Buffer {
        return super.toBuffer(this);
    }
}
