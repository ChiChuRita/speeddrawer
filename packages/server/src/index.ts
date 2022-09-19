import "dotenv/config";
import { Server, WebSocket } from "ws";
import {
    ChatMessage,
    MessageType,
    msgFromBuffer,
    GenericMessage,
    ChangeRoomMessage,
    LeaveRoomMessage,
    NotificationMessage,
} from "@speeddrawer/shared";
import { nanoid } from "nanoid";
import { consoleLog, InfoLevel } from "./console-log";

class User {
    username: string;
    id: string;
    currentGameRoom: GameRoom;
    ws: WebSocket;
    isAlive: boolean;
    static users = new Map<WebSocket, User>();

    constructor(ws: WebSocket) {
        const uid = nanoid(6);
        this.username = "User" + uid;
        this.id = uid;
        this.currentGameRoom = new GameRoom(uid, this);
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

    changeGameRoom(GameRoomId: string): boolean {
        //TODO: Check if GameRoom is not full
        const GameRoomToJoin = GameRoom.GameRooms.get(GameRoomId);
        if (
            GameRoomToJoin !== undefined &&
            GameRoomToJoin !== this.currentGameRoom
        ) {
            this.currentGameRoom.removeUser(this);
            this.currentGameRoom = GameRoomToJoin;
            this.currentGameRoom.addUser(this);

            this.currentGameRoom.sendToAll(
                new NotificationMessage(
                    this.username,
                    "joined the GameRoom"
                ).toBuffer(),
                this
            );
            return true;
        } else {
            consoleLog(
                `GameRoom ${GameRoomId} does not exist`,
                InfoLevel.WARNING
            );
            return false;
        }
    }
    leaveGameRoom() {
        this.currentGameRoom.removeUser(this);
        const newGameRoomId = nanoid(6);
        this.currentGameRoom = new GameRoom(newGameRoomId, this);
    }

    terminate() {
        this.ws.terminate();
        this.currentGameRoom.removeUser(this);
        User.users.delete(this.ws);
    }
    disconnect() {
        this.ws.close();
        this.currentGameRoom.removeUser(this);
        User.users.delete(this.ws);
    }
    alive() {
        this.isAlive = true;
    }
    sendMessage(message: Buffer) {
        if (this.ws.readyState === WebSocket.OPEN) this.ws.send(message);
    }

    // TODO: Notificate all users in the GameRoom
    changeUsername(newUsername: string) {
        this.username = newUsername;
    }
}

class GameRoom {
    id: string;
    users: User[];
    hasStarted: boolean;
    owner: User;
    static GameRooms = new Map<string, GameRoom>();

    constructor(id: string, firstUser: User) {
        this.id = id;
        this.users = [firstUser];
        this.hasStarted = false;
        this.owner = firstUser;

        GameRoom.GameRooms.set(id, this);
    }

    removeUser(user: User) {
        if (user.currentGameRoom) {
            const index = this.users.indexOf(user);
            if (index > -1) {
                this.users.splice(index, 1);
                if (this.users.length === 0) {
                    GameRoom.GameRooms.delete(this.id);
                    return;
                }
                // If the user was the owner, set a new owner
                if (user === this.owner) {
                    this.setNewOwner();
                }
            } else {
                user.idCollision();
                return;
            }
        } else {
            user.idCollision();
            return;
        }
    }

    addUser(user: User) {
        if (user.currentGameRoom && user.currentGameRoom === this) {
            this.users.push(user);
        } else {
            user.idCollision();
        }
    }

    sendToAll(message: Buffer, except?: User) {
        this.users.forEach((user) => {
            if (user.ws.readyState === WebSocket.OPEN && user !== except) {
                user.sendMessage(message);
            }
        });
    }

    // TODO: Send notification to all users that the owner changed
    setNewOwner() {
        this.owner = this.users[0];
    }

    // TODO: Send notification to all users that the Game started
    startGame() {
        this.hasStarted = true;
        setTimeout(() => {
            this.endGame();
        }, 120000);
    }

    // TODO: Send notification to all users that the Game ended
    endGame() {
        this.hasStarted = false;
    }
}

const port = +(process.env.PORT || 1234);

const sendChatMessage = (user: User, message: ChatMessage) => {
    if (user.currentGameRoom) {
        user.currentGameRoom.users.forEach((GameRoomUser) => {
            if (
                GameRoomUser.ws.readyState === WebSocket.OPEN &&
                GameRoomUser.ws !== user.ws
            ) {
                GameRoomUser.ws.send(message.toBuffer());
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
            user.changeGameRoom(message.room);
            break;
        case MessageType.LEAVE_ROOM:
            user.leaveGameRoom();
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
