import axios from 'axios';

const axiosInstance = axios.create({
  // 실물 기기: `adb reverse tcp:3030 tcp:3030` 로 localhost 를 맥 서버에 연결.
  // 에뮬레이터로 되돌아갈 땐 android 를 'http://10.0.2.2:3030' 로 변경.
  baseURL: 'http://localhost:3030',
  withCredentials: true,
});

export default axiosInstance;
