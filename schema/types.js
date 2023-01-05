//------------------
//------- GQL Types
//------------------

exports.typesDefs = `
type Query{
	me(name:String): User
	Trail(name:String): Trail
	test: String
	getMyTrailList: [Trail]
	getAllTrails: [Trail]
	adminFunction(name: String!, password: String!): Boolean
}

type Mutation{
	createUser(name:String, password: String):User
	login(name: String, password:String): User
	createTrail(name: String, trailPath:[[Float]]): Trail
	addToTrailList(trails: [TrailInput]): String
	addCustomUserTrail(pathPoints: [[Float]], name:String): UserTrail
	updateTrail(trailName:String, username:String, password:String, newName:String, newPath:[[Float]]): Trail

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
	_id: String
}

type UserTrail{
	createdby: String
	name: String!
    startLat: String!
    startLong: String!
	trailPath: [[Float]]!
	_id: String
}

input TrailInput{
	name: String!
    startLat: Float
    startLong: Float
	trailPath: [[Float]]
	_id: String!
}


`;
