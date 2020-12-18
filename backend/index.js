const request = require('request-promise-native');
const Swagger = require('swagger-client');
const SpotifyWebApi = require('spotify-web-api-node');
const server = require('./server');

function readConfig() {
  try {
    // Read from config.js if it exists
    return require('./config');
  } catch (err) {
    // Otherwise read from environment
    return {
      KALEIDO: {
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
      },
      SPOTIFY: {
        CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
        CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
      },
    };
  }
}

const { KALEIDO, SPOTIFY } = readConfig();
const CONTRACT_URL = "https://u0dwkkmsov-u0mz5xk0j7-connect.us0-aws.kaleido.io/instances/98c020e24a66f419b5c154768a69f2997f1e20e1?openapi";

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
const mixdown = new server.MixdownServer(artistClient, distributorClient, spotifyClient);
const app = mixdown.app;

async function init() {
  mixdown.start(process.env.PORT || 4000);
}

init().catch(err => {
  console.error(err.stack);
  process.exit(1);
});

module.exports = { app };
