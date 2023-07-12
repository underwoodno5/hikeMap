const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { response } = require("express");
const { Schema } = mongoose;

//------------------
//------- Models
//------------------
const Trail = mongoose.model("Trail", {
	name: String,
	startLat: Number,
	startLong: Number,
	trailPath: [[Number]],
	distance: Number,
	tentPoints: [[Number]],
	waterPoints: [[Number]],
});

const UserTrail = mongoose.model("UserTrail", {
	createdby: Schema.Types.ObjectId,
	name: String,
	startLat: Number,
	startLong: Number,
	trailPath: [[Number]],
	distance: Number,
	tentPoints: [[Number]],
	waterPoints: [[Number]],
});

const User = mongoose.model("User", {
	name: String,
	password: String,
	joinDate: String,
	refreshTokens: [String],
	trailList: [{ type: Schema.Types.ObjectId, ref: Trail }],
	userTrails: [{ type: Schema.Types.ObjectId, ref: UserTrail }],
	admin: Boolean,
});

const BlockedToken = mongoose.model("BlockedToken", {
	token: String,
});

//------------------
//------- Resolves
//------------------

//////---- Contents ----\\\\\\

//------- User Stuff -------\\
//- #createUser
//- #login
//-	#deleteUser
//- #me
//- #refresh

//------- Trail Stuff -------\\
//- #Trail
//- #createTrail
//- #getAllTrails

//----- User Trail Stuff -----\\
//- #addToTrailList
//- #getMyTrailList
//- #addToUserTrailPath

exports.roots = {
	//------- User Stuff -------\\

	//- #createUser

	createUser: async ({ name, password }) => {
		const userExists = await User.findOne({ name: name });
		if (name.toLowerCase().replace(/\s/g, "") === "anothername") {
			throw new Error("Clever, try a different name");
		}
		if (name.toLowerCase().replace(/\s/g, "") === "differentname") {
			throw new Error(
				"We're going to force you to use a silly name if you keep messing about"
			);
		}
		if (userExists) {
			throw new Error("Name taken, try another one");
		}
		const joinDate = Date.now();
		let hashedPassword = await bcrypt.hash(password, 12);

		const user = new User({
			name,
			password: hashedPassword,
			joinDate,
			admin: false,
		});
		const refreshToken = jwt.sign(
			{
				exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
				name: user.name,
			},
			process.env.REFRESH_SECRET
		);
		const accessToken = jwt.sign(
			{
				exp: Math.floor(Date.now() / 1000) + 60 * 5,
				id: user._id,
				name: user.name,
			},
			process.env.REFRESH_SECRET
		);

		user.refreshTokens.push(refreshToken);

		user.save();

		return user;
	},

	//- #login

	login: async ({ name, password }, context) => {
		const user = await User.findOne({ name: name })
			.populate("trailList")
			.populate("userTrails");

		if (!user) {
			throw new Error(
				"Error: Either the user does not exist or password was incorrect"
			);
		} else {
			const hash = user.password;
			const passCheck = await bcrypt.compare(password, hash);

			if (passCheck == true) {
				const accessToken = jwt.sign(
					{
						exp: Math.floor(Date.now() / 1000) + 60 * 5,
						id: user._id,
						name: user.name,
						admin: user.admin,
					},
					user.admin ? process.env.JWT_ADMIN_SECRET : process.env.JWT_SECRET
				);
				const refreshToken = jwt.sign(
					{
						exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
						name: user.name,
					},
					process.env.REFRESH_SECRET
				);

				//-- Adding refreshtoken to the list and removing the oldest
				user.refreshTokens.push(refreshToken);
				if (user.refreshTokens.length > 3) {
					user.refreshTokens.shift();
				}

				await user.save();

				context.res.cookie("refreshtoken", refreshToken, {
					httpOnly: false, //--mark as true in production
					SameSite: "None",
					maxAge: 24 * 60 * 60 * 1000,
					// secure: true, SameSite:"Strict" //un-comment in production and change
				});

				const res = {
					userTrailList: user.trailList,
					userCustomTrails: user.userTrails,
					accessToken: accessToken,
				};
				return res;
			} else {
				throw new Error(
					"Error: Either the user does not exist or password was incorrect"
				);
			}
		}
	},

	//-	#logout
	logout: async ({}, context) => {
		context.res.clearCookie("token");
		return "You logged out";
	},

	//-	#deleteUser

	deleteUser: async ({ name }) => {
		const user = await User.findOne({ name: name });
		const hash = user.password;

		if (user) {
			const passCheck = await bcrypt.compare(password, hash);
			if (passCheck == true) {
				return user;
			} else {
				throw new Error(
					"Error: Either the user does not exist or password was incorrect"
				);
			}
		} else {
			throw new Error(
				"Error: Either the user does not exist or password was incorrect"
			);
		}
	},

	//- #me
	me: async (args, context) => {
		const { accessToken } = args;
		const { refreshToken } = context.req;
		if (!accessToken) {
			return;
		}
		try {
			let user = jwt.verify(accessToken, process.env.JWT_ADMIN_SECRET);
			return user;
		} catch {
			//-- If access token fails pass it on to the refresh cycle through args and send the results back to the request
			const refresh = await this.roots.refresh({ refreshToken, context });
			return refresh;
		}
	},

	//- #refresh
	refresh: async (args, context) => {
		//-- We need to grab the token from either args or context, depending on where the api was called from
		const token = args?.refreshToken || context?.req.refreshToken;
		const res = args?.context.res || context?.res;
		if (!token) {
			throw new Error("No token present - 401", 401);
		} else {
			//-- first we verify the JWT, then serve up a new access token to store client side
			try {
				const decodedToken = jwt.verify(token, process.env.REFRESH_SECRET);
				const { name } = decodedToken;
				const user = await User.findOne({ name });

				//-- Checking to make sure the refresh token from the header is still greenlit on the database
				const dbTokenIndex = user.refreshTokens.indexOf(token);
				if (dbTokenIndex == -1) {
					throw new Error("Bad token present - 401", 401);
				} else {
					const accessToken = jwt.sign(
						{
							exp: Math.floor(Date.now() / 1000) + 60 * 5, //- 5min
							id: user._id,
							name: user.name,
							admin: user.admin,
						},
						user.admin ? process.env.JWT_ADMIN_SECRET : process.env.JWT_SECRET
					);
					const refreshToken = jwt.sign(
						{
							exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, //- 24hours
							name: user.name,
						},
						process.env.REFRESH_SECRET
					);
					//-- Rewriting our refreshtoken and pruning it at 3 entries (ex: work, home, phone)

					user.refreshTokens.push(refreshToken);
					if (user.refreshTokens.length > 3) {
						user.refreshTokens.shift();
					}

					await user.save();
					const response = {
						userTrailList: user.trailList,
						userCustomTrails: user.userTrails,
						name: user.name,
						id: user.id,
						accessToken: accessToken,
					};

					res.cookie("refreshtoken", refreshToken, {
						httpOnly: false, //--mark as true in production
						SameSite: "None",
						maxAge: 24 * 60 * 60 * 1000,
						// secure: true, SameSite:"Strict" //un-comment in production and change
					});
					return response;
				}
			} catch (error) {
				console.log(error);
				throw new Error("Error processing request", 101);
			}
		}
	},

	adminCheck: async (name, password, context) => {
		console.log("admincheck");

		const user = await User.findOne({ name });
		const hash = user.password;
		if (context.req.user && user && user.admin) {
			const passCheck = await bcrypt.compare(password, hash);
			if (passCheck == true) {
				console.log("true");
				return true;
			} else {
				console.log("false");
				throw new Error("Error: You aren't an admin");
			}
		} else {
			console.log("false");
			throw new Error("Error: You aren't an admin");
		}
	},

	//------- Trail Stuff -------\\

	Trail: async ({ name }, context) => {
		const trail = Trail.findOne({ name: name });
		if (!trail) {
			throw new Error("No trail found");
		} else {
			return trail;
		}
	},

	createTrail: async ({ name, trailPath }, context) => {
		if (!context.req.isAuth) {
			throw new Error(
				"Not authorized, please login to add a new trail to the database"
			);
		}
		const startLat = trailPath[0][0];
		const startLong = trailPath[0][1];

		const trail = new Trail({
			_id: new mongoose.Types.ObjectId(),
			name,
			startLat,
			startLong,
			trailPath,
			distance,
		});
		await trail.save();
		return trail;
	},

	getAllTrails: async ({}, context) => {
		const allTrails = await Trail.find({});
		return allTrails;
	},
	updateTrail: async (
		//-- Simple update, accepting new data, finding model, and saving after filling any blanks with original data
		{
			pathPoints,
			name,
			distance,
			waterPoints,
			tentPoints,
			trailID,
			username,
			password,
		},
		context
	) => {
		const admin = await this.roots.adminCheck(username, password, context);
		// if (admin) {
		// 	try {
		// 		const trail = await Trail.findOne({ name: trailName });
		// 		if (!trail) {
		// 			throw new Error("No trail found with that name");
		// 		}
		// 		trail.name = newName || trail.name;
		// 		trail.trailPath = newPath || trail.trailPath;
		// 		trail.distance = newDistance || trail.distance;
		// 		trail.newWaterPoints = newWaterPoints || trail.waterPoints;
		// 		trail.newTentPoints = newTentPoints || trail.waterPoints;
		// 		trail.save();
		// 		return trail;
		// 	} catch (error) {
		// 		return error;
		// 	}
		// } else {
		// 	throw new Error("Error parsing admin request");
		// }
	},
	//------- User Trail Stuff -------\\

	addToTrailList: async ({ trails }, context) => {
		//Check if user is loggedin, if they are find the user, compare incoming trail IDs to their list
		//if already on list skip, if not update user list
		if (!context.req.isAuth) {
			throw new Error(
				"Not authorized, please login to add a new trail to the database"
			);
		}
		const addedArray = [];
		const user = await User.findOne({ id: context.req.user.id });
		const p = async () =>
			await trails.forEach(async (trail) => {
				if (user.trailList.includes(trail._id)) {
					addedArray.push(trail.name);
					return;
				} else {
					addedArray.push(trail.name);
					console.log("here");
					user.trailList.push(trail._id);
					user.save();
					return;
				}
			});
		p();
		return `${addedArray.toString()} added to your list.`;
	},

	getMyTrailList: async ({}, context) => {
		if (!context.req.isAuth || !context.req.user) {
			throw new Error(
				"Not authorized, please login to add a new trail to the database"
			);
		}
		const userId = context.req.user.id;

		const user = await User.findOne({ id: userId })
			.populate("trailList")
			.populate("userTrails");
		const res = {
			userTrailList: user.trailList,
			userCustomTrails: user.userTrails,
		};
		return res;
	},
	addCustomUserTrail: async (
		{ pathPoints, name, distance, waterPoints, tentPoints, trailID },
		context
	) => {
		if (!context.req.isAuth) {
			throw new Error(
				"You must be logged in to save a custom trail path, it will be cached while you login/create an account so you can save it."
			);
		}

		const userId = context.req.user.id;
		const user = await User.findOne({ userId });
		console.log(tentPoints);

		const foundTrail = await UserTrail.findById(trailID);
		if (name === "undefined" && foundTrail) {
			foundTrail.startLat = pathPoints[0][0];
			foundTrail.startLong = pathPoints[0][1];
			foundTrail.trailPath = pathPoints;
			foundTrail.distance = distance;
			foundTrail.waterPoints = waterPoints;
			foundTrail.tentPoints = tentPoints;
			await foundTrail.save();
			return foundTrail;
		} else {
			const userTrail = new UserTrail({
				_id: new mongoose.Types.ObjectId(),
				createdby: userId,
				name,
				startLat: pathPoints[0][0],
				startLong: pathPoints[0][1],
				trailPath: pathPoints,
				distance,
				waterPoints,
				tentPoints,
			});
			await user.save();
			await userTrail.save();
			return userTrail;
		}
	},
};
