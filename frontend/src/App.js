import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import { withStyles } from '@material-ui/core/styles';
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
});

function Song(props) {
  return (
    <li>
      <div className="SongTitle">{props.title}</div>
      <div className="SongArtist">{props.artist}</div>
      <div className="SongCount">{props.count}</div>
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
      <Button variant="contained" color="primary" size="large">
        View full chart
      </Button>
    </Box>
  );
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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

  render() {
    return (
      <Container maxWidth="xl" disableGutters>
        <Grid container className="TitleBox">
          <Grid item xs={12} lg={6}>
            <Box className="Title">
              <Typography variant="h1" className={this.props.classes.title}>
                Mixdown
              </Typography>
              <Typography variant="h6">
                powered by
                <img src={KaleidoLogo} alt="Kaleido" className="KaleidoLogo" />
              </Typography>
            </Box>
            <Container className="Subtitle">
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
            <Button variant="contained" color="secondary" size="large">
              For artists
            </Button>
            <Button variant="contained" color="secondary" size="large">
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
      </Container>
    );
  }
}

export default withStyles(styles)(App);
