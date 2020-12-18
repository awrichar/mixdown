import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';

export default function ArtistPopup(props) {
  return (
    <Dialog open={props.open} maxWidth="sm" fullWidth>
      <DialogTitle>For artists</DialogTitle>
      <DialogContent>
        <DialogContentText>
          By unifying song plays across multiple services, artists could
          gain a clearer picture of their overall reach.
        </DialogContentText>
        <DialogActions>
          <Button
            variant="contained"
            disableElevation
            color="secondary"
            onClick={props.onCancel}
          >
            Close
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}