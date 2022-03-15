/**
 * Author: Chi Zhang
 * App bar components for rendering buttons
 */
import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useHistory } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import './AppBar.css';
import { useAppDispatch, useAppSelector } from '../../../store';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import ListIcon from '@mui/icons-material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { userLogout } from '../../../store/userSlice';
import HistoryIcon from '@mui/icons-material/History';
import AddIcon from '@mui/icons-material/Add';
import { useSnackbar } from 'notistack';

/** The button bar component to be rendered without login */
const ButtonsDefault = () => {
  const history = useHistory();
  return (
    <>
      <Button variant="text" onClick={() => history.push('/login')}>
        <Typography variant="button" className="appbar-button-text">
          LOGIN
        </Typography>
      </Button>
      <Button variant="text" onClick={() => history.push('/register')}>
        <Typography
          color="white"
          variant="button"
          className="appbar-button-text"
        >
          REGSITER
        </Typography>
      </Button>
    </>
  );
};

/** The button bar to be rendered when the user dident log in */
const ButtonsLoggedIn = () => {
  /**
   * Logics for different buttons
   */
  const user = useAppSelector((state) => state.user);
  const isDoctor = user.role === 'doctor';
  const history = useHistory();
  const dispatch = useAppDispatch();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  /**
   * logic for menu button, when the user clicks the button
   * the pop up menu will show up
   */
  const onButtonClick = (ev: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(ev.currentTarget);
  };
  const { enqueueSnackbar } = useSnackbar();

  /**
   * When the user logs out
   * send logout request through redux and
   * clears all the history and session information
   * Once done a notification will be sent
   */
  const onLogoutClick = () => {
    setAnchorEl(null);
    dispatch(userLogout())
      .unwrap()
      .then(() => {
        enqueueSnackbar('Successfully signed out', { variant: 'success' });
      });
  };
  const opened = !!anchorEl;

  /**
   * when the user clicks the history
   * the history will be redirected to the history page
   */
  const onHistoryClick = () => {
    setAnchorEl(null);
    history.push('/history');
  };

  // The component itself
  return (
    <div>
      <Typography
        variant="body1"
        component="span"
        aria-controls="user-menu"
        aria-haspopup="true"
        aria-expanded={opened ? 'true' : undefined}
        sx={{ marginRight: (theme) => theme.spacing(1) }}
      >
        Hi, {user.firstName}
      </Typography>
      <Button aria-label="settings-button" onClick={onButtonClick}>
        <SettingsIcon className="appbar-settings-icon" />
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={opened}
        onClose={() => setAnchorEl(null)}
        id="user-menu"
      >
        <MenuItem onClick={() => history.push('/profile')}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        {isDoctor ? (
          <MenuItem onClick={() => history.push('/tickets')}>
            <ListItemIcon>
              <ListIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Tickets</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={() => history.push('/new_request')}>
            <ListItemIcon>
              <AddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>New Request</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={onHistoryClick}>
          <ListItemIcon>
            <HistoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>History</ListItemText>
        </MenuItem>
        <MenuItem onClick={onLogoutClick}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sign out</ListItemText>
        </MenuItem>
      </Menu>
    </div>
  );
};

const ButtonBar = () => {
  const loggedIn = useAppSelector((state) => !!state.user.token);

  return loggedIn ? <ButtonsLoggedIn /> : <ButtonsDefault />;
};

export default ButtonBar;
