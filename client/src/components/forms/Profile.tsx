import React, { useState } from "react";
import { Formik } from 'formik';
import * as Yup from 'yup';
import DateFnsUtils from '@date-io/date-fns';
import DoneIcon from '@material-ui/icons/Done';
import { TextField, Box, Typography, Chip, Button } from '@material-ui/core';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import {
  createStyles,
  makeStyles,
  Theme,
} from '@material-ui/core/styles';
import {
  validateName,
  validateUsername,
} from '../../lib/validators';
import { CenteredLoading } from "../Loading";
import { useAuth, useSetProfile } from '../../lib/hooks/user';
import { Tag } from '../../types';
import { useAllTags } from '../../lib/hooks/posts';

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

export default function ProfileForm({cacheKey}: {cacheKey: string}) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [tags, setTags] = useState<Pick<Tag, "id" | "name">[]>([])
  const classes = useStyles();
  const {data: user} = useAuth()
  const {mutate} = useSetProfile();
  const {data, error, status} = useAllTags()

  const handleDateChange = (date: Date | null) => setSelectedDate(date);

  return (
    <>
    <Formik
      initialValues={{
        name: user?.profile.name || '',
        username: user?.profile.username || '',
        dob: user?.profile.dob || new Date(),
        avatar: user?.profile.avatar || '',
        bio: user?.profile.bio || '',
      }}
      validateOnChange={false}
      validationSchema={Yup.object({
        name: validateName(),
        username: validateUsername(),
      })}
      onSubmit={async (values) => mutate({values, cacheKey})}
    >{({values,
    touched,
    errors,
    isSubmitting,
    handleChange,
    handleBlur}) => <form>
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
                  <KeyboardDatePicker
        disableFuture
        disableToolbar
        fullWidth
        variant="inline"
              name='dob'
              label='Birthday'
        format="MM/dd"
              className={classes.field}
        value={selectedDate}
              onBlur={handleBlur}
        InputAdornmentProps={{ position: "start" }}
        onChange={date => handleDateChange(date)}
                    helperText={errors?.dob && touched?.dob && errors?.dob}
                    KeyboardButtonProps={{
                      'aria-label': 'change date',
                    }}
                    views={['date', 'month']}
      />
      </MuiPickersUtilsProvider>
            <TextField
            multiline
              name='bio'
              label='About you'
              type='bio'
              rows={4}
              className={classes.field}
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              helperText={
                errors?.bio && touched?.bio && errors?.bio
              }
              error={!!(touched?.bio && errors?.bio)}
              fullWidth
            />
            <Button
              type='submit'
              color='primary'
              variant='contained'
              disabled={isSubmitting}
              className={classes.button}
              disableElevation
              fullWidth
            >
              Update Profile
            </Button>
          </form>
        }
      </Formik>
    </>
  )
}
