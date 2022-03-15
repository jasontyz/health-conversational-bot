import React from 'react';
import { Virtuoso, Components } from 'react-virtuoso';
import { ChatMessageObject } from '../../../typings';
import { ChatListItem } from '../../components/ChatListItem';
import { renderMessage } from '../../chat/components/ChatMessages/renderMessage';
type ChatHistoryListViewProps = {
  history: ChatMessageObject[];
};

const ChatHistoryListView = (props: ChatHistoryListViewProps) => {
  const components = React.useMemo<Components>(() => {
    return {
      Item: ChatListItem,
    };
  }, []);
  return (
    <Virtuoso
      style={{ height: 'unset' }}
      components={components}
      className="chat-history-content"
      data={props.history}
      itemContent={renderMessage}
    />
  );
};

export default ChatHistoryListView;
