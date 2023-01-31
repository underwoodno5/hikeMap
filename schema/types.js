//------------------
//------- GQL Types
//------------------

exports.typesDefs = `
type Query{
	me(name:String): User
	Trail(name:String): Trail
	test: String
	getMyTrailList: UserTrailList
	getAllTrails: [Trail]
	adminFunction(name: String!, password: String!): Boolean
}

type Mutation{
	createUser(name:String, password: String):User
	login(name: String, password:String): User
	createTrail(name: String, trailPath:[[Float]]): Trail
	addToTrailList(trails: [TrailInput]): String
	addCustomUserTrail(pathPoints: [[Float]], name:String, distance:Float, waterPoints: [[Float]], tentPoints:[[Float]]): UserTrail
	updateTrail(trailName:String, username:String, password:String, newName:String, newPath:[[Float]], newDistance:Float): Trail

}

type User{
    name: String!
	password: String!
	date: String!
	token: String
	id: String
	trailList: [Trail]
	userTrails: [UserTrail]
	admin: Boolean
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

input TrailInput{
	name: String!
    startLat: Float
    startLong: Float
	trailPath: [[Float]]
	distance: Float
	_id: String!
}


`;
