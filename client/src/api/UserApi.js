// const endpoint = "http://localhost:5000/graphql";
const endpoint = "http://192.168.2.14:5000/graphql";

//-- Here we have all API calls from the frontend that deal with User data on the server.

//--In our response we have use newAccessToken to stop concurrent API calls from jamming up the token refresh cycle. We send an
// initial api call, await a response, then if a new token is received all concurrent api calls after use the new token. Less
// elegent than an interceptor but it works.

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

exports.User = {
	//-- #login
	login: async (username, password, newAccessToken) => {
		let graphqlQuery = {
			query: `mutation{login(name:"${username}" password:"${password}")
		{	userTrailList{
				name
				_id
				trailPath
				startLat
				startLong
				distance
			}
				userCustomTrails{
					name
					_id
					trailPath
					startLat
					startLong
					distance
					waterPoints
					tentPoints
					createdby
				}
				accessToken
			}}
			`,
		};
		const res = await response(graphqlQuery, newAccessToken)
			.then((res) => res.json())
			.catch((err) => {
				console.log(err);
			});
		if (!res.errors) {
			localStorage.setItem(
				"myTrailList",
				JSON.stringify(res.data.login.userTrailList)
			);
			localStorage.setItem(
				"customTrailList",
				JSON.stringify(res.data.login.userCustomTrails)
			);
			localStorage.setItem("accessToken", res.data.login.accessToken);
		}

		return res;
	},
	//-- #logout

	logout: async (username, password, newAccessToken) => {
		let graphqlQuery = {
			query: `mutation{ 
				logout
			}`,
		};
		const res = await response(graphqlQuery, newAccessToken)
			.then((res) => res.json())
			.catch((err) => {
				console.log(err);
			});

		document.cookie =
			"token= SameSite=None;expires=Thu, 01 Jan 2024 00:00:00 UTC; Path=/;";
		localStorage.clear();
		window.location.reload();
		return res;
	},
	//-- #me

	me: async () => {
		let graphqlQuery = {
			query: `query{ me {
				id
				name
				admin
				accessToken
			  }}`,
		};
		const res = await response(graphqlQuery).then((res) => res.json());

		if (res.errors) {
			console.log(res.errors);
			return res.errors;
		}

		const newAccessToken = res.data.me.accessToken || null;

		//--if user logs in ok we grab their trail data and return as one item, otherwise return null
		const myData = {
			me: res.data.me,
			accessToken: newAccessToken,
		};
		localStorage.setItem(
			"me",
			JSON.stringify({ name: myData.me.name, admin: myData.me.admin })
		);
		if (newAccessToken) {
			localStorage.setItem("accessToken", newAccessToken);
		}
		return myData;
	},

	getUserTrails: async (newAccessToken) => {
		let graphqlQuery = {
			query: `query{
				getMyTrailList{
					userTrailList{
					name
					_id
					trailPath
					startLat
					startLong
					distance
				}
					userCustomTrails{
						name
						_id
						trailPath
						startLat
						startLong
						distance
						waterPoints
						tentPoints
						createdby
					}
						
			   }
			   }`,
		};
		let res = await response(graphqlQuery, newAccessToken)
			.then((res) => res.json())
			.catch((err) => {
				return err;
			});
		if (res.data.error) {
			return res.error;
		} else {
			localStorage.setItem(
				"myTrailList",
				JSON.stringify(res.data.getMyTrailList.userTrailList)
			);
			localStorage.setItem(
				"customTrailList",
				JSON.stringify(res.data.getMyTrailList.userCustomTrails)
			);
			return res.data.getMyTrailList;
		}
	},
};
