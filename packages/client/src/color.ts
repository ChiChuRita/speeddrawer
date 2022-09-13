class Color {
    public r: number;
    public g: number;
    public b: number;
    public a: number;

    constructor(r: number, g: number, b: number, a: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    public toRGBAString() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a / 255})`;
    }

    public static fromHex(hex: string) {
        const r = parseInt(hex.substring(1, 3), 16);
        const g = parseInt(hex.substring(3, 5), 16);
        const b = parseInt(hex.substring(5, 7), 16);
        const a = parseInt(hex.substring(7, 9), 16);
        return new Color(r, g, b, a);
    }

    public static fromRGBAString(rgba: string) {
        const rgbaValues = rgba.substring(5, rgba.length - 1).split(",");
        const r = parseInt(rgbaValues[0]);
        const g = parseInt(rgbaValues[1]);
        const b = parseInt(rgbaValues[2]);
        const a = parseFloat(rgbaValues[3]);
        return new Color(r, g, b, a);
    }

    public get preview() {
        return new Color(this.r, this.g, this.b, 128);
    }

    public static transparent = new Color(0, 0, 0, 0);
    public static white = Color.fromHex("#ffffffff");
    public static black = Color.fromHex("#000000ff");
    public static red = Color.fromHex("#ff0000ff");
    public static green = Color.fromHex("#00ff00ff");
    public static blue = Color.fromHex("#0000ffff");
    public static yellow = Color.fromHex("#ffff00ff");
    public static cyan = Color.fromHex("#00ffffff");
    public static magenta = Color.fromHex("#ff00ffff");
    public static gray = Color.fromHex("#808080ff");
    public static silver = Color.fromHex("#c0c0c0ff");
    public static maroon = Color.fromHex("#800000ff");
    public static olive = Color.fromHex("#808000ff");
    public static purple = Color.fromHex("#800080ff");
    public static teal = Color.fromHex("#008080ff");
    public static navy = Color.fromHex("#000080ff");
}

export default Color;
