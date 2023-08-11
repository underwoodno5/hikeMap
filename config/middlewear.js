const jwt = require("jsonwebtoken");
const { Trail, UserTrail, User, BlockedToken } = require("../schema/models");

exports.auth = async function (req, res, next) {
	const cookieString = req.headers.cookie;
	const accessToken = req.headers.accesstoken;

	//-- Every API call we need this middleware to pull out potential cookies for our header. We pass that data
	// onto our resolvers to deal with. Our client also sends the access token (stored in localdata) through a
	// cookie to be dealt with here.

	if (!cookieString) {
		req.auth = false;
		return next();
	} else {
		let cookies = cookieString
			.split(";")
			.map((v) => v.split("="))
			.reduce((acc, v) => {
				acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
				return acc;
			}, {});
		const refreshToken = cookies.refreshtoken;

		try {
			let user =
				jwt.verify(accessToken, process.env.JWT_ADMIN_SECRET) ||
				jwt.verify(accessToken, process.env.JWT_SECRET);
			req.user = user;
			req.authorized = true;
		} catch {
			console.log("accessToken failed verification");
			//-- If access token fails pass it on to the refresh cycle
			try {
				const decodedToken = jwt.verify(
					refreshToken,
					process.env.REFRESH_SECRET
				);
				const { name } = decodedToken;
				const user = await User.findOne({ name });

				//-- Checking to make sure the refresh token from the header is still greenlit on the database
				const dbTokenIndex = user.refreshTokens.indexOf(refreshToken);
				if (dbTokenIndex == -1) {
					//-- No refreshtoken present, pass on to api request for further handling
					console.log("No refreshtoken match");
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
						name: user.name,
						id: user.id,
						admin: user.admin,
						accessToken: accessToken,
					};

					res.cookie("refreshtoken", refreshToken, {
						httpOnly: false, //--mark as true in production
						SameSite: "None",
						maxAge: 24 * 60 * 60 * 1000,
						// secure: true, SameSite:"Strict" //un-comment in production and change
					});

					req.accessToken = accessToken;
					req.user = response;
					console.log("access token refreshed");
				}
			} catch (error) {
				console.log("Error processing refresh request:");
				console.log(error);
			}
		}
		return next();
	}

	// Delete, don't un-comment
	// } else {
	// 	let cookies = cookieString
	// 		.split(";")
	// 		.map((v) => v.split("="))
	// 		.reduce((acc, v) => {
	// 			acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
	// 			return acc;
	// 		}, {});
	// 	let token = cookies.refreshtoken;

	// 	//** Verify JWT */
	// 	try {
	// 		let decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
	// 		req.isAuth = true;
	// 		req.isAdmin = true;
	// 		req.user = decoded;
	// 		req.token = token;
	// 	} catch {
	// 		try {
	// 			let decoded = jwt.verify(token, process.env.JWT_SECRET);
	// 			req.isAuth = true;
	// 			req.isAdmin = false;
	// 			req.user = decoded;
	// 		} catch (err) {
	// 			req.isAuth = false;
	// 			req.user = false;
	// 			req.error = err;
	// 		}
	// 	}
};
