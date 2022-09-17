import { Point } from "./drawer";
import Color from "./color";

export enum DrawType {
    Begin,
    End,
    Pixel,
    Rect,
    Circle,
    Fill,
    Clear,
    Undo,
    Redo,
}

export interface DrawCommand {
    type: DrawType;
    points: Point[];
    color?: Color;
}

export class DrawStack {
    private undoStack: Array<DrawCommand> = [];
    private redoStack: Array<DrawCommand> = [];

    public get stack() {
        return this.undoStack;
    }

    public pushBegin() {
        this.undoStack.push({ type: DrawType.Begin, points: [] });
    }

    public pushEnd() {
        this.undoStack.push({ type: DrawType.End, points: [] });
    }

    public pushPixel(point: Point, color: Color) {
        this.undoStack.push({ type: DrawType.Pixel, points: [point], color });
    }

    public pushRect(firstPoint: Point, secondPoint: Point, color: Color) {
        this.undoStack.push({
            type: DrawType.Rect,
            points: [firstPoint, secondPoint],
            color,
        });
    }

    public pushCircle(firstPoint: Point, secondPoint: Point, color: Color) {
        this.undoStack.push({
            type: DrawType.Circle,
            points: [firstPoint, secondPoint],
            color,
        });
    }

    public pushFill(point: Point, color: Color) {
        this.undoStack.push({ type: DrawType.Fill, points: [point], color });
    }

    public pushClear() {
        this.undoStack.push({ type: DrawType.Clear, points: [] });
    }

    private pushCommand(command: DrawCommand) {
        this.undoStack.push(command);
    }

    private popCommand() {
        let command = this.undoStack.pop();
        if (command) this.redoStack.push(command);

        while (
            command?.type === DrawType.Pixel ||
            command?.type === DrawType.End
        ) {
            command = this.undoStack.pop();
            if (command) this.redoStack.push(command);
        }
    }

    public undo() {
        this.popCommand();
    }

    public redo() {
        let command = this.redoStack.pop();
        if (command) this.undoStack.push(command);

        while (
            command?.type === DrawType.Pixel ||
            command?.type === DrawType.Begin
        ) {
            command = this.redoStack.pop();
            if (command) this.undoStack.push(command);
        }
    }
}
