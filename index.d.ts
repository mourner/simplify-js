interface Point {
	x: number;
	y: number;
}

declare function simplify<T extends Point>(points: T[], tolerance?: number, highQuality?: boolean): T[];
declare namespace simplify {}

export = simplify;
