const jwt = require("jsonwebtoken");

exports.auth = async function (req, res, next) {
	const cookieString = req.headers.cookie;

	//-- Every API call we're pulling a cookie from the header, and using it to verify the user to check if they
	//-- are logged in and an admin.

	if (!cookieString) {
		req.isAuth = false;
		return next();
	} else {
		let cookies = cookieString
			.split(";")
			.map((v) => v.split("="))
			.reduce((acc, v) => {
				acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
				return acc;
			}, {});
		let token = cookies.token;

		//** Verify JWT */
		try {
			let decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
			req.isAuth = true;
			req.isAdmin = true;
			req.user = decoded;
			req.token = token;
		} catch {
			try {
				let decoded = jwt.verify(token, process.env.JWT_SECRET);
				req.isAuth = true;
				req.isAdmin = false;
				req.user = decoded;
			} catch (err) {
				req.isAuth = false;
				req.user = false;
				req.error = err;
			}
		}
		return next();
	}
};
