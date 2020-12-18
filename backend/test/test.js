const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const server = require('../server');
const expect = chai.expect;

chai.use(chaiHttp);

class FakeSwaggerClient {
  constructor() {
    this.reset();
  }

  reset() {
    this._api = {};
  }

  api() {
    return this._api;
  }
}

class FakeSpotifyClient {
  constructor() {
    this.reset();
  }

  reset() {
    this.trackInfo = sinon.fake();
  }
}

describe('Tracks API', () => {
  let viewerClient = new FakeSwaggerClient();
  let distributorClient = new FakeSwaggerClient();
  let spotifyClient = new FakeSpotifyClient();
  let mixdown = new server.MixdownServer(viewerClient, distributorClient, spotifyClient);
  let app = mixdown.app;

  afterEach(() => {
    viewerClient.reset();
    distributorClient.reset();
    spotifyClient.reset();
  })

  it('should handle empty list', (done) => {
    viewerClient.api().getAllSongs_get = sinon.fake.returns({
      body: {
        tracks: []
      },
    });

    chai.request(app)
      .get('/api/tracks')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.eql([]);
        done();
      });
  });

  it('should handle unknown play count', (done) => {
    viewerClient.api().getAllSongs_get = sinon.fake.returns({
      body: { tracks: ['ABC'] },
    });

    viewerClient.api().getSong_get = sinon.fake.returns({
      body: {},
    });

    spotifyClient.trackInfo = sinon.fake.returns({
      artist: 'ARTIST',
      title: 'TITLE',
    });

    chai.request(app)
      .get('/api/tracks')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.eql([{
          isrc: 'ABC',
          artist: 'ARTIST',
          title: 'TITLE',
          count: 0,
        }]);
        done();
      });
  });

  it('should handle unknown metadata', (done) => {
    viewerClient.api().getAllSongs_get = sinon.fake.returns({
      body: { tracks: ['ABC'] },
    });

    viewerClient.api().getSong_get = sinon.fake.returns({
      body: { count: 1 },
    });

    chai.request(app)
      .get('/api/tracks')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.eql([{
          isrc: 'ABC',
          artist: 'Unknown',
          title: 'Unknown',
          count: 1,
        }]);
        done();
      });
  });

  it('should handle multiple tracks', (done) => {
    viewerClient.api().getAllSongs_get = sinon.fake.returns({
      body: { tracks: ['ABC', 'XYZ'] },
    });

    let getSong = sinon.stub();
    viewerClient.api().getSong_get = getSong;
    getSong.onCall(0).returns({
      body: { count: 2 },
    });
    getSong.onCall(1).returns({
      body: { count: 1 },
    });

    let trackInfo = sinon.stub();
    spotifyClient.trackInfo = trackInfo;
    trackInfo.onCall(0).returns({
      artist: 'ARTIST',
      title: 'TITLE',
    });
    trackInfo.onCall(1).returns({
      artist: 'ARTIST2',
      title: 'TITLE2',
    });

    chai.request(app)
      .get('/api/tracks')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.eql([{
          isrc: 'ABC',
          artist: 'ARTIST',
          title: 'TITLE',
          count: 2,
        }, {
          isrc: 'XYZ',
          artist: 'ARTIST2',
          title: 'TITLE2',
          count: 1,
        }]);
        done();
      });
  });

  it('should handle increment', (done) => {
    distributorClient.api().incrementSong_post = sinon.fake.returns({
      body: {},
    });

    chai.request(app)
      .post('/api/tracks/ABC/increment')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});
