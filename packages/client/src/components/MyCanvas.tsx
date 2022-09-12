import { useEffect, useRef } from "react";
import useMyCanvasStore from "../stores/MyCanvasStore";

const MyCanvas = () => {
    const mount = useMyCanvasStore((state) => state.mount);
    const unmount = useMyCanvasStore((state) => state.unmount);
    const canvas = useRef<HTMLCanvasElement>(null);
    const previewCanvas = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvas.current && previewCanvas.current) {
            mount(canvas.current, previewCanvas.current);
        }
        return () => {
            unmount();
        };
    });

    return (
        <div>
            <canvas ref={canvas}>Your browser is rubbish!</canvas>
            <canvas ref={previewCanvas}></canvas>
        </div>
    );
};

export default MyCanvas;
