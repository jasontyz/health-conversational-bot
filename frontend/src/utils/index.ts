/** @format */

import { camelCase, isArray, isObject, snakeCase, toPairs } from 'lodash';
/** Regex for validate email */
export const EMAIL_REGEX =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

/**
 * Regex for validate passwords, following the rules
 *  - At least 8 chars
 *  - At least 1 upper case letter
 *  - At least 1 lower case letter
 *  - At least 1 digit
 */
export const PASSWORD_REGEX = /^(?=.*[A-Z]+)(?=.*[a-z])(?=.\d*).{8,}$/g;

/**
 * Convert object keys from camel case to snake cases
 * e.g. objectKeys2SnakeCase({ dummyKey: 1 }) => { dummy_key: 1 }
 */
export const objectKeys2SnakeCase = (obj: Object): any => {
  if (!isArray(obj) && !isObject(obj)) {
    return obj;
  } else if (isArray(obj)) {
    return obj.map((v) => objectKeys2SnakeCase(v));
  }

  const res: any = {};
  for (const [key, value] of toPairs(obj)) {
    res[snakeCase(key)] = objectKeys2SnakeCase(value);
  }
  return res;
};

/**
 * Convert object keys from snake case to camel case
 * e.g. objectKeys2CamelCase({ dummy_key: 1 }) => { dummyKey: 1 }
 */
export const objectKeys2CamelCase = (obj: Object): any => {
  if (!isArray(obj) && !isObject(obj)) {
    return obj;
  } else if (isArray(obj)) {
    return obj.map((v) => objectKeys2CamelCase(v));
  }
  let res: any = {};
  for (const [key, value] of toPairs(obj)) {
    res[camelCase(key)] = objectKeys2CamelCase(value);
  }
  return res;
};

/**
 * Extract status and error message from an AxiosError instance
 */
export const getErrorPayload = (error: any) => {
  console.log('in getErrorPayload', error);
  return {
    status: error.response.status,
    message: error.response.data.message,
  };
};

/**
 * getUserCovidFeatures generates the ageAbove60 and isMale
 * based on the user's date of birth and gernder provided
 * @param dob - user's date of birth
 * @param gender - user's gender
 */
export const getUserCovidFeatures = (dob: string, gender: string) => {
  const age = new Date().getFullYear() - new Date(dob).getFullYear();
  const isMale = gender === 'male' ? '1' : '0';
  const ageAbove60 = age > 60 ? '1' : '0';
  return { isMale, ageAbove60 };
};
