import React from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useTheme } from '@material-ui/core/styles';
import { useMediaQuery, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@material-ui/core';
import { KEYS } from '../../lib/constants';
import {ProfileForm} from '../../components/forms';
import { Profile, User } from "../../types";
import { useSetProfile } from '../../lib/hooks/user';
import {
  validateName,
  validateUsername,
} from '../../lib/validators';


// const useStyles = makeStyles((theme: Theme) =>
//   createStyles({
//     wrapper: {
//       height: '100%',
//       width: '100%',
//       position: 'relative',
//       '&:after': {
//         content: '""',
//         position: 'fixed',
//         width: '100%',
//         height: '70vh',
//         zIndex: -1,
//         top: 0,
//         transformOrigin: 'left top',
//         transform: 'skewY(-15deg)',
//         backgroundColor: theme.palette.primary.main,
//       },
//     },
//     paper: {
//       width: '100%',
//       padding: theme.spacing(3, 5),
//       [theme.breakpoints.up('sm')]: {
//         maxWidth: '500px',
//         boxShadow: theme.shadows[3],
//         padding: theme.spacing(5, 10),
//         margin: theme.spacing(4, 'auto'),
//       },
//     },
//     field: {
//       marginTop: theme.spacing(2),
//     },
//     button: {
//       marginTop: '3rem',
//       color: theme.palette.background.paper,
//     },
//   })
// );

type EditProfileModalProps = {
  isOpen: boolean;
  user: User
  handleClose: () => void;
};

export default function EditProfileModal(props: EditProfileModalProps) {
  // const classes = useStyles();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('xs'));
  const {mutate} = useSetProfile();

  const {isOpen, user, handleClose} = props

  const initialValues: Omit<Profile, 'created_on' | 'updated_on'> = {
    name: user?.profile.name || '',
    username: user?.profile.username || '',
    dob: user?.profile.dob || new Date(),
    avatar: user?.profile.avatar || '',
    bio: user?.profile.bio || ''
  }

  const saveProfile = (values: Omit<Profile, "created_on" | "updated_on">) => {
    console.log(values)
    mutate({values, cacheKey: KEYS.USER_PROFILE})
    handleClose();
  };

  return (
    <Dialog
      fullScreen={fullScreen}
      open={isOpen}
      onClose={handleClose}
      aria-labelledby='update profile'
    >
      <DialogTitle id='updateProfile'>Update your profile.</DialogTitle>
      <Formik
        initialValues={initialValues}
        validateOnChange={false}
        validationSchema={Yup.object({
          name: validateName(),
          username: validateUsername(),
        })}
        onSubmit={async (values) => saveProfile(values)}
      >
        {(props) => (
        <>
          <DialogContent>
            <DialogContentText><ProfileForm formik={props} />
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button color='primary' variant='contained' style={{color: 'white'}} onClick={() => saveProfile(props.values)}>
              update profile
            </Button>
          </DialogActions>
        </>)}
      </Formik>
    </Dialog>
  )
}
