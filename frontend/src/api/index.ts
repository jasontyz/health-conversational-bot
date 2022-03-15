/** @format */

/**
 *  Author Chi Zhang z5211214
 *  Initializes Axios as api client for later uses
 */

import axios from 'axios';
import { ChatMessageObject } from '../typings';
import { getErrorPayload, objectKeys2CamelCase } from '../utils';
const BASE_URL = 'http://localhost:5000';
const client = axios.create({
  baseURL: BASE_URL,
  timeout: 8 * 1000,
});

client.interceptors.request.use(
  (conf) => conf,
  (error) => {
    console.log(error);
    return Promise.reject(error);
  },
);

client.interceptors.response.use(
  function (resp) {
    resp.data = objectKeys2CamelCase(resp.data);
    return resp;
  },
  function (error) {
    console.log(error);
    if (!error.response) {
      return Promise.reject({ status: -1, message: error.message });
    } else {
      return Promise.reject(getErrorPayload(error));
    }
  },
);
type ChatHistoryResp = {
  total: number;
  history: ChatMessageObject[];
};
export const fetchHistory = async (
  userId: string,
  token: string,
  pageSize: number,
  pageIndex: number,
) => {
  return client.get<ChatHistoryResp>(`/users/${userId}/history`, {
    params: {
      page_size: pageSize,
      page_index: pageIndex,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export default client;
