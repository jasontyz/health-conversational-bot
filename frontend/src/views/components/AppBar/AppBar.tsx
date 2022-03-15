/**
 * Author: Chi Zhang (z5211214)
 */

import AppBar from '@mui/material/AppBar';
import ToolBar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React from 'react';
import ButtonBar from './ButtonBar';
/** component for the top bar */ 
const ChatBotAppBar = () => {
  return (
    <div className="appbar-container">
      <AppBar position="static">
        <ToolBar>
          <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
            Chatty
          </Typography>
          <ButtonBar />
        </ToolBar>
      </AppBar>
    </div>
  );
};
export default ChatBotAppBar;
