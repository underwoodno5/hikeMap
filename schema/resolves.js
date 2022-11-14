const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { response } = require("express");

//------------------
//------- Models
//------------------
const User = mongoose.model("User", {
	name: String,
	password: String,
	joinDate: String,
	token: String,
	trailList: Object,
});

const Trail = mongoose.model("Trail", {
	name: String,
	startLat: String,
	startLong: String,
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
		const user = await User.findOne({ name: name });
		const hash = user.password;

		if (user) {
			const passCheck = await bcrypt.compare(password, hash);
			if (passCheck == true) {
				user.token = jwt.sign(
					{ id: user._id, name: user.name, password: user.password },
					process.env.JWT_SECRET
				);
				user.save();
				context.res.cookie("token", user.token, {
					httpOnly: false,
					sameSite: "lax",
					maxAge: 86400 * 1000,
					// secure: true, //un-comment in production
				});
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

	Trail: async ({ name }, context) => {
		const trail = Trail.findOne({ name: name });
		if (!trail) {
			throw new Error("No trail found");
		} else {
			return trail;
		}
	},

	//------- Trail Stuff -------\\
	createTrail: async ({ name, startLat, startLong }) => {
		const trail = new Trail({ name, startLat, startLong });
		await trail.save();
		return trail;
	},

	test: async () => {
		return "test success!";
	},
};
