import create from "zustand";
import { DrawCommand } from "../drawStack";
import Drawer from "../drawer";
import Color from "../color";

interface GameStore {
    drawer: Drawer | null;
    remoteCanvas: HTMLCanvasElement | null;
    remoteDrawer: Drawer | null;
    start: (remoteCanvas: HTMLCanvasElement, drawer: Drawer) => void;
    stop: () => void;
}

let intervalFunction: any;

const useGameStore = create<GameStore>((set, get) => ({
    drawer: null,
    remoteCanvas: null,
    remoteDrawer: null,
    start: (remoteCanvas: HTMLCanvasElement, drawer: Drawer) => {
        const ctx = remoteCanvas.getContext("2d")!;
        const remoteDrawer = new Drawer(ctx);
        set({
            remoteCanvas,
            remoteDrawer,
            drawer,
        });

        intervalFunction = setInterval(() => {
            const drawStack = get().drawer?.drawStack;
            if (drawStack) {
                remoteDrawer.clear();
                remoteDrawer.draw(drawStack.stack);
            }
            remoteDrawer.pixelate();
        }, 70);
    },
    stop: () => {
        clearInterval(intervalFunction);
        set({
            remoteCanvas: null,
            remoteDrawer: null,
            drawer: null,
        });
    },
}));

export default useGameStore;
