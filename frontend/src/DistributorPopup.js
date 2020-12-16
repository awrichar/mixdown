import React from 'react';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

export default function DistributorPopup(props) {
  const [isrc, setIsrc] = React.useState("");
  const [waiting, setWaiting] = React.useState(false);

  const songs = props.songs.map(song =>
    <option key={song.isrc} value={song.isrc}>{song.artist} - {song.title}</option>
  );

  const handleChange = event => {
    setIsrc(event.target.value);
  };

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
          <FormControl>
            <Select native onChange={handleChange} initialValue="">
              <option key="" value=""></option>
              {songs}
            </Select>
          </FormControl>
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