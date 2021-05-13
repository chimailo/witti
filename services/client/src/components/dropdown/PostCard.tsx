import React, { useState } from 'react';
import { useQueryClient } from 'react-query';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import FlagOutlinedIcon from '@material-ui/icons/FlagOutlined';
import PersonAddOutlinedIcon from '@material-ui/icons/PersonAddOutlined';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import DeleteModal from '../modals/DeletePost';
import { User, Post } from '../../types';
import { KEYS } from '../../lib/constants';
import { useFollowUser } from '../../lib/hooks/user';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    menuPaper: {
      minWidth: '220px',
      padding: theme.spacing(1),
    },
    menuDivider: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    menuItem: {
      minHeight: '32px',
    },
    menuProfile: {
      textAlign: 'center',
      lineHeight: 1.2,
      color: theme.palette.text.secondary,
    },
    link: {
      display: 'flex',
      width: '100%',
      justifyContent: 'center',
      alignContent: 'center',
    },
    listItemIcon: {
      color: 'inherit',
      minWidth: 0,
      alignItems: 'center',
      marginRight: theme.spacing(2),
    },
  })
);

type MenuProps = {
  post: Post;
  page?: number;
  cacheKey: string;
  anchorEl: null | HTMLElement;
  closeMenu: () => void;
  deletePost: () => void;
};

export default function PostCardMenu(props: MenuProps) {
  const [isDeleteModalOpen, setDeleteModal] = useState(false);

  const classes = useStyles();
  const follow = useFollowUser();
  const queryClient = useQueryClient();
  const auth = queryClient.getQueryData<User>(KEYS.AUTH);

  const { anchorEl, page, cacheKey, post, closeMenu, deletePost } = props;

  const openDeleteModal = () => {
    closeMenu();
    setDeleteModal(true);
  };

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
        {post.author.id !== auth?.id && (
          <MenuItem
            onClick={() => {
              closeMenu();
              follow.mutate({
                post_id: post.id,
                user_id: post.author.id,
                pageIndex: page,
                follow: post.author.isFollowing,
                key: cacheKey,
              });
            }}
            classes={{ root: classes.menuItem }}
          >
            <ListItemIcon className={classes.listItemIcon}>
              <PersonAddOutlinedIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText
              primary={`${post.author.isFollowing ? 'unfollow' : 'follow'} @${
                post.author.username
              }`}
              primaryTypographyProps={{ variant: 'subtitle2' }}
            />
          </MenuItem>
        )}
        {post.author.id === auth?.id && (
          <MenuItem
            onClick={openDeleteModal}
            classes={{ root: classes.menuItem }}
          >
            <ListItemIcon className={classes.listItemIcon}>
              <DeleteOutlinedIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText
              primary='Delete Post'
              primaryTypographyProps={{ variant: 'subtitle2' }}
            />
          </MenuItem>
        )}
        {post.author.id !== auth?.id && (
          <MenuItem onClick={closeMenu} classes={{ root: classes.menuItem }}>
            <ListItemIcon className={classes.listItemIcon}>
              <FlagOutlinedIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText
              primary='Report Post'
              primaryTypographyProps={{ variant: 'subtitle2' }}
            />
          </MenuItem>
        )}
      </Menu>
      <DeleteModal
        isOpen={isDeleteModalOpen}
        handleClose={() => setDeleteModal(false)}
        deletePost={deletePost}
      />
    </>
  );
}
