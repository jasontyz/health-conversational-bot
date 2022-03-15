import React from 'react';
import ChatMessageListItem from './ChatMessageLIstItem';
const WelcomeMessage = () => {
  return (
    <div>
      <ChatMessageListItem
        primary="Symptom Checker"
        footer={'e.g. "Can I have a symptom check?"'}
        variant="info"
      />
      <ChatMessageListItem
        primary="COVID-19 Symptom Checker"
        footer={'e.g. "I want to have a covid-19 symptom check?"'}
        variant="info"
      />
      <ChatMessageListItem
        primary="Recipe Suggestions"
        footer={'e.g. "Can you give me some recipes?"'}
        variant="info"
      />
      <ChatMessageListItem
        primary="Check up COVID-19 Hotspots"
        footer={'e.g. "What are the covid-19 hotspots in NSW?"'}
        variant="info"
      />
      <ChatMessageListItem
        primary="COVID-19 Cases"
        footer={'e.g. "How many covid-19 cases are there in NSW?"'}
        variant="info"
      />
      <ChatMessageListItem
        primary="Travel Suggestions"
        footer={'e.g. "What are the common diseases in Italy"'}
        variant="info"
      />
      <ChatMessageListItem
        primary="Trending News"
        footer={'e.g. "Can you show me some news on Health?"'}
        variant="info"
      />
    </div>
  );
};

export default WelcomeMessage;
