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
        contractUrl: process.env.KALEIDO_CONTRACT_URL,
        viewer: {
          auth: process.env.KALEIDO_VIEWER_AUTH,
          address: process.env.KALEIDO_VIEWER_ADDRESS,
        },
        distributor: {
          auth: process.env.KALEIDO_DISTRIBUTOR_AUTH,
          address: process.env.KALEIDO_DISTRIBUTOR_ADDRESS,
        }
      },
      SPOTIFY: {
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      },
    };
  }
}

const { KALEIDO, SPOTIFY } = readConfig();

class SwaggerClient {
  constructor(auth, fromAddress, contractUrl) {
    this.fromAddress = fromAddress;
    this.client = Swagger(contractUrl, {
      requestInterceptor: req => {
        req.headers.authorization = `Basic ${Buffer.from(`${auth}`).toString("base64")}`;
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

const viewerClient = new SwaggerClient(KALEIDO.viewer.auth, KALEIDO.viewer.address, KALEIDO.contractUrl);
const distributorClient = new SwaggerClient(KALEIDO.distributor.auth, KALEIDO.distributor.address, KALEIDO.contractUrl);
const spotifyClient = new SpotifyClient(SPOTIFY.clientId, SPOTIFY.clientSecret);
const mixdown = new server.MixdownServer(viewerClient, distributorClient, spotifyClient);
const app = mixdown.app;

async function init() {
  mixdown.start(process.env.PORT || 4000);
}

init().catch(err => {
  console.error(err.stack);
  process.exit(1);
});

module.exports = { app };
