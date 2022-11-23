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

exports.User = {
	login: async (username, password) => {
		let graphqlQuery = {
			query: `mutation{login(name:"${username}" password:"${password}"){
            name
            token
			trailList{
				name
			}
        }}`,
		};
		const res = await response(graphqlQuery)
			.then((res) => res.json())
			.catch((err) => {
				console.log(err);
			});
		localStorage.setItem(
			"myTrailList",
			JSON.stringify(res.data.login.trailList)
		);

		return res;
	},
	logout: async (username, password) => {
		document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
		localStorage.clear();
	},
	me: async () => {
		let graphqlQuery = {
			query: `query{ me {
				id
				name
				trailList{
				  name
				  startLat
				  startLong
				  _id
				}
			  }}`,
		};
		let res = await response(graphqlQuery).then((res) => res.json());
		return res.data;
	},
};
