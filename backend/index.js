const request = require('request-promise-native');
const express = require('express');
const Swagger = require('swagger-client');
const SpotifyWebApi = require('spotify-web-api-node');
const bodyparser = require('body-parser');
const path = require('path')
const { Client: Database } = require('pg');

try {
  // Read from config.js if it exists
  var { KALEIDO, PG, SPOTIFY } = require('./config');
} catch (err) {
  // Otherwise read from environment
  var KALEIDO = {
    ARTIST: {
      USERNAME: process.env.KALEIDO_ARTIST_USERNAME,
      PASSWORD: process.env.KALEIDO_ARTIST_PASSWORD,
      FROM_ADDRESS: process.env.KALEIDO_ARTIST_FROM_ADDRESS,
    },
    DISTRIBUTOR: {
      USERNAME: process.env.KALEIDO_DISTRIBUTOR_USERNAME,
      PASSWORD: process.env.KALEIDO_DISTRIBUTOR_PASSWORD,
      FROM_ADDRESS: process.env.KALEIDO_DISTRIBUTOR_FROM_ADDRESS,
    }
  };
  var PG = {
    URL: process.env.DATABASE_URL,
  };
  var SPOTIFY = {
    CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
  };
}

const CONTRACT_URL = "https://u0dwkkmsov-u0mz5xk0j7-connect.us0-aws.kaleido.io/instances/9e88e4cf43cd9f063c640504bbfb4483a4bb2540?openapi";
const FRONTEND = path.join(__dirname, '../frontend');
const app = express();
const db = new Database({ connectionString: PG.URL });

class SwaggerClient {
  constructor(username, password, fromAddress, contractUrl) {
    this.fromAddress = fromAddress;
    this.client = Swagger(contractUrl, {
      requestInterceptor: req => {
        req.headers.authorization = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
      }
    });
  }

  async api() {
    const client = await this.client;
    return client.apis.default;
  }
};

class SpotifyClient {
  constructor(clientId, clientSecret) {
    this.token = null;
    this.expiry = null;
    this.client = new SpotifyWebApi({
      clientId: clientId,
      clientSecret: clientSecret,
    });
  }

  async getToken() {
    if (this.token && Date.now() < this.expiry) {
      return this.token;
    }
    const data = await this.client.clientCredentialsGrant();
    this.token = data.body['access_token'];
    this.expiry = Date.now() + ((data.body['expires_in'] - 60) * 1000);
    return this.token;
  }

  async api() {
    this.client.setAccessToken(await this.getToken());
    return this.client;
  }

  async trackInfo(isrc) {
    const api = await this.api();
    const resp = await api.searchTracks('isrc:' + isrc);
    const results = resp.body.tracks.items;
    return (results.length == 0) ? null : {
      artist: results[0].artists.map(a => a.name).join(', '),
      title: results[0].name,
    };
  }
}

const artistClient = new SwaggerClient(
  KALEIDO.ARTIST.USERNAME, KALEIDO.ARTIST.PASSWORD, KALEIDO.ARTIST.FROM_ADDRESS, CONTRACT_URL);
const distributorClient = new SwaggerClient(
  KALEIDO.DISTRIBUTOR.USERNAME, KALEIDO.DISTRIBUTOR.PASSWORD, KALEIDO.DISTRIBUTOR.FROM_ADDRESS, CONTRACT_URL);
const spotifyClient = new SpotifyClient(
  SPOTIFY.CLIENT_ID, SPOTIFY.CLIENT_SECRET);

app.use(bodyparser.json());

app.get('/api/tracks', async (req, res) => {
  try {
    db.query('SELECT * FROM tracks', async (err, queryRes) => {
      if (err) {
        res.status(500).send({error: err.stack});
      } else {
        const api = await artistClient.api();
        const songs = queryRes.rows;
        for (const song of songs) {
          let kaleidoResp = await api.get_get({
            "id": song.isrc,
            "kld-from": artistClient.fromAddress,
            "kld-sync": "true"
          });
          song.count = kaleidoResp.body.count;

          let spotifyResp = await spotifyClient.trackInfo(song.isrc);
          song.artist = spotifyResp ? spotifyResp.artist : "Unknown";
          song.title = spotifyResp ? spotifyResp.title : "Unknown";
        }
        res.status(200).send(JSON.stringify(songs));
      }
    });
  } catch (err) {
    res.status(500).send({
      error: `${err.response && JSON.stringify(err.response.body) && err.response.text}\n${err.stack}`
    });
  }
});

app.put('/api/tracks/:id', async (req, res) => {
  try {
    db.query(
      'INSERT INTO tracks VALUES($1, $2, $3)',
      [req.params.id, req.body.artist, req.body.title]);
    res.status(204).send();
  } catch (err) {
    res.status(500).send({
      error: `${err.response && JSON.stringify(err.response.body) && err.response.text}\n${err.stack}`
    });
  }
});

app.post('/api/tracks/:id/increment', async (req, res) => {
  try {
    const api = await distributorClient.api();
    let postRes = await api.increment_post({
      body: {
        id: req.params.id,
      },
      "kld-from": distributorClient.fromAddress,
      "kld-sync": "true"
    });
    res.status(200).send(postRes.body);
  } catch (err) {
    res.status(500).send({
      error: `${err.response && JSON.stringify(err.response.body) && err.response.text}\n${err.stack}`
    });
  }
});

// Serve static files and all other routes from the React frontend app
app.use(express.static(path.join(FRONTEND, 'build')))
app.get('*', (req, res) => {
  res.sendFile(path.join(FRONTEND, 'build/index.html'))
});

function initDb() {
  db.query(
    'CREATE TABLE IF NOT EXISTS tracks (' +
      'isrc VARCHAR(12) PRIMARY KEY,' +
      'artist VARCHAR(255),' +
      'title VARCHAR(255)' +
    ')'
  );
}

async function init() {
  db.connect();
  initDb();

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Listening on port ${PORT}`))
}

init().catch(err => {
  console.error(err.stack);
  process.exit(1);
});

module.exports = {
  app
};
