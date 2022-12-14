const endpoint = "http://localhost:5000/graphql";
const headers = {
	"content-type": "application/json",
};

//-- Here we have all API from the frontend that deal with Trail data on the server.

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
		   id
           startLat
           startLong
        }}`,
		};
		let res = await response(graphqlQuery)
			.then((res) => res.json())
			.catch((err) => {
				console.log(err);
			});
		return res.data.Trail;
	},
	getAll: async () => {
		let graphqlQuery = {
			query: `query{getAllTrails{name startLat startLong _id trailPath distance}}`,
		};
		let res = await response(graphqlQuery)
			.then((res) => res.json())
			.catch((err) => {
				console.log(err);
			});
		console.log(res);
		return res.data.getAllTrails;
	},
	addToTrailList: async (trails) => {
		let query = `mutation AddToTrailList($trails: [TrailInput]) {
			addToTrailList(trails: $trails) 
		  }`;
		let graphqlQuery = {
			query: query,
			variables: {
				trails: trails,
			},
		};
		let res = await response(graphqlQuery)
			.then((res) => res.json())
			.catch((err) => {
				return err;
			});
		console.log(res);
		return res;
	},
	addCustomUserTrail: async (
		pathPoints,
		name,
		waterPoints,
		tentPoints,
		distance
	) => {
		let graphqlQuery = {
			query: `mutation{
				addCustomUserTrail(pathPoints:${pathPoints}, name:"${name}", waterPoints:${waterPoints}, tentPoints:${tentPoints} distance:${distance}){
				  name
				  createdby
				}
			  }`,
		};
		let res = await response(graphqlQuery)
			.then((res) => res.json())
			.catch((err) => {
				return err;
			});
		return res;
	},
	mapConversion: (list) => {
		let arrayone = list.split(",");

		let arraytwo = [];

		arrayone.forEach((item) => {
			let newItem = item.trim();
			let stringArray = newItem.split(" ");
			let numberArray = [];
			stringArray.forEach((string) => {
				numberArray.push(parseFloat(string));
			});
			arraytwo.push(numberArray.reverse());
		});
		console.log(arraytwo);
	},
};
