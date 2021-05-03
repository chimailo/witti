import React from "react";
import { NavLink } from "react-router-dom";
import ButtonBase from "@material-ui/core/ButtonBase";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import {
  makeStyles,
  createStyles,
  Theme,
  useTheme,
} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolbar: {
      width: "100%",
      display: "flex",
      backgroundColor: theme.palette.background.paper,
    },
    button: {
      width: "100%",
      textTransform: "capitalize",
      minHeight: "54px",
      fontWeight: theme.typography.fontWeightBold,
      padding: theme.spacing(2),
      transition: theme.transitions.create("all"),
      color: theme.palette.text.secondary,
      "&:hover": {
        color: theme.palette.primary.main,
      },
    },
  })
);

export default function FollowTab({ username }: { username?: string }) {
  return (
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar>
        <TabLink label="followers" to={`/${username}/followers`} />
        <TabLink label="following" to={`/${username}/following`} />
      </Toolbar>
    </AppBar>
  );
}

function TabLink({ to, label }: { to: string; label: string }) {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <ButtonBase
      focusRipple
      className={classes.button}
      component={NavLink}
      activeStyle={{
        color: theme.palette.primary.main,
      }}
      to={to}
    >
      {label}
    </ButtonBase>
  );
}
