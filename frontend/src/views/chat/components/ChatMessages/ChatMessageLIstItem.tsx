/**
 * Author: Chi Zhang
 * Date: 29/10/2021
 *
 * ChatMessageListItm component renders a single chat message
 * item for location, news, etc.
 */
import React from 'react';
import Card from '@mui/material/Card';
import './ChatMessageListItem.css';
import { Typography, useTheme } from '@mui/material';
type ChatMessageListItemProps = {
  primary: string;
  clickable?: boolean;
  onClick?: () => void;
  secondary?: string;
  footer?: string;
  icon?: React.ReactElement;
  variant?: 'severe' | 'info' | 'success';
};
const ChatMessageListItem = (props: ChatMessageListItemProps) => {
  const theme = useTheme();
  const severityColors = {
    severe: theme.palette.error.main,
    info: theme.palette.primary.main,
    success: theme.palette.success.main,
  };
  return (
    <Card
      sx={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch' }}
      className={`CM-list-item ${props.clickable ? 'clickable' : ''}`}
      onClick={props.clickable ? props.onClick : undefined}
      variant="elevation"
    >
      {props.variant && (
        <div
          style={{
            backgroundColor: severityColors[props.variant],
            width: '8px',
          }}
        />
      )}
      <div className="CM-list-item-wrapper">
        {props.icon && <div className="CM-list-item-icon">{props.icon}</div>}
        <div className="CM-list-item-content">
          {props.secondary && (
            <Typography
              className="text-ellipsis"
              variant="caption"
              color="textSecondary"
              component="p"
            >
              {props.secondary}
            </Typography>
          )}
          <Typography variant="h6" component="p" className="text-ellipsis">
            {props.primary}
          </Typography>
          {props.footer && (
            <Typography
              className="CM-list-footer text-ellipsis"
              variant="caption"
              color="textSecondary"
              component="p"
            >
              {props.footer}
            </Typography>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ChatMessageListItem;
