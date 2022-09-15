import "dotenv/config";
import { Server, WebSocket } from "ws";
import {
    ChatMessage,
    MessageType,
    msgFromBuffer,
    GenericMessage,
    ChangeRoomMessage,
    LeaveRoomMessage,
} from "@speeddrawer/shared";
import { nanoid } from "nanoid";

//DELETE!
export enum InfoLevel {
    INFO,
    WARNING,
    ERROR,
}

export const consoleLog = (msg: string, level: InfoLevel) => {
    let prefix;
    switch (level) {
        case InfoLevel.INFO:
            prefix = "[Info]";
            break;
        case InfoLevel.WARNING:
            prefix = "[Warning]";
            break;
        case InfoLevel.ERROR:
            prefix = "[Error]";
            break;
    }
    console.log(`${prefix} ${msg}`);
};

class User {
    username: string;
    id: string;
    currentRoom: Room;
    ws: WebSocket;
    isAlive: boolean;
    static users = new Map<WebSocket, User>();

    constructor(ws: WebSocket) {
        const uid = nanoid(6);
        this.username = "User" + uid;
        this.id = uid;
        this.currentRoom = new Room(uid, this);
        this.ws = ws;
        this.isAlive = true;

        User.users.set(ws, this);
    }

    static heartbeat = setInterval(() => {
        User.users.forEach((user) => {
            user.checkHeartbeat();
        });
    }, +(process.env.HEARTBEAT_INTERVAL || 5000));

    checkHeartbeat() {
        if (!this.isAlive) {
            consoleLog(`User died: ${this.id}`, InfoLevel.WARNING);
            this.terminate();
        }
        this.isAlive = false;
        this.ws.ping();
    }

    idCollision() {
        consoleLog("ID collision detected", InfoLevel.ERROR);
        this.disconnect();
    }

    changeRoom(roomId: string) {
        //TODO: Check if room is not full
        const roomToJoin = Room.rooms.get(roomId);
        if (roomToJoin !== undefined && roomToJoin !== this.currentRoom) {
            this.currentRoom.removeUser(this);
            this.currentRoom = roomToJoin;
            this.currentRoom.addUser(this);
        } else {
            consoleLog(`Room ${roomId} does not exist`, InfoLevel.WARNING);
        }
    }
    leaveRoom() {
        this.currentRoom.removeUser(this);
        const newRoomId = nanoid(6);
        this.currentRoom = new Room(newRoomId, this);
    }

    terminate() {
        this.ws.terminate();
        this.currentRoom.removeUser(this);
        User.users.delete(this.ws);
    }
    disconnect() {
        this.ws.close();
        this.currentRoom.removeUser(this);
        User.users.delete(this.ws);
    }
    alive() {
        this.isAlive = true;
    }
}

class Room {
    id: string;
    users: User[];
    static rooms = new Map<string, Room>();

    constructor(id: string, firstUser: User) {
        this.id = id;
        this.users = [firstUser];

        Room.rooms.set(id, this);
    }
    removeUser(user: User) {
        if (user.currentRoom) {
            const index = this.users.indexOf(user);
            if (index > -1) {
                this.users.splice(index, 1);
                if (this.users.length === 0) {
                    Room.rooms.delete(this.id);
                }
            } else {
                user.idCollision();
                return;
            }
        } else {
            user.idCollision();
        }
    }
    addUser(user: User) {
        if (user.currentRoom && user.currentRoom === this) {
            this.users.push(user);
        } else {
            user.idCollision();
        }
    }
}

const port = +(process.env.PORT || 1234);

const sendChatMessage = (user: User, message: ChatMessage) => {
    if (user.currentRoom) {
        user.currentRoom.users.forEach((roomUser) => {
            if (
                roomUser.ws.readyState === WebSocket.OPEN &&
                roomUser.ws !== user.ws
            ) {
                roomUser.ws.send(message.toBuffer());
            }
        });
    }
};

const handleMessage = (user: User, data: any) => {
    const genericMessage = msgFromBuffer(data);
    let message;
    switch (genericMessage.type) {
        case MessageType.CHANGE_ROOM:
            message = ChangeRoomMessage.fromBuffer(genericMessage);
            user.changeRoom(message.room);
            break;
        case MessageType.LEAVE_ROOM:
            user.leaveRoom();
            break;
        case MessageType.CHAT_MESSAGE:
            message = ChatMessage.fromBuffer(genericMessage);
            sendChatMessage(user, message);
            break;
        case MessageType.CHANGE_USERNAME:
    }
};

const wss = new Server({ port });
wss.on("connection", (ws, req) => {
    const user = new User(ws);
    consoleLog(`User connected: ${user.id}`, InfoLevel.INFO);

    ws.on("pong", () => {
        user.alive();
    });
    ws.on("close", () => {
        consoleLog(`User disconnected: ${user.id}`, InfoLevel.INFO);
        user.terminate();
    });
    ws.on("message", (data) => {
        handleMessage(user, data);
    });
});
wss.on("close", () => {
    clearInterval(User.heartbeat);
});
consoleLog("Server started on port " + port, InfoLevel.INFO);
const tmp = new ChatMessage("hans", "hi");
tmp.toBuffer();
