import { useSnackbar } from 'notistack';
import React from 'react';
import { useAppDispatch } from '../../store';
import { setUserLocation } from '../../store/userSlice';
import './Chat.css';
import { ChatHistory } from './components';
import { QuickActionBar } from './components';
import { ChatTextInput } from './components';
/**
 * home page (chat) root component
 */
export const Chat = () => {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  React.useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            dispatch(
              setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              }),
            );
          },
          (error) => {
            console.log(error);
            enqueueSnackbar(error.message, { variant: 'error' });
          },
          { enableHighAccuracy: true, maximumAge: 1000 },
        );
      }
    };

    getUserLocation();
  }, []);
  return (
    <div className="chat-container">
      <div className="chat-history">
        <ChatHistory />
      </div>
      <div className="chat-input-bar">
        <QuickActionBar />
        <ChatTextInput />
      </div>
    </div>
  );
};

export default Chat;
