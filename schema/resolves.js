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
	startLat: String,
	startLong: String,
});

const User = mongoose.model("User", {
	name: String,
	password: String,
	joinDate: String,
	token: String,
	trailList: [{ type: Schema.Types.ObjectId, ref: Trail }],
});

//------------------
//------- Resolves
//------------------

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
		const user = await User.findOne({ name: name }).populate("trailList");
		if (!user) {
			throw new Error(
				"Error: Either the user does not exist or password was incorrect"
			);
		} else {
			const hash = user.password;
			const passCheck = await bcrypt.compare(password, hash);
			if (passCheck == true) {
				user.token = jwt.sign(
					{
						id: user._id,
						name: user.name,
					},
					process.env.JWT_SECRET
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

	//------- Trail Stuff -------\\

	Trail: async ({ name }, context) => {
		const trail = Trail.findOne({ name: name });
		if (!trail) {
			throw new Error("No trail found");
		} else {
			return trail;
		}
	},

	createTrail: async ({ name, startLat, startLong }, context) => {
		if (!context.req.isAuth) {
			throw new Error(
				"Not authorized, please login to add a new trail to the database"
			);
		}
		const trail = new Trail({
			_id: new mongoose.Types.ObjectId(),
			name,
			startLat,
			startLong,
		});
		await trail.save();
		return trail;
	},

	test: async () => {
		return "test success!";
	},

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
		user.token = jwt.sign(
			{
				id: user._id,
				name: user.name,
				trailList: user.trailList,
			},
			process.env.JWT_SECRET
		);
		user.save();
		context.res.cookie("token", user.token, {
			httpOnly: false,
			sameSite: "Strict",
			maxAge: 86400 * 1000,
			// secure: true, //un-comment in production
		});
		return user.trailList;
	},
	getAllTrails: async ({}, context) => {
		const allTrails = await Trail.find({});
		return allTrails;
	},

	test: async () => {
		return "test success!";
	},
};
