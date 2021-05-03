import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import {ProfileForm} from '../../components/forms';
import { KEYS } from '../../lib/constants';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper: {
      height: '100%',
      width: '100%',
      position: 'relative',
      '&:after': {
        content: '""',
        position: 'fixed',
        width: '100%',
        height: '70vh',
        zIndex: -1,
        top: 0,
        transformOrigin: 'left top',
        transform: 'skewY(-15deg)',
        backgroundColor: theme.palette.primary.main,
      },
    },
    paper: {
      width: '100%',
      padding: theme.spacing(3, 5),
      [theme.breakpoints.up('sm')]: {
        maxWidth: '500px',
        boxShadow: theme.shadows[3],
        padding: theme.spacing(5, 10),
        margin: theme.spacing(4, 'auto'),
      },
    },
    field: {
      marginTop: theme.spacing(2),
    },
    button: {
      marginTop: '3rem',
      color: theme.palette.background.paper,
    },
  })
);

export default function SignUp() {
  const classes = useStyles();

  return (
    <div className={classes.wrapper}>
      <Grid container alignItems='center' justify='center'>
        <Grid item xs={12} sm={8} md={6} component='main'>
          <Paper color='primary' elevation={0} className={classes.paper}>
            <Typography
              component='p'
              variant='h6'
              align='center'
              className={classes.field}
              noWrap
            >
              Edit your profile.
            </Typography>
            <ProfileForm cacheKey={KEYS.USER_PROFILE} />
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}
