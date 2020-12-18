import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import { withStyles } from '@material-ui/core/styles';
import ArtistPopup from './ArtistPopup';
import DistributorPopup from './DistributorPopup';
import KaleidoLogo from './kaleido.svg';
import './App.css';

const styles = theme => ({
  title: {
    [theme.breakpoints.down('md')]: {
      fontSize: "10vw",
    },
    [theme.breakpoints.up('lg')]: {
      fontSize: "6.25vw",
    },
  },
  subtitle: {
    [theme.breakpoints.down('md')]: {
      paddingTop: "0",
    },
    [theme.breakpoints.up('lg')]: {
      paddingTop: "60px",
    },
  },
});

function Song(props) {
  return (
    <li>
      <div className="SongTitle">{props.title}</div>
      <div className="SongArtist">{props.artist}</div>
      <div className="SongCountWrapper">
        <div className="SongCount">{props.count}</div>
        <div>{props.count == 1 ? "play" : "plays"}</div>
      </div>
    </li>
  );
}

function SongList(props) {
  const songs = props.songs.map(song =>
    <Song key={song.isrc} artist={song.artist} title={song.title} count={song.count} />
  ).sort((a, b) => b.props.count - a.props.count).slice(0, 5);

  return (
    <Box className="Chart">
      <Typography variant="h4">
        Top Tracks
      </Typography>
      <ol>{songs}</ol>
    </Box>
  );
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      artistOpen: false,
      distributorOpen: false,
      songs: [],
    };
  }

  async componentDidMount() {
    this.fetchTracks();
  }

  async fetchTracks() {
    const res = await fetch(`/api/tracks`);
    if (res.ok) {
      this.setState({ songs: await res.json() });
    }
  }

  async saveTrack(data) {
    try {
      const res = await fetch(`/api/tracks/${data.isrc}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artist: data.artist,
          title: data.title,
        })
      });
      if (res.ok) {
        this.setArtistOpen(false);
        this.fetchTracks();
      } else {
        const {error} = await res.json();
        alert(error)
      }
    } catch(err) {
      alert(err.stack)
    }
  }

  async addPlay(data) {
    try {
      const res = await fetch(`/api/tracks/${data.isrc}/increment`, {
        method: 'POST',
      });
      if (res.ok) {
        this.setDistributorOpen(false);
        this.fetchTracks();
      } else {
        const {error} = await res.json();
        alert(error)
      }
    } catch(err) {
      alert(err.stack)
    }
  }

  setArtistOpen(open) {
    this.setState({ artistOpen: open });
  }

  setDistributorOpen(open) {
    this.setState({ distributorOpen: open });
  }

  render() {
    const artistOpen = () => { this.setArtistOpen(true); };
    const artistClose = () => { this.setArtistOpen(false); };
    const distributorOpen = () => { this.setDistributorOpen(true); };
    const distributorClose = () => { this.setDistributorOpen(false); };

    return (
      <Container maxWidth="xl" disableGutters>
        <Grid container className="TitleBox">
          <Grid item xs={12} lg={6}>
            <Box className="Title">
              <Typography variant="h1" className={this.props.classes.title}>
                Mixdown
              </Typography>
              <Typography variant="h6">
                powered by <Link href="http://kaleido.io">
                <img src={KaleidoLogo} alt="Kaleido" className="KaleidoLogo" /></Link>
              </Typography>
            </Box>
            <Container className={`Subtitle ${this.props.classes.subtitle}`}>
              <Typography variant="h6">
                Live reporting of top songs across multiple streaming services.
              </Typography>
            </Container>
          </Grid>
          <Grid item xs={12} lg={6} className="ChartBox">
            <SongList songs={this.state.songs} />
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={12} lg={6} className="AboutText">
            <Typography variant="h4">
              Stream your tracks. Track your streams.
            </Typography>
            <Typography>
              Mixdown gathers stats from multiple streaming platforms in realtime.
              Powered by blockchain technology, it allows artists, listeners,
              and streaming distributors to come together with no barriers to
              track the latest trends in music.
            </Typography>
            <Button variant="contained" color="secondary" size="large" onClick={artistOpen}>
              For artists
            </Button>
            <Button variant="contained" color="secondary" size="large" onClick={distributorOpen}>
              For distributors
            </Button>
          </Grid>
          <Grid item xs={12} lg={6} className="AboutText">
            <Typography variant="h4">
              About this site
            </Typography>
            <Typography>
              This website is only a prototype and all data is simulated.
            </Typography>
            <br />
            <Typography>
              Created by&nbsp;
              <Link href="http://arichardson.co" color="secondary" underline="always">
                Andrew Richardson
              </Link>.
            </Typography>
          </Grid>
        </Grid>
        <ArtistPopup
          open={false}
          onCancel={artistClose}
          onSubmit={(data) => this.saveTrack(data)}
        />
        <DistributorPopup
          open={this.state.distributorOpen}
          songs={this.state.songs}
          onCancel={distributorClose}
          onSubmit={(data) => this.addPlay(data)}
        />
      </Container>
    );
  }
}

export default withStyles(styles)(App);
