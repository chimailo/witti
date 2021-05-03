import React from 'react';
import { useQueryClient } from 'react-query';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DeleteForeverOutlinedIcon from '@material-ui/icons/DeleteForeverOutlined';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import FlagOutlinedIcon from '@material-ui/icons/FlagOutlined';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { User } from '../../types';
import { KEYS } from '../../lib/constants';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    menuPaper: {
      minWidth: '220px',
      padding: theme.spacing(1),
    },
    menuItem: {
      minHeight: '32px',
    },
    listItemIcon: {
      color: 'inherit',
      minWidth: 0,
      alignItems: 'center',
      marginRight: theme.spacing(2),
    },
  })
);

type DeleteMessageProps = {
  authorId?: number;
  anchorEl: null | HTMLElement;
  closeMenu: () => void;
  deleteMessage: () => void;
  deleteMessageForUser: () => void;
};

export default function DeleteMessage(props: DeleteMessageProps) {
  const classes = useStyles();
  const queryClient = useQueryClient();
  const auth = queryClient.getQueryData<User>(KEYS.AUTH);

  const {
    anchorEl,
    authorId,
    closeMenu,
    deleteMessage,
    deleteMessageForUser,
  } = props;

  return (
    <>
      <Menu
        keepMounted
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        getContentAnchorEl={null}
        classes={{ paper: classes.menuPaper }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem
          onClick={() => {
            closeMenu();
            deleteMessageForUser();
          }}
          classes={{ root: classes.menuItem }}
        >
          <ListItemIcon className={classes.listItemIcon}>
            <DeleteOutlinedIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText
            primary='Delete message for me'
            primaryTypographyProps={{ variant: 'subtitle2' }}
          />
        </MenuItem>
        {authorId === auth?.id && (
          <MenuItem
            onClick={() => {
              closeMenu();
              deleteMessage();
            }}
            classes={{ root: classes.menuItem }}
          >
            <ListItemIcon className={classes.listItemIcon}>
              <DeleteForeverOutlinedIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText
              primary='Delete message for everyone'
              primaryTypographyProps={{ variant: 'subtitle2' }}
            />
          </MenuItem>
        )}
        {authorId !== auth?.id && (
          <MenuItem
            disabled
            onClick={() => {
              closeMenu();
            }}
            classes={{ root: classes.menuItem }}
          >
            <ListItemIcon className={classes.listItemIcon}>
              <FlagOutlinedIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText
              primary='Report this message'
              primaryTypographyProps={{ variant: 'subtitle2' }}
            />
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
