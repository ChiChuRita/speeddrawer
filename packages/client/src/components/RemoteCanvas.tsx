import useGameStore from "../stores/GameStore";
import { useEffect, useRef } from "react";
import useMyCanvasStore from "../stores/MyCanvasStore";

interface RemoteCanvasProps {
    width: number;
    height: number;
}

const RemoteCanvas: React.FC<RemoteCanvasProps> = ({ width, height }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { start, stop } = useGameStore();
    const drawer = useMyCanvasStore((state) => state.drawer);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        if (drawer) start(canvas, drawer);
        return () => stop();
    }, [drawer]);

    return (
        <canvas
            ref={canvasRef}
            className="h-[256px] w-[256px] border"
            width={width}
            height={height}
        ></canvas>
    );
};

export default RemoteCanvas;
