import create from "zustand";
import Drawer from "../drawer";
import DrawStack from "../drawStack";

interface MyCanvasStore {
    canvas: HTMLCanvasElement | null;
    previewCanvas: HTMLCanvasElement | null;
    drawer: Drawer | null;
    previewDrawer: Drawer | null;
    drawStack: DrawStack | null;
    mount: (
        canvas: HTMLCanvasElement,
        previewCanvas: HTMLCanvasElement
    ) => void;
    unmount: () => void;
}

const useMyCanvasStore = create<MyCanvasStore>((set, get) => ({
    canvas: null,
    previewCanvas: null,
    drawer: null,
    previewDrawer: null,
    drawStack: null,
    mount: (canvas: HTMLCanvasElement, previewCanvas: HTMLCanvasElement) => {
        const ctx = canvas.getContext("2d")!; //probalby do some error handling here
        const previewCtx = previewCanvas.getContext("2d")!; //probalby do some error handling here
        const drawer = new Drawer(ctx);
        const previewDrawer = new Drawer(previewCtx);
        const drawStack = new DrawStack();
        set({
            canvas,
            previewCanvas,
            drawer,
            previewDrawer,
            drawStack,
        });
    },
    unmount: () => {
        set({
            canvas: null,
            previewCanvas: null,
            drawer: null,
            previewDrawer: null,
            drawStack: null,
        });
    },
}));

export default useMyCanvasStore;
