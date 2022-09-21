import "dotenv/config";
import { Server, WebSocket } from "ws";
import {
    MessageType,
    msgFromBuffer,
    InitializeUserMessage,
    InitializeUserResponseMessage,
    KickUserMessage,
    UserJoinedInfoMessage,
    UserLeftInfoMessage,
    ChangeRoomMessage,
    ChangeRoomInfoMessage,
    GameStartMessage,
    GameStartInfoMessage,
} from "@speeddrawer/shared";
import { nanoid } from "nanoid";
import { consoleLog, InfoLevel } from "./console-log";
import { writeFileSync } from "fs";

class User {
    username: string | null;
    id: string;
    currentGameRoom: GameRoom | null;
    ws: WebSocket;
    isAlive: boolean;
    static users = new Map<string, User>();

    constructor(ws: WebSocket) {
        this.username = null;
        this.id = nanoid(6);
        this.currentGameRoom = null;
        this.ws = ws;
        this.isAlive = true;

        User.users.set(this.id, this);
    }

    // TODO: Check if user is username correct and room not full
    initializeUser(
        username: string,
        roomId: string | null
    ): InitializeUserResponseMessage {
        let usernameCorrect = false;
        if (username.length > 2 && username.length < 20) usernameCorrect = true;

        if (usernameCorrect) {
            if (!roomId) this.newGameRoom();
            else this.joinGameRoom(roomId);

            if (this.currentGameRoom) {
                this.username = username;
                return new InitializeUserResponseMessage(
                    this.id,
                    this.currentGameRoom.id,
                    this.currentGameRoom.users.map((user) => {
                        return { id: user.id, username: user.username! };
                    }),
                    this.currentGameRoom.owner.id
                );
            }
        }

        return new InitializeUserResponseMessage(null, null, null, null);
    }

    static getUserById(id: string): User | null {
        const user = User.users.get(id);
        if (user) return user;
        return null;
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

    newGameRoom() {
        this.leaveGameRoom();
        const newGameRoomId = nanoid(6);
        this.currentGameRoom = new GameRoom(newGameRoomId, this);
    }

    joinGameRoom(roomId: string): boolean {
        //TODO: Check if GameRoom is not full
        const GameRoomToJoin = GameRoom.GameRooms.get(roomId);
        if (
            GameRoomToJoin !== undefined &&
            GameRoomToJoin !== this.currentGameRoom
        ) {
            this.leaveGameRoom();
            this.currentGameRoom = GameRoomToJoin;
            this.currentGameRoom.addUser(this);

            const message = new UserJoinedInfoMessage(this.id, this.username!);
            this.currentGameRoom.sendToAll(message.toBuffer(), this);

            return true;
        } else return false;
    }

    leaveGameRoom() {
        if (this.currentGameRoom) {
            this.currentGameRoom.removeUser(this);

            const message = new UserLeftInfoMessage(
                this.id,
                this.currentGameRoom.owner.id
            );
            this.currentGameRoom.sendToAll(message.toBuffer(), this);

            this.currentGameRoom = null;
        }
    }

    terminate() {
        this.leaveGameRoom();
        this.ws.terminate();

        User.users.delete(this.id);
    }
    disconnect() {
        this.leaveGameRoom();
        this.ws.close();

        User.users.delete(this.id);
    }

    kickOtherUser(userId: string) {
        const user = User.getUserById(userId);
        if (
            user &&
            user.currentGameRoom == this.currentGameRoom &&
            this.currentGameRoom!.owner == this
        )
            user.disconnect();
    }

    alive() {
        this.isAlive = true;
    }
    sendMessage(message: Buffer) {
        if (this.ws.readyState === WebSocket.OPEN) this.ws.send(message);
    }

    changeRoom(roundNumber: number) {
        if (this.currentGameRoom!.owner == this)
            this.currentGameRoom!.changeRoom(roundNumber);
    }
}

class GameRoom {
    id: string;
    users: User[];
    hasStarted: boolean;
    owner: User;
    roundNumber: number;
    static GameRooms = new Map<string, GameRoom>();

    constructor(id: string, firstUser: User) {
        this.id = id;
        this.users = [firstUser];
        this.hasStarted = false;
        this.owner = firstUser;
        this.roundNumber = 4;

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

    changeRoom(roundNumber: number) {
        this.roundNumber = roundNumber;
    }
}

const port = +(process.env.PORT || 1234);
/*
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
*/
const handleMessage = (user: User, data: any) => {
    const genericMessage = msgFromBuffer(data);
    // Check if user is initialized before sending commands
    if (genericMessage.type != MessageType.INITIALIZE_USER && !user.username)
        user.disconnect();

    let message;
    switch (genericMessage.type) {
        case MessageType.INITIALIZE_USER:
            message = InitializeUserMessage.fromBuffer(genericMessage);
            const responseMsg = user.initializeUser(
                message.username,
                message.roomId
            );
            user.sendMessage(responseMsg.toBuffer());
            break;
        case MessageType.KICK_USER:
            message = KickUserMessage.fromBuffer(genericMessage);
            user.kickOtherUser(message.userId);
            break;
        case MessageType.CHANGE_ROOM:
            message = ChangeRoomMessage.fromBuffer(genericMessage);
            user.changeRoom(message.roundNumber);
            break;
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
