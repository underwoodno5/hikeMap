const mongoose = require("mongoose");

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

module.exports = { Trail, UserTrail, User, BlockedToken };
