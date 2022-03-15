import {
  ChatMessageObject,
  News,
  ClinicData,
  DiagnosisData,
  RecipeData,
  Hotspot,
  TravelAdvice,
  VaccineData,
  IsolationTip,
} from '../../../../typings';
import ChatMessageOptions from './TextMessageOptions';
import ChatMessageBase from './ChatMessageBase';
import React from 'react';
import CovidStats from './CovidStatsMessage';
import ChatMessageListItem from './ChatMessageLIstItem';
import { startCase } from 'lodash';
import { Divider, Typography } from '@mui/material';
import dayjs from 'dayjs';
import WelcomeMessage from './WelcomeMessage';
/**
 * renderNews renders a list of news
 * @param news News: the news to be rendered
 * @param msgId string: the message id
 * @returns React.ReactElement: the news list
 */
const renderNews = (news: News[], id: string) => {
  return news.map((n, i) => {
    return (
      <ChatMessageListItem
        key={`message-${id}-news-${i}`}
        primary={n.title}
        secondary={n.source}
        footer={dayjs(n.datePublished).format('DD-MM-YYYY HH:mm')}
        variant="info"
        clickable
        onClick={() => window.open(n.link)}
      />
    );
  });
};

/**
 * renderClinics renders the information about the clinics
 * @param clinics ClinicData: the clinics to be rendered
 * @param msgId string: the message id
 * @returns React.ReactElement: the clinics list
 */
const renderClinics = (clinics: ClinicData[], msgId: string) => {
  return clinics.map((c, i) => {
    return (
      <ChatMessageListItem
        key={`message-${msgId}-clinic-${i}`}
        primary={c.name}
        secondary={c.address}
        footer={c.suburb}
        variant="info"
        clickable
        onClick={() => window.open(c.link)}
      />
    );
  });
};

/**
 * renderDiagnosisResults renders the diagnosis results
 * @param diagnosis DiagnosisData[]: the diagnosis results
 * @param msgId string: the message id
 */
const renderDiagnosisResults = (diagnosis: DiagnosisData[], msgId: string) => {
  return diagnosis.map((d, i) => {
    return (
      <ChatMessageListItem
        key={`message-${msgId}-diagnosis-${i}`}
        primary={d.commonName}
        footer={d.probability}
        variant="info"
      />
    );
  });
};

/**
 * renderReceipes renders the extra components of receipes messages
 * @param recipes RecipeData[]: the receipes to be rendered
 * @param msgId string: the message id
 * @returns React.ReactElement: the extra components of the message
 */
const renderReceipes = (recipes: RecipeData[], msgId: string) => {
  return recipes.map((r, i) => {
    return (
      <ChatMessageListItem
        key={`message-${msgId}-recipe-${i}`}
        primary={r.name}
        secondary={startCase(r.cuisineType)}
        footer={r.calories.toFixed(2) + ' kJ'}
        variant="info"
        clickable
        onClick={() => window.open(r.link)}
      />
    );
  });
};
/**
 * renderCovid hotspots renders the covid hotspots as a list
 * @param hotspots Hotspot[]: the hotspots to be rendered
 * @param msgId string: the message id
 */
const renderCovidHotspots = (hotspots: Hotspot[], msgId: string) => {
  return hotspots.map((h, i) => {
    return (
      <ChatMessageListItem
        key={`message-${msgId}-hotspot-${i}`}
        primary={h.name}
        secondary={h.exposureTime}
        footer={h.address}
        variant="info"
      />
    );
  });
};

/**
 * renderTravelAdvice renders the travel advice as a list
 * @param advices TravelAdvice[]: the travel advice to be rendered
 * @param msgId string: the message id
 * @returns React.ReactElement: the travel advice list
 */
const renderTravelAdvice = (advices: TravelAdvice[], msgId: string) => {
  return advices.map((a, i) => {
    return (
      <ChatMessageListItem
        key={`message-${msgId}-travel-advice-${i}`}
        primary={a.name}
        footer={a.advice}
        variant="info"
      />
    );
  });
};

const renderVaccines = (vaccines: VaccineData[], msgId: string) => {
  return vaccines.map((v, i) => {
    return (
      <ChatMessageListItem
        key={`message-${msgId}-vaccine-${i}`}
        primary={v.vaccineName}
        secondary={v.primarySeries}
        footer={v.agesRecommended}
        variant="info"
      />
    );
  });
};

const renderIsolationTips = (tips: IsolationTip[], msgId: string) => {
  return tips.map((t, i) => {
    return (
      <ChatMessageListItem
        key={`message-${msgId}-isolation-tip-${i}`}
        primary={t.text}
        clickable
        variant="info"
        onClick={() => window.open(t.link)}
      />
    );
  });
};
/**
 * renderMessage renders the extra components of text messages
 * @param msg ChatMessageObject: the message to be rendered
 * @param i number: the index of the message
 * @returns React.ReactElement: the extra components of the message
 */
const renderExtras = (i: number, msg: ChatMessageObject) => {
  switch (msg.type) {
    case 'choice':
      return msg.archived ? null : (
        <ChatMessageOptions msgId={msg.msgId} options={msg.data} />
      );
    case 'covid_checker/choice':
      return msg.archived ? null : (
        <ChatMessageOptions msgId={msg.msgId} options={msg.data} />
      );
    case 'covid':
      return (
        <CovidStats
          newCases={msg.data.newCases}
          activeCases={msg.data.activeCases}
        />
      );
    case 'news':
      return renderNews(msg.data, msg.msgId);
    case 'clinics':
      return renderClinics(msg.data, msg.msgId);
    case 'diagnosis/result':
      return renderDiagnosisResults(msg.data, msg.msgId);
    case 'recipes':
      return renderReceipes(msg.data, msg.msgId);
    case 'covid/hotspots':
      return (
        <>
          {renderCovidHotspots(msg.data.hotspots, msg.msgId)}
          <Typography
            variant="caption"
            sx={{ paddingLeft: '8px' }}
            color="InfoText"
          >
            source: <a href={msg.data.source.url}>{msg.data.source.name}</a>
          </Typography>
        </>
      );
    case 'travel_advice':
      return (
        <>
          {renderTravelAdvice(msg.data.diseases, msg.msgId)}
          <Typography
            variant="caption"
            sx={{ paddingLeft: '8px' }}
            color="InfoText"
          >
            source: <a href={msg.data.source.url}>{msg.data.source.name}</a>
          </Typography>
        </>
      );
    case 'vaccine/info':
      return (
        <>
          {renderVaccines(msg.data.info, msg.msgId)}
          <Typography
            variant="caption"
            sx={{ paddingLeft: '8px' }}
            color="InfoText"
          >
            source: <a href={msg.data.source.url}>{msg.data.source.name}</a>
          </Typography>
        </>
      );
    case 'vaccine/isolation':
      return (
        <>
          {renderIsolationTips(msg.data.results, msg.msgId)}
          <Typography
            variant="caption"
            sx={{ paddingLeft: '8px' }}
            color="InfoText"
          >
            source: <a href={msg.data.source.url}>{msg.data.source.name}</a>
          </Typography>
        </>
      );
    case 'welcome':
      return <WelcomeMessage />;
    case 'ticket_response':
      return (
        <>
          <Divider />
          <Typography variant="body1" sx={{ margin: '8px' }}>
            {msg.data}
          </Typography>
        </>
      );
    default:
      return null;
  }
};

/**
 * the helper function that renders chat message component based on message types
 * @param i number: item index
 * @param msg ChatMessageObject: the ChatMessage itself
 * @returns React.ReactElement: the rendered component
 */
export const renderMessage = (i: number, msg: ChatMessageObject) => {
  return (
    <ChatMessageBase
      index={i}
      fromUser={msg.from == 'user'}
      extras={renderExtras(i, msg)}
    >
      {msg.message}
    </ChatMessageBase>
  );
};
