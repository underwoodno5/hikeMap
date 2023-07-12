const jwt = require("jsonwebtoken");

exports.auth = async function (req, res, next) {
	const cookieString = req.headers.cookie;

	//-- Every API call we need this middleware to pull out potential cookies for our header. We pass that data
	// onto our resolvers to deal with.

	if (!cookieString) {
		req.refreshToken = false;
		return next();
	} else {
		let cookies = cookieString
			.split(";")
			.map((v) => v.split("="))
			.reduce((acc, v) => {
				acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
				return acc;
			}, {});
		req.refreshToken = cookies.refreshtoken;
		return next();
	}
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
