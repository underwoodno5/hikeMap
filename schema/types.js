//------------------
//------- GQL Types
//------------------

exports.typesDefs = `
type Query{
	me: User
	Trail(name:String): Trail
	test: String
	getMyTrailList: UserTrailList
	getAllTrails: [Trail]
	adminFunction(name: String!, password: String!): Boolean
}

type Mutation{
	createUser(name:String, password: String):User
	login(name: String, password:String): Login
	refresh: Login
	logout: String
	createTrail(name: String, trailPath:[[Float]]): Trail
	addToTrailList(trails: [TrailInput]): String
	addCustomUserTrail(pathPoints: [[Float]], name:String, distance:Float, waterPoints: [[Float]], tentPoints:[[Float]], trailID: String): UserTrail
	updateTrail(pathPoints: [[Float]], name:String, distance:Float, waterPoints: [[Float]], tentPoints:[[Float]], trailID: String, username:String, password:String): Trail

}

type User{
    name: String!
	password: String!
	date: String!
	refreshTokens: [String]
	id: String
	trailList: [Trail]
	userTrails: [UserTrail]
	admin: Boolean
	accessToken: String
}

type UserPath{
	trailId: String,
	trailPath: [[Float]]
}

type Trail{
    name: String!
    startLat: Float!
    startLong: Float!
	trailPath: [[Float]]!
	distance: Float
	_id: String
}

type UserTrail{
	createdby: String
	name: String!
    startLat: String!
    startLong: String!
	trailPath: [[Float]]!
	waterPoints: [[Float]]
	tentPoints:[[Float]]
	distance: Float
	_id: String
}
type UserTrailList{
	userTrailList: [Trail]
	userCustomTrails:[UserTrail]

}

type Login{
	userTrailList: [Trail]
	userCustomTrails:[UserTrail]
	accessToken: String

}

input TrailInput{
	name: String!
    startLat: Float
    startLong: Float
	trailPath: [[Float]]
	distance: Float
	_id: String!
}


`;
