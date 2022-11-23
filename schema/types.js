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
}

type Mutation{
	createUser(name:String, password: String):User
	login(name: String, password:String): User
	createTrail(name: String, startLat:String, startLong:String): Trail
	addToTrailList(trails: [TrailInput]): String
}

type User{
    name: String!
	password: String!
	date: String!
	token: String
	id: String
	trailList: [Trail]
}

type Trail{
    name: String!
    startLat: String!
    startLong: String!
	_id: String
}

input TrailInput{
	name: String!
    startLat: String!
    startLong: String!
	_id: String}

`;
