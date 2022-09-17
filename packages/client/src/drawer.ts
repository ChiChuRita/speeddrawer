import bresenham from "bresenham";
import Filler from "q-floodfill";
import Color from "./color";
import { DrawStack, DrawCommand, DrawType } from "./drawStack";

export interface Point {
    x: number;
    y: number;
}

class Drawer {
    private readonly ctx: CanvasRenderingContext2D;
    private readonly drawStack: DrawStack;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.drawStack = new DrawStack();
    }

    public drawPixel(point: Point, color: Color, stack = false) {
        this.ctx.fillStyle = color.toRGBAString();
        this.ctx.fillRect(point.x, point.y, 1, 1);
        if (stack) this.drawStack.pushPixel(point, color);
    }

    //only needed for DrawStack
    public begin() {
        this.drawStack.pushBegin();
    }

    //only needed for DrawStack
    public end() {
        this.drawStack.pushEnd();
    }

    public drawLine(
        firstPoint: Point,
        secondPoint: Point,
        color: Color,
        stack = false
    ) {
        const points = bresenham(
            firstPoint.x,
            firstPoint.y,
            secondPoint.x,
            secondPoint.y
        );
        points.forEach((point) => this.drawPixel(point, color, stack));
    }

    public drawRect(
        firstPoint: Point,
        secondPoint: Point,
        color: Color,
        stack = false
    ) {
        this.ctx.fillStyle = color.toRGBAString();
        this.ctx.fillRect(
            firstPoint.x,
            firstPoint.y,
            secondPoint.x - firstPoint.x + 1,
            secondPoint.y - firstPoint.y + 1
        );
        if (stack) this.drawStack.pushRect(firstPoint, secondPoint, color);
    }

    public drawCircle(
        firstPoint: Point,
        secondPoint: Point,
        color: Color,
        stack = false
    ) {
        let radius = Math.sqrt(
            Math.pow(secondPoint.x - firstPoint.x, 2) +
                Math.pow(secondPoint.y - firstPoint.y, 2)
        );

        let imageData = this.ctx.getImageData(
            firstPoint.x - radius,
            firstPoint.y - radius,
            radius * 2,
            radius * 2
        );

        for (let x = 0; x < imageData.width; x++) {
            for (let y = 0; y < imageData.height; y++) {
                let index = (x + y * imageData.width) * 4;
                let dx = x - radius;
                let dy = y - radius;
                if (dx * dx + dy * dy < radius * radius) {
                    imageData.data[index] = color.r;
                    imageData.data[index + 1] = color.g;
                    imageData.data[index + 2] = color.b;
                    imageData.data[index + 3] = color.a;
                }
            }
        }

        this.ctx.putImageData(
            imageData,
            firstPoint.x - radius,
            firstPoint.y - radius
        );
        if (stack) this.drawStack.pushCircle(firstPoint, secondPoint, color);
    }

    public fill(point: Point, color: Color, stack = false) {
        const imageData = this.ctx.getImageData(
            0,
            0,
            this.ctx.canvas.width,
            this.ctx.canvas.height
        );
        const filler = new Filler(imageData);
        filler.fill(color.toRGBAString(), point.x, point.y, 0);
        this.ctx.putImageData(imageData, 0, 0);
        if (stack) this.drawStack.pushFill(point, color);
    }

    public clear(stack = false) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        if (stack) this.drawStack.pushClear();
    }
    public undo() {
        this.drawStack.undo();
        this.clear();
        this.draw(this.drawStack.stack);
    }

    public redo() {
        this.drawStack.redo();
        this.clear();
        this.draw(this.drawStack.stack);
    }

    public draw(drawCommands: DrawCommand[], stack = false) {
        console.log(drawCommands);
        drawCommands.forEach((command) => {
            switch (command.type) {
                case DrawType.Begin:
                    break;
                case DrawType.End:
                    break;
                case DrawType.Pixel:
                    this.drawPixel(command.points[0], command.color!);
                    break;
                case DrawType.Rect:
                    this.drawRect(
                        command.points[0],
                        command.points[1],
                        command.color!,
                        stack
                    );
                    break;
                case DrawType.Circle:
                    this.drawCircle(
                        command.points[0],
                        command.points[1],
                        command.color!,
                        stack
                    );
                    break;
                case DrawType.Fill:
                    this.fill(command.points[0], command.color!, stack);
                    break;
                case DrawType.Clear:
                    this.clear(stack);
                    break;

                //EVERYTHING BELOW IS EXPERIMENTAL
                case DrawType.Undo:
                    this.drawStack.undo();
                    this.clear();
                    this.draw(this.drawStack.stack);
                    return;
                case DrawType.Redo:
                    this.drawStack.redo();
                    this.clear();
                    this.draw(this.drawStack.stack);
                    return;
            }
        });
    }

    public debug = () => {
        console.log(this.drawStack.stack);
    };
}

export default Drawer;
