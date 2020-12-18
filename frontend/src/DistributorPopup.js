import React from 'react';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';

function DistributorTextField(props) {
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

export default function DistributorPopup(props) {
  const [isrc, setIsrc] = React.useState("");
  const [waiting, setWaiting] = React.useState(false);

  const songs = props.songs.map(song =>
    <option key={song.isrc} value={song.isrc}>{song.artist} - {song.title}</option>
  );

  const handleSubmit = async () => {
    if (isrc) {
      setWaiting(true);
      await props.onSubmit({
        isrc: isrc,
      });
      setWaiting(false);
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
          <DistributorTextField label="ISRC" setter={setIsrc} />
          <DialogActions>
            {waiting && <CircularProgress size={30} />}
            <Button
              variant="contained"
              disableElevation
              color="secondary"
              disabled={waiting}
              onClick={props.onCancel}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              disableElevation
              color="primary"
              disabled={waiting}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  )
}