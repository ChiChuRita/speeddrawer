import create from "zustand";
import { DrawCommand } from "../drawStack";
import Drawer from "../drawer";
import Color from "../color";

interface GameStore {
    buffer: DrawCommand[];
    remoteCanvas: HTMLCanvasElement | null;
    remoteDrawer: Drawer | null;
    pushToBuffer: (command: DrawCommand) => void;
    start: (remoteCanvas: HTMLCanvasElement) => void;
    stop: () => void;
}

let intervalFunction: any;

const useGameStore = create<GameStore>((set, get) => ({
    buffer: [],
    remoteCanvas: null,
    remoteDrawer: null,
    start: (remoteCanvas: HTMLCanvasElement) => {
        const ctx = remoteCanvas.getContext("2d")!;
        const remoteDrawer = new Drawer(ctx);
        set({
            remoteCanvas,
            remoteDrawer,
        });

        intervalFunction = setInterval(() => {
            const buffer = get().buffer;
            if (buffer.length > 0) {
                remoteDrawer.draw(buffer, true);
                remoteDrawer.pixelate();
                set({ buffer: [] });
            }
        }, 60);
    },
    stop: () => {
        clearInterval(intervalFunction);
        set({
            remoteCanvas: null,
            remoteDrawer: null,
        });
    },
    pushToBuffer: (command: DrawCommand) => {
        set((state) => ({ buffer: [...state.buffer, command] }));
    },
}));

export default useGameStore;
