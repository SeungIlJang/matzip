import axios from 'axios';

const axiosInstance = axios.create({
  // 개발용 Mac 서버의 Tailscale 주소. 휴대폰과 Mac 모두 Tailscale이 연결되어 있어야 한다.
  // 출시 전에는 운영 HTTPS API 주소로 교체한다.
  baseURL: 'http://100.76.54.2:3030',
  withCredentials: true,
});

export default axiosInstance;
