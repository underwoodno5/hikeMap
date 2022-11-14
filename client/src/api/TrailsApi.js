const endpoint = "http://localhost:5000/graphql";
const headers = {
	"content-type": "application/json",
};

const response = (graphqlQuery) =>
	fetch(endpoint, {
		method: "POST",
		headers: headers,
		body: JSON.stringify(graphqlQuery),
		credentials: "include",
	});

exports.Trails = {
	getOne: async (trailName) => {
		let graphqlQuery = {
			query: `query{Trail(name:"${trailName}"){
           name
           startLat
           startLong
        }}`,
		};
		let res = await response(graphqlQuery).then((res) => res.json());
		return res.data.Trail;
	},
};
