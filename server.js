const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");

const resolves = require("./schema/resolves");
const types = require("./schema/types");
const auth = require("./config/middlewear").auth;

//----------------------------
//---- Config
//----------------------------

//------ Express + Graphql

dotenv.config();

const typeDefs = types.typesDefs;
const rootValue = resolves.roots;
const schema = buildSchema(typeDefs);

let app = express();
let corsOptions = {
	origin: true,
	credentials: true,
};

var allowCrossDomain = function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "http://192.168.2.14:3000/login");
	res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
	res.header("Access-Control-Allow-Headers", "Content-Type");
	next();
};

app.use(allowCrossDomain);
app.use(cors(corsOptions));

app.use(
	"/graphql",
	auth,
	graphqlHTTP((req, res) => ({
		schema,
		rootValue,
		graphiql: { headerEditorEnabled: true },
		context: { req, res },
	}))
);

//---- Mongoose connection + Server spin

//-- Setting STATUS in the .env will allow you to change your boot process depending on the environment.

if (process.env.STATUS === "developer") {
	const port = process.env.PORT;
	const db = require("./config/dbconfig").mongoURI;

	try {
		mongoose.connect(
			db,
			{ useNewUrlParser: true, useUnifiedTopology: true },
			() =>
				console.log(
					"\x1b[94mMongoDB connected in \x1b[93mdeveloper mode...\x1b[0m\n"
				)
		);
	} catch (error) {
		console.log(error);
		console.log("Could not connect to server");
	}
	app.listen(port, () =>
		console.log(
			`\x1b[93mEars open on \x1b[94mport ${port} \x1b[93mvisit \x1b[94mhttp://localhost:5000/graphql \x1b[93mfor graphiql`
		)
	);
}
