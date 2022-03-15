/**
 * Author: Chi Zhang
 * Typing info for sharing across multiple files
 */

import { Dayjs } from 'dayjs';

/** Typings for user login request */
export interface UserCredentialPayload {
  username: string;
  password: string;
}

/** Typings for user login reuqest */
export interface LoginResponse {
  token: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  tokenExpiration: number;
  id: string;
  profile: UserProfile | null;
  role: string;
}

/** Typings for user sign up action*/
export interface UserSignUpPayload {
  firstName: string;
  username: string;
  password: string;
  dateOfBirth: Dayjs | null;
  isDoctor: boolean;
  lastName: string;
  gender: string;
}

/** Tpyings for user sign up request */
export interface UserSignUpRequest {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  date_of_birth: string;
  role: 'patient' | 'doctor';
  gender: string;
}

/** Typings for creating user profile action */
export interface UserProfile {
  overweight: number;
  smoking: number;
  highCholesterol: number;
  hypertension: number;
  diabetes: number;
}

/** Typings for plain text message response */
export interface ResponseWithMessage {
  message: string;
}
/** Tpyings for user sign up action */
export interface UserSignUpFormFields extends UserSignUpPayload {
  confirmPassword: string;
}
type ChatData<T> = {
  data: T;
};
/** Base type for chat message response from the server */
type ChatMessageRespType<D = string, E = {}> = {
  type: D;
  message: string;
} & E;

/** extra data for choices **/
export type ChatMessageRespChoices = ChatData<
  {
    value: any;
    text: string;
  }[]
>;

/** tpyings for COVID-19 stats */
type CovidData = ChatData<{
  newCases: number;
  activeCases: number;
}>;

/** Typings for diagnosis session */
type DiagnosisSessionPayload = ChatData<{
  sessionId: string;
}>;

/** Typgins for chat message that comes with choices */
export type ChatMessageRespWithChoices = ChatMessageRespType<
  'choice',
  ChatMessageRespChoices
>;

/** Tpyings for chat message with COVID-19 stats */
export type ChatMessageRespWithCovidData = ChatMessageRespType<
  'covid',
  CovidData
>;

/** Typings for Chat message with diagnosis SessionID */
export type ChatMessageRespStartDiagnosis = ChatMessageRespType<
  'diagnosis/createSession',
  DiagnosisSessionPayload
>;

export type DiagnosisData = {
  name: string;
  commonName: string;
  probability: string;
};

/** Typings for chat message with options for users to pick */
export type DiagnosisResponse = ChatData<DiagnosisData[]>;

/** typings for diagnosis results */
export type ChatMessageRespDiagnosisResult = ChatMessageRespType<
  'diagnosis/result',
  DiagnosisResponse
>;

/** typings for simple text message */
export type PlainTextMessage = ChatMessageRespType<'plain'>;

export type News = {
  title: string;
  source: string;
  datePublished: string;
  link: string;
};

/**
 * Tpyings for chat message that returns news
 */
export type ChatMessageRespWithNews = ChatMessageRespType<
  'news',
  ChatData<News[]>
>;
/**
 * Typings for chat message that contains clinic info
 */
export type ClinicData = {
  name: string;
  suburb: string;
  address: string;
  link: string;
};

/**
 * typeings for chat message with clinic data
 * that has name, suburb, address and links to
 * google maps
 */
export type ChatMessageRespWithClinicData = ChatMessageRespType<
  'clinics',
  ChatData<ClinicData[]>
>;

export type RecipeData = {
  link: string;
  name: string;
  cuisineType: string;
  calories: number;
};

export type ChatMessageWithRecipes = ChatMessageRespType<
  'recipes',
  ChatData<RecipeData[]>
>;

/** typings for hotspots */
export type Hotspot = {
  name: string;
  address: string;
  exposureTime: string;
};

export type ChatMessageWithCovidHotspots = ChatMessageRespType<
  'covid/hotspots',
  ChatData<{
    hotspots: Hotspot[];
    source: {
      name: string;
      url: string;
    };
  }>
>;

/** Typings for travel advice */
export type TravelAdvice = {
  name: string;
  advice: string;
};

export type ChatMessageWithTravelAdvice = ChatMessageRespType<
  'travel_advice',
  ChatData<{
    diseases: TravelAdvice[];
    source: {
      name: string;
      url: string;
    };
  }>
>;

export type VaccineData = {
  vaccineName: string;
  agesRecommended: string;
  primarySeries: string;
  boosterDose: string;
  whenFullyVaccinated: string;
};

export type IsolationTip = {
  text: string;
  link: string;
};

export type ChatMessageWithVaccineData = ChatMessageRespType<
  'vaccine/info',
  ChatData<{
    info: VaccineData[];
    source: {
      name: string;
      url: string;
    };
  }>
>;

export type ChatMessageWithIsolationTips = ChatMessageRespType<
  'vaccine/isolation',
  ChatData<{
    results: IsolationTip[];
    source: {
      name: string;
      url: string;
    };
  }>
>;

export type ChatMessageWithCovidResponse =
  ChatMessageRespType<'covid_checker/result'>;

export type ChatMessageWithCovidChoices = ChatMessageRespType<
  'covid_checker/choice',
  ChatData<{ value: any; text: string }[]>
>;
export type WelcomeChatMessage = ChatMessageRespType<'welcome'>;
export type TicketTextMessage = ChatMessageRespType<
  'ticket_response',
  ChatData<string>
>;
/**
 * Typing that combines all kinds of chat messages
 * together as one Union type
 */
export type ChatMessageResp =
  | ChatMessageRespWithChoices
  | ChatMessageRespWithCovidData
  | PlainTextMessage
  | ChatMessageRespStartDiagnosis
  | ChatMessageRespDiagnosisResult
  | ChatMessageRespWithNews
  | ChatMessageRespWithClinicData
  | ChatMessageWithRecipes
  | ChatMessageWithCovidHotspots
  | ChatMessageWithTravelAdvice
  | ChatMessageWithCovidResponse
  | ChatMessageWithCovidChoices
  | WelcomeChatMessage
  | TicketTextMessage
  | ChatMessageWithVaccineData
  | ChatMessageWithIsolationTips;

/** Typings for messages stored in redux */
export type ChatMessageObject = ChatMessageResp & {
  from: 'user' | 'bot';
  archived?: boolean;
  /**
   * intended to pick msgId
   * as to not confuse with _id in MongoDB when pulling
   * from backend
   */
  msgId: string;
};

export type UserTicketResponse = {
  ticketId: string;
  message: string;
  responded: boolean;
};

export type Ticket = {
  patientId: string;
  userId: string;
  createdAt: string;
  id: string;
  message: string;
};
