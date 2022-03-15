import React, { PropsWithChildren } from 'react';
import { ItemProps } from 'react-virtuoso';

/**
 * ChatListItem is the container for the content
 * of each list item
 */
export const ChatListItem = ({ children, ...props }: PropsWithChildren<ItemProps>) => {
  return (
    <div {...props} className="chat-history-item">
      {children}
    </div>
  );
};