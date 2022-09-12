class Drawer {
    private readonly ctx: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }

    public drawRect(
        x: number,
        y: number,
        width: number,
        height: number,
        color: string
    ) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }
}

export default Drawer;
