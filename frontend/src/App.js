import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
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
    </Box>
  );
}

function ArtistPopupField(props) {
  const handleChange = event => {
    props.setter(event.target.value);
  };

  return (
    <TextField
      variant="filled"
      fullWidth
      margin="dense"
      label={props.label}
      onChange={handleChange}
    />
  );
}

function ArtistPopup(props) {
  const [isrc, setIsrc] = React.useState("");
  const [artist, setArtist] = React.useState("");
  const [title, setTitle] = React.useState("");

  const handleSubmit = () => {
    props.onSubmit({
      isrc: isrc,
      artist: artist,
      titls: title,
    });
  };

  return (
    <Dialog open={props.open} maxWidth="sm" fullWidth>
      <DialogTitle>For artists</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Add a new song by filling out this form.
        </DialogContentText>
        <form>
          <ArtistPopupField label="ISRC" setter={setIsrc} />
          <ArtistPopupField label="Artist" setter={setArtist} />
          <ArtistPopupField label="Title" setter={setTitle} />
          <DialogActions>
            <Button variant="contained" disableElevation color="secondary" onClick={props.onCancel}>
              Cancel
            </Button>
            <Button variant="contained" disableElevation color="primary" onClick={handleSubmit}>
              Submit
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DistributorPopup(props) {
  const [isrc, setIsrc] = React.useState("");

  const songs = props.songs.map(song =>
    <option key={song.isrc} value={song.isrc}>{song.artist} - {song.title}</option>
  );

  const handleChange = event => {
    setIsrc(event.target.value);
  };

  const handleSubmit = () => {
    if (isrc) {
      props.onSubmit({
        isrc: isrc,
      });
    }
  };

  return (
    <Dialog open={props.open} maxWidth="sm" fullWidth>
      <DialogTitle>For distributors</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Record song plays using this form.
        </DialogContentText>
        <form>
          <FormControl>
            <Select native onChange={handleChange} initialValue="">
              <option key="" value=""></option>
              {songs}
            </Select>
          </FormControl>
          <DialogActions>
            <Button variant="contained" disableElevation color="secondary" onClick={props.onCancel}>
              Cancel
            </Button>
            <Button variant="contained" disableElevation color="primary" onClick={handleSubmit}>
              Submit
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  )
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
          open={this.state.artistOpen}
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
