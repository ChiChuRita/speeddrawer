import create from "zustand";
import Drawer, { Point } from "../drawer";
import Color from "../color";

interface MyCanvasStore {
    canvas: HTMLCanvasElement | null;
    previewCanvas: HTMLCanvasElement | null;
    drawer: Drawer | null;
    previewDrawer: Drawer | null;
    inputMode: InputMode;
    inputColor: Color;
    setInputMode: (mode: InputMode) => void;
    setInputColor: (color: Color) => void;
    mount: (
        canvas: HTMLCanvasElement,
        previewCanvas: HTMLCanvasElement
    ) => void;
    unmount: () => void;
}

export enum InputMode {
    DrawLine,
    DrawRect,
    DrawCircle,
    DrawFill,
}

let onMouseDown = (ev: globalThis.MouseEvent) => {};
let onMouseMove = (ev: globalThis.MouseEvent) => {};
let onMouseUp = (ev: globalThis.MouseEvent) => {};
let onMouseLeave = (ev: globalThis.MouseEvent) => {};

const useMyCanvasStore = create<MyCanvasStore>((set, get) => ({
    canvas: null,
    previewCanvas: null,
    drawer: null,
    previewDrawer: null,
    drawStack: null,
    inputMode: InputMode.DrawLine,
    inputColor: Color.black,
    setInputMode: (mode: InputMode) => {
        set({ inputMode: mode });
    },
    setInputColor: (color: Color) => {
        set({ inputColor: color });
    },
    mount: (canvas: HTMLCanvasElement, previewCanvas: HTMLCanvasElement) => {
        const ctx = canvas.getContext("2d")!; //probalby do some error handling here
        const previewCtx = previewCanvas.getContext("2d")!; //probalby do some error handling here
        const drawer = new Drawer(ctx);
        const previewDrawer = new Drawer(previewCtx);
        set({
            canvas,
            previewCanvas,
            drawer,
            previewDrawer,
        });

        const canvasWidthPixelRatio = canvas.width / canvas.clientWidth;
        const canvasHeightPixelRatio = canvas.height / canvas.clientHeight;

        const getMousePosition = (ev: globalThis.MouseEvent) => {
            return {
                x: Math.floor(ev.offsetX * canvasWidthPixelRatio),
                y: Math.floor(ev.offsetY * canvasHeightPixelRatio),
            };
        };

        let firstPos = null as Point | null;
        let lastPos = null as Point | null;

        onMouseDown = (ev: globalThis.MouseEvent) => {
            previewDrawer.clear();
            firstPos = getMousePosition(ev);
            const currentColor = get().inputColor;
            const currentMode = get().inputMode;
            switch (currentMode) {
                case InputMode.DrawLine:
                    if (ev.buttons !== 1) return;
                    drawer.begin();
                    previewDrawer.drawPixel(firstPos, currentColor.preview);
                    break;
                case InputMode.DrawRect:
                    previewDrawer.drawRect(
                        firstPos,
                        firstPos,
                        currentColor.preview
                    );
                    break;
                case InputMode.DrawCircle:
                    break;
                case InputMode.DrawFill:
                    drawer.fill(firstPos, currentColor, true);
                    break;
            }
            lastPos = firstPos;
        };

        onMouseMove = (ev: globalThis.MouseEvent) => {
            previewDrawer.clear();
            const currentPos = getMousePosition(ev);
            const currentColor = get().inputColor;
            const currentMode = get().inputMode;
            switch (currentMode) {
                case InputMode.DrawLine:
                    previewDrawer.drawPixel(currentPos, currentColor.preview);
                    if (
                        !lastPos ||
                        (lastPos.x == currentPos.x && lastPos.y == currentPos.y)
                    )
                        return;
                    drawer.drawLine(lastPos, currentPos, currentColor, true);
                    break;
                case InputMode.DrawRect:
                    previewDrawer.drawRect(
                        firstPos || currentPos,
                        currentPos,
                        currentColor.preview
                    );
                    break;
                case InputMode.DrawCircle:
                    previewDrawer.drawCircle(
                        firstPos || currentPos,
                        currentPos,
                        currentColor.preview
                    );
                    break;
                case InputMode.DrawFill:
                    previewDrawer.drawPixel(currentPos, currentColor.preview);
                    break;
            }
            lastPos = currentPos;
        };

        onMouseUp = (ev: globalThis.MouseEvent) => {
            previewDrawer.clear();
            const currentPos = getMousePosition(ev);
            const currentColor = get().inputColor;
            const currentMode = get().inputMode;
            switch (currentMode) {
                case InputMode.DrawLine:
                    drawer.end();
                    break;
                case InputMode.DrawRect:
                    drawer.drawRect(firstPos!, currentPos, currentColor, true);
                    break;
                case InputMode.DrawCircle:
                    drawer.drawCircle(
                        firstPos!,
                        currentPos,
                        currentColor,
                        true
                    );
                    break;
                case InputMode.DrawFill:
                    break;
            }
            firstPos = null;
            lastPos = null;
        };

        onMouseLeave = (ev: globalThis.MouseEvent) => {
            previewDrawer.clear();
            firstPos = null;
            lastPos = null;
        };

        canvas.addEventListener("mousedown", onMouseDown);
        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("mouseup", onMouseUp);
        canvas.addEventListener("mouseleave", onMouseLeave);
    },
    unmount: () => {
        const canvas = get().canvas;
        const drawer = get().drawer;
        drawer?.clear();
        canvas?.removeEventListener("mousedown", onMouseDown);
        canvas?.removeEventListener("mousemove", onMouseMove);
        canvas?.removeEventListener("mouseup", onMouseUp);
        canvas?.removeEventListener("mouseleave", onMouseLeave);
        set({
            canvas: null,
            previewCanvas: null,
            drawer: null,
            previewDrawer: null,
        });
    },
}));

export default useMyCanvasStore;
