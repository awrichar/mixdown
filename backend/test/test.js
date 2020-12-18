const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const server = require('../server');
const expect = chai.expect;

chai.use(chaiHttp);

class FakeSwaggerClient {
  constructor() {
    this._api = {};
  }

  api() {
    return this._api;
  }
}

describe('Tracks API', () => {
  it('should handle empty list',  (done) => {
    let artistClient = new FakeSwaggerClient();
    let distributorClient = new FakeSwaggerClient();
    let spotifyClient = sinon.fake();
    let mixdown = new server.MixdownServer(artistClient, distributorClient, spotifyClient);
    let app = mixdown.app;

    artistClient.api().getAllSongs_get = sinon.fake.returns({
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
});
