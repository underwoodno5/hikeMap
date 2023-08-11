// const endpoint = "http://localhost:5000/graphql";
const endpoint = "http://192.168.2.14:5000/graphql";
const headers = {
	"content-type": "application/json",
	accesstoken: localStorage.getItem("accessToken"),
};

//-- Here we have all API from the frontend that deal with Trail data on the server.

//--In our response we have a newAccessToken, to stop concurrent API calls from jamming up the token refresh cycle we send an
// initial api call, await a response, then if a new token is received all concurrent api calls after use the new token.

const response = (graphqlQuery, newAccessToken) =>
	fetch(endpoint, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			accesstoken: newAccessToken || localStorage.getItem("accessToken"),
		},
		body: JSON.stringify(graphqlQuery),
		credentials: "include",
	});

exports.Trails = {
	getOne: async (trailName, newAccessToken) => {
		let graphqlQuery = {
			query: `query{Trail(name:"${trailName}"){
           name
		   id
           startLat
           startLong
        }}`,
		};
		let res = await response(graphqlQuery, newAccessToken)
			.then((res) => res.json())
			.catch((err) => {
				console.log(err);
			});
		return res.data.Trail;
	},
	getAll: async (newAccessToken) => {
		let graphqlQuery = {
			query: `query{getAllTrails{name startLat startLong _id trailPath distance}}`,
		};
		let res = await response(graphqlQuery, newAccessToken)
			.then((res) => res.json())
			.catch((err) => {
				console.log(err);
			});

		localStorage.setItem("allTrails", JSON.stringify(res.data.getAllTrails));

		return res.data.getAllTrails;
	},
	addToTrailList: async (trails, newAccessToken) => {
		let query = `mutation AddToTrailList($trails: [TrailInput]) {
			addToTrailList(trails: $trails) 
		  }`;
		let graphqlQuery = {
			query: query,
			variables: {
				trails: trails,
			},
		};
		let res = await response(graphqlQuery, newAccessToken)
			.then((res) => res.json())
			.catch((err) => {
				return err;
			});
		return res;
	},
	addCustomUserTrail: async (
		pathPoints,
		name,
		waterPoints,
		tentPoints,
		distance,
		trailID
	) => {
		let graphqlQuery = {
			query: `mutation{
				addCustomUserTrail(pathPoints:${pathPoints} name:"${name}" waterPoints:${waterPoints} tentPoints:${tentPoints} distance:${distance} trailID:"${trailID}"){
				  name
				  createdby
				}
			  }`,
		};
		let res = await response(graphqlQuery)
			.then((res) => res.json())
			.catch((err) => {
				console.log("err");
			});
		return res;
	},
	updateTrail: async (
		pathPoints,
		name,
		waterPoints,
		tentPoints,
		distance,
		trailID,
		username,
		password
	) => {
		let graphqlQuery = {
			query: `mutation{
				updateTrail(pathPoints:${pathPoints} name:"${name}" waterPoints:${waterPoints} tentPoints:${tentPoints} distance:${distance} trailID:"${trailID}" username:"${username}" password:"${password}"  ){
				  name
				}
			  }`,
		};
		let res = await response(graphqlQuery)
			.then((res) => res.json())
			.catch((err) => {
				console.log("err");
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
