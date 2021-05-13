import axios from 'axios';
import * as Yup from 'yup';

export const validateName = () =>
  Yup.string()
    .max(32, 'Must be 32 characters or less')
    .min(2, 'Must be at least 2 characters')
    .required('Required');

export const validateUsername = () =>
  Yup.string()
    .max(32, 'Must be 32 characters or less')
    .min(3, 'Must be 3 characters or more')
    .matches(/^[a-zA-Z0-9_]*$/, {
      message: 'Must contain only valid characters (a-z, A-Z, 0-9, and _)',
      excludeEmptyString: true,
    })
    .required('Username is required')
    .test({
      name: 'uniqueUsername',
      exclusive: true,
      message: 'A user with that username already exists',
      test: async (value) => {
        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}/profile/check-username`,
          { username: value }
        );
        return res.data.res;
      },
    });

export const validateBio = (len: number) =>
  Yup.string().max(len, `Must be ${len} characters or less.`).nullable();

export const validateEmail = () =>
  Yup.string()
    .email('Invalid email address')
    .required('Email is required')
    .test({
      name: 'uniqueEmail',
      exclusive: true,
      message: 'A user with that email already exists',
      test: async (value) => {
        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}/users/check-email`,
          { email: value }
        );
        return res.data.res;
      },
    });

export const validatePassword = () =>
  Yup.string()
    .min(8, 'Must be 8 characters or more')
    .required('Password is Required');

export const validatePasswordConfirm = () =>
  Yup.string()
    .required('You need to confirm your password')
    .nullable()
    .oneOf([Yup.ref('password'), null], 'Both password fields must match');

export const validateTag = () =>
  Yup.string()
    .max(32, 'Must be 32 characters or less')
    .min(2, 'Must be at least 2 characters')
    .matches(/^[a-zA-Z0-9_]*$/, {
      message: 'Must contain only valid characters (a-z, A-Z, 0-9)',
      excludeEmptyString: true,
    })
    .test({
      name: 'uniqueTag',
      exclusive: true,
      message: 'That tag already exists',
      test: async (value) => {
        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}/tags/check`,
          { tag: value }
        );
        return res.data.res;
      },
    });
