export type FilterPreset = {
    brightness?: number;
    saturation?: number;
    hue?: number;
    gamma?: number;
    sharpen?: {
        sigma: number;
        m1?: number;
        m2?: number;
        x1?: number;
        y2?: number;
        y3?: number;
    };
    blur?: number;
    tint?: string;
};