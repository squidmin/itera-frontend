// theme.ts
import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#d3bcbd', // Replace '#newColor' with your desired AppBar color for light mode
      contrastText: '#fff',
    },
    // Define other theme properties for light mode
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          color: '#000', // Ensuring button text is black in light mode
          '&:visited': {
            color: '#000', // Ensuring button text remains black after click in light mode
          },
        },
      },
    },
    // Include global link style overrides if necessary
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    // Define other theme properties for dark mode
    primary: {
      main: 'rgba(187,222,251,0.49)', // Replace '#newColor' with your desired AppBar color for light mode
      contrastText: '#333',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          color: '#fff', // Ensuring button text is white in dark mode
          '&:visited': {
            color: '#fff', // Ensuring button text remains white after click in dark mode
          },
        },
      },
    },
    // Include global link style overrides if necessary
  },
});

export { lightTheme, darkTheme };
