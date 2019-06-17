interface Point {
	x: number;
	y: number;
}

declare function simplify (points: Point[], tolerance?: number, highQuality?: boolean): Point[];
declare namespace simplify {}

export = simplify;
