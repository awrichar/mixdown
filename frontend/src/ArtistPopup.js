import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';

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

export default function ArtistPopup(props) {
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