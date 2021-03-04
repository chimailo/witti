import { createMuiTheme } from "@material-ui/core/styles";

type PreferenceProps = {
  mode?: "light" | "dark";
  faveColor: string;
};

const preferences: PreferenceProps = {
  mode: "light",
  faveColor: "#14b89c",
};

export const theme = createMuiTheme({
  palette: {
    primary: {
      main: preferences.faveColor,
    },
    secondary: {
      main: "#e1e8ec",
    },
    background: {
      default: "#e1e8ec",
      paper: "#fafafa",
    },
    type: preferences.mode,
  },
  mixins: {
    toolbar: {
      minHeight: "54px",
    },
  },
  typography: {
    h1: {
      fontSize: "3.5rem",
    },
    h2: {
      fontSize: "3rem",
    },
    h3: {
      fontSize: "2.5rem",
    },
    h4: {
      fontSize: "2rem",
    },
    h5: {
      fontSize: "1.5rem",
    },
    h6: {
      fontSize: "1.2rem",
    },
  },
});
