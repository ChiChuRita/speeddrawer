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

    public drawCircle(firstPoint: Point, secondPoint: Point, color: Color) {
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
