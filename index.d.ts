interface Point {
	[k: string]: number;
}

declare function simplify (points: Point[], tolerance?: number, highQuality?: boolean): Point[];
declare namespace simplify {}

export = simplify;
