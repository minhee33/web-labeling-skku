import { Cookies } from 'react-cookie';

//typescript 문법
const cookies = new Cookies();

export const setCookie = (name: string, value: String, option?: any) => {
    return cookies.set(name, value, { ...option });
}

export const getCookie = (name: string) => {
    return cookies.get(name);
}