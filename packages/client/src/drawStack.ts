import { Point } from "./drawer";
import Color from "./color";

export enum DrawType {
    Begin,
    End,
    Pixel,
    Line,
    Rect,
    Circle,
    Clear,
    Undo,
    Redo,
}

interface DrawCommand {
    type: DrawType;
    points: Point[];
    color: Color;
}

class DrawStack {
    private undoStack: Array<DrawCommand> = [];
    private redoStack: Array<DrawCommand> = [];
}

export default DrawStack;
