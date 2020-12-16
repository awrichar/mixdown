import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { makeStyles } from '@material-ui/core/styles';
import KaleidoLogo from './kaleido.svg';
import './App.css';

const useStyles = makeStyles((theme) => {
  return {
    title: {
      [theme.breakpoints.down('md')]: {
        fontSize: "10vw",
      },
      [theme.breakpoints.up('lg')]: {
        fontSize: "6.25vw",
      },
    },
  };
})

function Song(props) {
  return (
    <li>
      <div className="SongTitle">{props.title}</div>
      <div className="SongArtist">{props.artist}</div>
    </li>
  );
}

function SongList(props) {
  const songs = props.songs.map(song =>
    <Song key={song.id} artist={song.artist} title={song.title} />
  );

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

export default function App() {
  const styles = useStyles();

  const songs = [
    {id: 1, artist: "Betting for Benson", title: "Runaway Girl"},
    {id: 2, artist: "Betting for Benson", title: "Blame It On My Heart"},
    {id: 3, artist: "Betting for Benson", title: "Beautiful Disease"},
    {id: 4, artist: "Betting for Benson", title: "My Kind of Crazy"},
    {id: 5, artist: "Betting for Benson", title: "Remembering Amy"},
  ];

  return (
    <Container maxWidth="xl" disableGutters>
      <Grid container className="TitleBox">
          <Grid item xs={12} lg={6}>
            <Box className="Title">
              <Typography variant="h1" className={styles.title}>
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
            <SongList songs={songs} />
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
