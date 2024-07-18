import { TextEncoder, TextDecoder } from 'text-encoding';
import axios from 'axios';

export const stringToBytes = (str: string): number[] => {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  return Array.from(bytes);
};

export const bytesToString = (bytes: number[]): string => {
  const decoder = new TextDecoder('utf-8');
  const uint8Array = new Uint8Array(bytes);
  return decoder.decode(uint8Array);
};

// 将UTC时间转换为北京时间
export const convertUTCToBeijingTime = (utcString: string) => {
  const date = new Date(utcString);
  const beijingTime = new Date(date.getTime());
  return beijingTime.toLocaleString();
};

const BASE_URL = 'https://cara.zeabur.app';

const REGISTER = '/api/register';

const LOGIN = '/api/login';

const LOGOUT = '/api/logout';

const MESSAGES = '/api/messages';

const ANSWER_QUESTION = '/api/answer_question';

const USER_INFO = '/api/get_info';

const CARA_INFO = '/api/get_cara_info';


export const register = async (username: string, email: string, password: string) => {
  const body = {
    username: username,
    email: email,
    password: password
  };
  const response = await axios.post(
    BASE_URL + REGISTER,
    body,
    { headers: { 'Content-Type': 'application/json' } }
  );
  return response.data;
}

export const login = async (email: string, password: string) => {
  // 以JSON格式发送数据
  const body = {
    email: email,
    password: password
  };
  const response = await axios.post(
    BASE_URL + LOGIN,
    body,
    { headers: { 'Content-Type': 'application/json' } }
  );
  return response.data;
}

export const logout = async () => {
  return (await axios.post(BASE_URL + LOGOUT)).data;
}

export const sendMessages = async (message: string) => {
  const body = {
    content: message
  };
  const question = {
    question: message
  }
  const response = await axios.post(
    BASE_URL + MESSAGES,
    body,
    { headers: { 'Content-Type': 'application/json' } }
  );
  await axios.post(
    BASE_URL + ANSWER_QUESTION,
    question,
    { headers: { 'Content-Type': 'application/json' } }
  );
  return response.data;
}

export const getMessages = async () => {
  return await (await axios.get(BASE_URL + MESSAGES)).data;
}

export const getUserInfo = async () => {
  return await (await axios.get(BASE_URL + USER_INFO)).data;
}

export const getCaraInfo = async () => {
  return await (await axios.get(BASE_URL + CARA_INFO)).data;
}