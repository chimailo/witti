import axios from 'axios';

export function setAxiosDefaultParams() {
  (function () {
    axios.defaults.baseURL = process.env.REACT_APP_API_URL;
    axios.defaults.headers.post['Content-Type'] = 'application/json';
  })();
}

export function setAuthToken(token: string) {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}
