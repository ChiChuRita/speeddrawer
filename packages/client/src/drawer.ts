import bresenham from "bresenham";
import Filler from "q-floodfill";
import Color from "./color";

export interface Point {
    x: number;
    y: number;
}

class Drawer {
    private readonly ctx: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }

    public drawPixel(point: Point, color: Color) {
        this.ctx.fillStyle = color.toRGBAString();
        this.ctx.fillRect(point.x, point.y, 1, 1);
    }

    public drawLine(firstPoint: Point, secondPoint: Point, color: Color) {
        const points = bresenham(
            firstPoint.x,
            firstPoint.y,
            secondPoint.x,
            secondPoint.y
        );
        points.forEach((point) => this.drawPixel(point, color));
    }

    public drawRect(firstPoint: Point, secondPoint: Point, color: Color) {
        this.ctx.fillStyle = color.toRGBAString();
        this.ctx.fillRect(
            firstPoint.x,
            firstPoint.y,
            secondPoint.x - firstPoint.x + 1,
            secondPoint.y - firstPoint.y + 1
        );
    }

    public drawCircle() {
        //TODO
    }

    public fill(point: Point, color: Color) {
        const imageData = this.ctx.getImageData(
            0,
            0,
            this.ctx.canvas.width,
            this.ctx.canvas.height
        );
        const filler = new Filler(imageData);
        filler.fill(color.toRGBAString(), point.x, point.y, 0);
        this.ctx.putImageData(imageData, 0, 0);
    }

    public clear() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}

export default Drawer;
