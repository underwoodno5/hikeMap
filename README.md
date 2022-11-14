<h1  align="center">leaf</h1>

<h4  align="center">A minimal map utility, for those who want to spend time in the backcountry.</h4>

<p  align="center">
<a  href="#core-features">Core Features</a> •
<a  href="#packages">Packages</a> •
<a  href="#how-to-use">How To Use</a> •
<a  href="#credits">Credits</a> •
<a  href="#license">License</a>
</p>

## Core Features

- Custom Maps

- Map overlays for custom pathing

- Offline Maps

- Unlimited locally saved map snippets and pathing for offline view

- Online trail syncing

- User-based trail sync for online backup

- App will keep alive in tray for quick usage

- Multiplatform PWA

- Browser/Device independent

## How To Use

 <p  align="center">
<a  href="#server-setup">Server Setup</a> •
<a  href="#client-setup">Client Setup</a> 
</p>

---

<h4  align="center">Requirements.</h4>


<p  align="center">
<a  href="https://git-scm.com">Git</a> •
<a  href="https://nodejs.org/en/download/">NodeJS</a> •
<a  href="http://npmjs.com">npm</a> 
</p>

### Server Setup

Clone this repository with git and open terminal. Open terminal and cd into the repository.

Install node modules :

```bash
# Install packages
$ npm install

#Create .env file to house your variables
$ touch .env
```

In your IDE of choice enter the required environment variables:

```bash
ADMIN_PASS=x
JWT_SECRET=y
PORT=z
ATLASLOGIN=a
STATUS=b
```

These will fill in the variables throughout the server, on run. Note that x and y can be any password you desire, z is the PORT your server will run on.

To find the URL for a just visit your DB of choice and find the connection url that includes your DB password and username.

Status will either be 'developer' or 'production'. Settings for both are round in server.js.

### Client Setup

Open a second terminal window and cd to the repository folder and into /client.

```bash
#Install packages
$ npm install
```

## Running

For the app to work you'll need to run the server and client. With two terminal windows open (one in base repo and one in repo/client):

Base repo:

```bash
#To start server in development mode (refresh server on saved changes)
$ npm run startdev
#For static server
$ npm start
```

Client:

```bash
#For client
$ npm start
```

## Credits

This software uses the following open source packages:

- [ReactJS](https://reactjs.org//)
- [Node.js](https://nodejs.org/)
- [leaflet](https://leafletjs.com/)
- [react-leaflet](https://react-leaflet.js.org/)
- [nodemon](https://nodemon.io/)
- [bcrypt](https://www.npmjs.com/package/bcrypt)
- [mongoose](https://mongoosejs.com/)
- [dotenv](https://github.com/motdotla/dotenv#readme)
- [GraphQL](https://graphql.org/)
- [Express](https://expressjs.com/)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- [express-graphq](https://github.com/graphql/express-graphql)

## License

MIT

---

> GitHub [@underwoodno5](https://github.com/underwoodno5)

> Twitter [@amit_merchant](https://twitter.com/amit_merchant)
