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
			query: `mutation{login(name:ian password:password){
            name
            token
        }}`,
		};
		const res = await response(graphqlQuery);
		return await res.json();
	},
};
