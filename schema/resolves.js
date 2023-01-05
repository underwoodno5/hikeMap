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
});

const UserTrail = mongoose.model("UserTrail", {
	createdby: Schema.Types.ObjectId,
	name: String,
	startLat: Number,
	startLong: Number,
	trailPath: [[Number]],
});

const User = mongoose.model("User", {
	name: String,
	password: String,
	joinDate: String,
	token: String,
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
//- createUser
//- login
//-	deleteUser
//-	me

//------- Trail Stuff -------\\
//- Trail
//- createTrail
//- getAllTrails

//----- User Trail Stuff -----\\
//- addToTrailList
//- getMyTrailList
//- addToUserTrailPath

exports.roots = {
	//------- User Stuff -------\\

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

		const user = new User({ name, password: hashedPassword, joinDate });
		user.token = jwt.sign(
			{ id: user._id, name: user.name, password: user.password },
			process.env.JWT_SECRET
		);

		user.save();

		return user;
	},

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
			const jwtData = user.admin
				? {
						id: user._id,
						name: user.name,
						admin: true,
				  }
				: {
						id: user._id,
						name: user.name,
				  };

			if (passCheck == true) {
				user.token = jwt.sign(
					jwtData,
					user.admin ? process.env.JWT_ADMIN_SECRET : process.env.JWT_SECRET
				);
				user.save();
				context.res.cookie("token", user.token, {
					httpOnly: false,
					sameSite: "Strict",
					maxAge: 86400 * 1000,
					// secure: true, //un-comment in production
				});
				return user;
			} else {
				throw new Error(
					"Error: Either the user does not exist or password was incorrect"
				);
			}
		}
	},
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
	me: async (_, context) => {
		const user = context.req.user;
		if (!user) {
			throw new Error("Error: bad token");
		} else {
			return user;
		}
	},

	adminCheck: async (name, password, context) => {
		const user = await User.findOne({ name });
		const hash = user.password;
		if (context.req.user && user && user.admin) {
			const passCheck = await bcrypt.compare(password, hash);
			if (passCheck == true) {
				return true;
			} else {
				throw new Error("Error: You aren't an admin");
			}
		} else {
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
		});
		await trail.save();
		return trail;
	},

	getAllTrails: async ({}, context) => {
		const allTrails = await Trail.find({});
		return allTrails;
	},
	updateTrail: async (
		{ trailName, username, password, newName, newPath },
		context
	) => {
		const admin = await this.roots.adminCheck(username, password, context);
		if (admin) {
			try {
				const trail = await Trail.findOne({ name: trailName });
				if (!trail) {
					throw new Error("No trail found with that name");
				}
				trail.name = newName || trail.name;
				trail.trailPath = newPath || trail.trailPath;
				trail.save();
				return trail;
			} catch (error) {
				return error;
			}
		} else {
			throw new Error("Error parsing admin request");
		}
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
		console.log(user);
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
		const userId = context.req.user.id;
		if (!context.req.isAuth) {
			throw new Error(
				"Not authorized, please login to add a new trail to the database"
			);
		}
		const user = await User.findOne({ id: userId }).populate("trailList");
		return user.trailList;
	},
	addCustomUserTrail: async ({ pathPoints, name }, context) => {
		if (!context.req.isAuth) {
			throw new Error(
				"You must be logged in to save a custom trail path, it will be cached while you login/create an account so you can save it."
			);
		}
		const userId = context.req.user.id;
		const user = await User.findOne({ userId });

		const userTrail = new UserTrail({
			_id: new mongoose.Types.ObjectId(),
			createdby: userId,
			name,
			startLat: pathPoints[0][0],
			startLong: pathPoints[0][1],
			trailPath: pathPoints,
		});
		console.log(userTrail._id);
		user.userTrails.push(userTrail._id);
		await user.save();
		await userTrail.save();

		return userTrail;
	},
};
