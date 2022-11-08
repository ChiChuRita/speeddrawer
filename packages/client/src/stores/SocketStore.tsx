import create from "zustand";

interface SocketStore {
    socket: WebSocket | null;
    start: () => void;
    stop: () => void;
}

const useSocketStore = create<SocketStore>((set, get) => ({
    socket: null,
    start: () => {
        const socket = new WebSocket("ws://localhost:1234");
        set({ socket });

        //PLAYGROUND FOR TESTING
        socket.onopen = () => {
            console.log("Socket opened");
        };

        socket.onmessage = (event) => {
            console.log(event.data);
        };

        socket.onclose = () => {
            console.log("Socket closed");
        };
    },
    stop: () => {
        const socket = get().socket;
        if (!socket) return;

        socket.close();

        set({ socket: null });
    },
}));

export default useSocketStore;
