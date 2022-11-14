//------------------
//------- GQL Types
//------------------

exports.typesDefs = `
type Query{
	me(name:String): User
	Trail(name:String): Trail
	test: String

}

type Mutation{
	createUser(name:String, password: String):User
	login(name: String, password:String): User
	createTrail(name: String, startLat:String, startLong:String): Trail
}

type User{
    name: String!
	password: String!
	date: String!
	token: String
	id: String
}

type Trail{
    name: String!
    startLat: String!
    startLong: String!
}

`;
