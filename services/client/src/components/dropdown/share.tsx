import React from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { FacebookIcon, FacebookShareButton, TwitterIcon, TwitterShareButton, WhatsappIcon, WhatsappShareButton } from 'react-share';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    menuPaper: {
      borderRadius: theme.spacing(4),
    },
    menuList: {
      display: 'flex',
      alignItems: 'center',
      paddingLeft: theme.spacing(0),
      paddingRight: theme.spacing(0),
    },
    gutters: {
      marginLeft: theme.spacing(0),
      marginRight: theme.spacing(0),
    },
    listItemIcon: {
      minWidth: 32,
    }
  })
);

type MenuProps = {
  url: string
  tags: any[]
  anchorEl: null | HTMLElement;
  closeMenu: () => void;
};

export default function ShareMenu(props: MenuProps) {
  const classes = useStyles();
  const { url, tags, anchorEl, closeMenu } = props;


  return (
    <>
      <Menu
        keepMounted
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        classes={{
          paper: classes.menuPaper,
          list: classes.menuList,
        }}
      >
        <MenuItem onClick={() => closeMenu()}
          classes={{ gutters: classes.gutters }}>
          <ListItemIcon classes={{root: classes.listItemIcon}}>
            <TwitterShareButton url={url} hashtags={tags} style={{height: 32,}}>
              <TwitterIcon size={32} round={true} />
            </TwitterShareButton>
          </ListItemIcon>
        </MenuItem>
        <MenuItem onClick={() => closeMenu()}
          classes={{ gutters: classes.gutters }}>
          <ListItemIcon classes={{root: classes.listItemIcon}}>
            <FacebookShareButton url={url} style={{height: 32,}}>
              <FacebookIcon size={32} round={true} />
            </FacebookShareButton>
          </ListItemIcon>
        </MenuItem>
        <MenuItem onClick={() => closeMenu()}
          classes={{ gutters: classes.gutters }}>
          <ListItemIcon classes={{root: classes.listItemIcon}}>
            <WhatsappShareButton url={url} style={{height: 32,}}>
              <WhatsappIcon size={32} round={true} />
            </WhatsappShareButton>
          </ListItemIcon>
        </MenuItem>
      </Menu>
    </>
  );
}
