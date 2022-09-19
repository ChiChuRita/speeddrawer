import React from "react";
import useMyCanvasStore, { InputMode } from "../stores/MyCanvasStore";
import Color from "../color";
import classnames from "classnames";

interface DrawingToolsProps {
    colors: Color[];
}

const DrawingTools: React.FC<DrawingToolsProps> = ({ colors }) => {
    const inputMode = useMyCanvasStore((state) => state.inputMode);
    const inputColor = useMyCanvasStore((state) => state.inputColor);
    const setInputMode = useMyCanvasStore((state) => state.setInputMode);
    const setInputColor = useMyCanvasStore((state) => state.setInputColor);
    const drawer = useMyCanvasStore((state) => state.drawer);

    const btnClass = (mode: InputMode) =>
        classnames({
            "border-black": mode === inputMode,
        });

    return (
        <div className="flex flex-col gap-2 py-2">
            <div className="flex flex-row gap-2">
                <button
                    className={btnClass(InputMode.DrawLine)}
                    onClick={() => setInputMode(InputMode.DrawLine)}
                >
                    Line
                </button>
                <button
                    className={btnClass(InputMode.DrawRect)}
                    onClick={() => setInputMode(InputMode.DrawRect)}
                >
                    Rect
                </button>
                <button
                    className={btnClass(InputMode.DrawCircle)}
                    onClick={() => setInputMode(InputMode.DrawCircle)}
                >
                    Circle
                </button>
                <button
                    className={btnClass(InputMode.DrawFill)}
                    onClick={() => setInputMode(InputMode.DrawFill)}
                >
                    Fill
                </button>
                <button
                    className={btnClass(-1)}
                    onClick={() => {
                        drawer?.clear(true);
                    }}
                >
                    Clear
                </button>
                <button
                    className={btnClass(-1)}
                    onClick={() => {
                        drawer?.undo();
                    }}
                >
                    Undo
                </button>
                <button
                    className={btnClass(-1)}
                    onClick={() => {
                        drawer?.redo();
                    }}
                >
                    Redo
                </button>
                <button
                    onClick={() => {
                        drawer?.pixelate();
                    }}
                >
                    Pixelate
                </button>
            </div>
            <div className="gap- flex flex-row gap-2">
                {colors.map((color) => (
                    <button
                        key={color.toRGBAString()}
                        onClick={() => setInputColor(color)}
                        className={`h-8 w-8 rounded-full`}
                        style={{ backgroundColor: color.toRGBAString() }}
                    />
                ))}
            </div>
        </div>
    );
};

export default DrawingTools;
