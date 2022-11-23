const jwt = require("jsonwebtoken");

exports.auth = function (req, res, next) {
	const cookieString = req.headers.cookie;

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
		try {
			let decoded = jwt.verify(token, process.env.JWT_SECRET);
			req.isAuth = true;
			req.user = decoded;
		} catch (err) {
			req.isAuth = false;
			req.user = false;
			req.error = err;
		}
		return next();
	}
};
