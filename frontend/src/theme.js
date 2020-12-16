import { red } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';

// A custom theme for this app
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#24064f',
    },
    secondary: {
      main: '#ffffff',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#24064f',
    },
    text: {
      primary: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Lato, sans-serif',
    fontSize: 16,
  },
  overrides: {
    MuiDialogTitle: {
      root: {
        color: '#000',
      }
    },
    MuiDialogContent: {
      root: {
        color: '#000',
      }
    }
  },
});

export default theme;
