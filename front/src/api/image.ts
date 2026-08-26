import axiosInstance from './axios';

/** 이미지 여러 장 업로드 → 서버가 저장한 파일명 배열 반환 */
const uploadImages = async (body: FormData): Promise<string[]> => {
  const {data} = await axiosInstance.post('/images', body, {
    headers: {'Content-Type': 'multipart/form-data'},
  });

  return data;
};

/** 서버 파일명을 표시용 전체 URL로 변환. 이미 로컬/원격 경로면 그대로 반환. */
const getImageUri = (filename: string): string => {
  if (/^(https?:|file:|content:|\/)/.test(filename)) {
    return filename;
  }
  const base = axiosInstance.defaults.baseURL ?? '';
  return `${base}/${filename}`;
};

export {uploadImages, getImageUri};
