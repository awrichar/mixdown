# mixdown
Music billboards powered by blockchain.

## Live Demo

View the demo at http://mixdown.herokuapp.com

## Kaleido Blockchain Setup

To run your own instance of this app, it requires a blockchain configured
with <a href="http://kaleido.io">Kaleido</a>.

1. Create a Network and Environment within your Organization.
2. Create 2 Nodes within your Environment, representing a "distributor" and a "viewer".
3. Create a Contract Project, upload the contract from `backend/contracts/toptracks.sol`,
and promote it into your Environment.
4. Use the "distributor" Node to deploy an instance of the contract.
5. Generate two sets of Application Credentials to use for the distributor and viewer.

Real world notes: in a hypothetical consortium, many distributors would have their own
Organizations with their own Nodes, and would share the Network and deployed contract.
The contract is structured such that the original deployer address is considered a
distributor, and any current distributor may add the address of a new distributor.

## Spotify API Setup

This app also uses the Spotify API to map ISRCs to song metadata. You must register
an application at <a href="https://developer.spotify.com">Spotify</a> and generate a
client ID and secret.

## Configuration

Rename `backend/config.example.js` to `backend/config.js` and fill in the configuration
values for Kaleido and Spotify.

## Running

Run `npm start` and `npm start --prefix frontend/` to start both the backend and
frontend applications.

## Testing

Run `npm test` to execute unit tests.
