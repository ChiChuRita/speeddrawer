import { useEffect, useRef } from "react";
import Color from "../color";
import useMyCanvasStore from "../stores/MyCanvasStore";
import DrawingTools from "./DrawingTools";

interface MyCanvasProps {
    width: number;
    height: number;
}

const MyCanvas: React.FC<MyCanvasProps> = ({ width, height }) => {
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
        <div className="flex flex-col items-center">
            <div className="relative h-[512px] w-[512px]">
                <canvas
                    className="absolute h-full w-full border"
                    ref={canvas}
                    width={width}
                    height={height}
                    onContextMenu={(ev) => ev.preventDefault()}
                >
                    Your browser is rubbish!
                </canvas>
                <canvas
                    className="preview absolute h-full w-full border"
                    ref={previewCanvas}
                    width={width}
                    height={height}
                    onContextMenu={(ev) => ev.preventDefault()}
                ></canvas>
            </div>
            <DrawingTools
                colors={[
                    Color.black,
                    Color.blue,
                    Color.red,
                    Color.green,
                    Color.yellow,
                    Color.gray,
                    Color.purple,
                    Color.white,
                    Color.magenta,
                    Color.cyan,
                    Color.navy,
                    Color.olive,
                    Color.silver,
                    Color.maroon,
                    Color.teal,
                ]}
            />
        </div>
    );
};

export default MyCanvas;
