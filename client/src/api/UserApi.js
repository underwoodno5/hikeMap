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
	login: async (username, password) => {
		let graphqlQuery = {
			query: `mutation{login(name:"${username}" password:"${password}"){
            name
            token
			trailList{
				name
				_id
				trailPath
				startLat
				startLong
			}
        }}`,
		};
		const res = await response(graphqlQuery)
			.then((res) => res.json())
			.catch((err) => {
				console.log(err);
			});
		if (!res.errors) {
			localStorage.setItem(
				"myTrailList",
				JSON.stringify(res.data.login.trailList)
			);
		}

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
	location: async () => {
		if ("geolocation" in navigator) {
			const pos = await new Promise((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject);
			});

			return await pos;
		} else {
			console.log("none");
			throw new Error("Geolocation not allowed in settings or in browser");
		}
	},
};
