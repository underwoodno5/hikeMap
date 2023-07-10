// const endpoint = "http://localhost:5000/graphql";
const endpoint = "http://192.168.2.14:5000/graphql";

const headers = {
	"content-type": "application/json",
};

//-- Here we have all API calls from the frontend that deal with User data on the server.

const response = (graphqlQuery) =>
	fetch(endpoint, {
		method: "POST",
		headers: headers,
		body: JSON.stringify(graphqlQuery),
		credentials: "include",
	});

exports.User = {
	//-- #login
	login: async (username, password) => {
		console.log(username);

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
		const res = await response(graphqlQuery)
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
	logout: async (username, password) => {
		let graphqlQuery = {
			query: `mutation{ 
				logout
			}`,
		};
		const res = await response(graphqlQuery)
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
				admin
			  }}`,
		};
		let res = await response(graphqlQuery).then((res) => res.json());

		//--if user logs in ok we grab their trail data and return as one item, otherwise return null
		const myData = {
			me: res.data.me,
			userTrailList: null,
			customTrailList: null,
		};

		if (!res.errors) {
			const fetchedTrails = await this.User.getUserTrails();
			myData.userTrailList = fetchedTrails.userTrailList;
			myData.customTrailList = fetchedTrails.userCustomTrails;
		}
		return myData;
	},
	getUserTrails: async () => {
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
		let res = await response(graphqlQuery)
			.then((res) => res.json())
			.catch((err) => {
				return err;
			});
		if (res.data.error) {
			return res.error;
		} else {
			return res.data.getMyTrailList;
		}
	},
};
