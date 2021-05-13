import { useState } from "react";
import { FormikProps } from "formik";
import DateFnsUtils from '@date-io/date-fns';
import { TextField } from '@material-ui/core';
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import {
  createStyles,
  makeStyles,
  Theme,
} from '@material-ui/core/styles';
// import { ProfileEditor } from "../Editor";
import { Profile } from "../../types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    field: {
      marginTop: theme.spacing(2),
    },
    button: {
      marginTop: '3rem',
      color: theme.palette.background.paper,
    },
  })
);

export default function ProfileForm({formik}: {formik: FormikProps<Omit<Profile, "created_on" | "updated_on">>}) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const classes = useStyles();
  const {values, touched, errors, handleChange, handleBlur} = formik

  const handleDateChange = (date: Date | null) => setSelectedDate(date);

  return (
    <form>
      <TextField
        name='name'
        label='Your name'
        type='text'
        className={classes.field}
        value={values.name}
        onChange={handleChange}
        onBlur={handleBlur}
        helperText={errors?.name && touched?.name && errors?.name}
        error={!!(errors?.name && touched?.name)}
        fullWidth
      />
      <TextField
        name='username'
        label='Username'
        type='text'
        className={classes.field}
        value={values.username}
        onChange={handleChange}
        onBlur={handleBlur}
        helperText={
          errors?.username && touched?.username && errors?.username
        }
        error={!!(errors?.username && touched?.username)}
        fullWidth
      />
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <DatePicker
          fullWidth
          name='dob'
          label='Birthday'
          format="MM/dd"
          className={classes.field}
          value={selectedDate}
          onBlur={handleBlur}
          onChange={handleDateChange}
          helperText={errors?.dob && touched?.dob && errors?.dob}
        />
      </MuiPickersUtilsProvider>
      <TextField
      multiline
        name='bio'
        label='About you'
        type='bio'
        rows={4}
        className={classes.field}
        value={values.bio}
        onChange={handleChange}
        onBlur={handleBlur}
        helperText={
          errors?.bio && touched?.bio && errors?.bio
        }
        error={!!(touched?.bio && errors?.bio)}
        fullWidth
      />
      {/* <ProfileEditor user={user!.profile} cacheKey={cacheKey} /> */}
    </form>
  )
}
