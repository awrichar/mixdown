const request = require('request-promise-native');
const express = require('express');
const bodyparser = require('body-parser');
const path = require('path');

const FRONTEND = path.join(__dirname, '../frontend');

class MixdownServer {
  constructor(artistClient, distributorClient, spotifyClient) {
    this.app = express();
    this.app.use(bodyparser.json());

    this.app.get('/api/tracks', async (req, res) => {
      try {
        const api = await artistClient.api();
        let resp = await api.getAllSongs_get({
          "kld-from": artistClient.fromAddress,
          "kld-sync": "true"
        });
        const tracks = resp.body.tracks.map(isrc => ({isrc: isrc}));

        for (const track of tracks) {
          resp = await api.getSong_get({
            "isrc": track.isrc,
            "kld-from": artistClient.fromAddress,
            "kld-sync": "true"
          });
          track.count = resp.body.count || 0;

          let spotifyResp = await spotifyClient.trackInfo(track.isrc);
          track.artist = spotifyResp ? spotifyResp.artist : "Unknown";
          track.title = spotifyResp ? spotifyResp.title : "Unknown";
        }
        res.status(200).json(tracks);
      } catch (err) {
        res.status(500).json({
          error: `${err.response && err.response.text}\n${err.stack}`
        });
      }
    });

    this.app.post('/api/tracks/:isrc/increment', async (req, res) => {
      try {
        const api = await distributorClient.api();
        let postRes = await api.incrementSong_post({
          body: {
            isrc: req.params.isrc,
          },
          "kld-from": distributorClient.fromAddress,
          "kld-sync": "true"
        });
        res.status(200).send(postRes.body);
      } catch (err) {
        res.status(500).json({
          error: `${err.response && err.response.text}\n${err.stack}`
        });
      }
    });

    // Serve static files and all other routes from the React frontend app
    this.app.use(express.static(path.join(FRONTEND, 'build')))
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(FRONTEND, 'build/index.html'))
    });
  }

  start(port) {
    this.app.listen(port, () => console.log(`Listening on port ${port}`))
  }
}

module.exports = { MixdownServer };
