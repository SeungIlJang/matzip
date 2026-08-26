import {useCallback, useEffect, useState} from 'react';

import {getEncryptStorage, setEncryptStorage} from '@/utils';

const KEY = 'recentSearches';
const MAX = 8;

/** 최근 검색어를 EncryptedStorage 에 저장/관리 */
function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    getEncryptStorage(KEY).then(data => {
      if (Array.isArray(data)) {
        setRecent(data);
      }
    });
  }, []);

  const addRecent = useCallback((query: string) => {
    const q = query.trim();
    if (!q) {
      return;
    }
    setRecent(prev => {
      const next = [q, ...prev.filter(item => item !== q)].slice(0, MAX);
      setEncryptStorage(KEY, next);
      return next;
    });
  }, []);

  const removeRecent = useCallback((query: string) => {
    setRecent(prev => {
      const next = prev.filter(item => item !== query);
      setEncryptStorage(KEY, next);
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);
    setEncryptStorage(KEY, []);
  }, []);

  return {recent, addRecent, removeRecent, clearRecent};
}

export default useRecentSearches;
