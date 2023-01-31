export interface Trail {
	_id: number;
	name: string;
	startLat: number;
	startLong: number;
	trailPath: [number, number][];
	tentPoints?:[number,number][];
	waterPoints?:[number,number][];
	distance: number;
	createdby?: number;
}

export interface Me {
	_id: number;
	name: string;
	admin: boolean;
}

export interface AppData {
    user: Me | null;
    allTrails: Trail[] | null;
    userTrails: Trail[] | null;
    userCustomTrails: Trail[] | null;
};

