const express = require('express');
const path = require('path')

const app = express();

const CONTRACTS = path.join(__dirname, 'contracts');
const FRONTEND = path.join(__dirname, '../frontend');

app.use(express.static(path.join(FRONTEND, 'build')))
app.get('*', (req, res) => {
  res.sendFile(path.join(FRONTEND, 'build/index.html'))
});

async function init() {
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
