import useGameStore from "../stores/GameStore";
import { useEffect, useRef } from "react";

const RemoteCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { start, stop } = useGameStore();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        start(canvas);
        return () => stop();
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="h-[256px] w-[256px]"
            width={16}
            height={16}
        ></canvas>
    );
};

export default RemoteCanvas;
