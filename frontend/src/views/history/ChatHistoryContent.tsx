import React from 'react';
import { useAppSelector } from '../../store';
import { ChatMessageObject } from '../../typings';
import { fetchHistory } from '../../api';
import './ChatHistoryContent.css';
import './components/ChatHistoryPager.css';
import ChatHistoryListView from './components/ChatHistoryListView';
import { CircularProgress, Pagination } from '@mui/material';

const ChatHistoryContent = () => {
  const user = useAppSelector((state) => state.user);
  const [pageIndex, setPageIndex] = React.useState(1);
  const PAGE_SIZE = 15;
  const [history, setHistory] = React.useState<ChatMessageObject[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const doFetchHistory = (index: number) => {
    const i = index - 1;
    setLoading(true);
    fetchHistory(user.id, user.token, PAGE_SIZE, i)
      .then((res) => {
        setHistory(res.data.history);
        setTotal(res.data.total);
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  };
  React.useEffect(() => {
    doFetchHistory(pageIndex);
  }, []);

  const onPageChange = (index: number) => {
    setPageIndex(index);
    doFetchHistory(index);
  };
  return (
    <div className="chat-container">
      {loading ? (
        <div className="chat-history-loading">
          <CircularProgress />
        </div>
      ) : (
        <>
          <div className="chat-history">
            <ChatHistoryListView history={history} />
          </div>
          <div className="chat-input-bar chat-history-list-view">
            <Pagination
              page={pageIndex}
              onChange={(_, i) => onPageChange(i)}
              count={Math.ceil(total / PAGE_SIZE)}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ChatHistoryContent;
