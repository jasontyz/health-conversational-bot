import { Components, Virtuoso } from 'react-virtuoso';
import React, { useMemo } from 'react';
import './ChatHistory.css';
import { renderMessage } from './ChatMessages/renderMessage';
import { useChatHistory } from './useChatHistory';
import { ChatListItem } from '../../components/ChatListItem';

/** the component that renders chat messages as a list */
const ChatHistory = () => {
  const { chatHistories, virtuoso, atBottomHandler } = useChatHistory();
  const components = useMemo<Components>(() => {
    return {
      Item: ChatListItem,
    };
  }, []);
  return (
    <Virtuoso
      components={components}
      style={{ height: 'unset' }} // Override the package defualt height 100%
      className="chat-history-content"
      ref={virtuoso}
      data={chatHistories}
      itemContent={renderMessage}
      followOutput="smooth"
      atBottomStateChange={atBottomHandler}
    />
  );
};
export default ChatHistory;
