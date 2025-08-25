// 🔄 Hook for managing post counts
// Separate from main posts hook to avoid incorrect counts

'use client';

import { useState, useEffect } from 'react';
import { getPostsCount, getMyPostsCount } from '@/lib/db';

export function usePostCounts() {
  const [allPostsCount, setAllPostsCount] = useState(0);
  const [myPostsCount, setMyPostsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCounts = async () => {
    try {
      setLoading(true);
      const [totalCount, userCount] = await Promise.all([
        getPostsCount(),
        getMyPostsCount(),
      ]);

      setAllPostsCount(totalCount);
      setMyPostsCount(userCount);
    } catch (error) {
      console.error('Error fetching post counts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  const refetchCounts = () => {
    fetchCounts();
  };

  return {
    allPostsCount,
    myPostsCount,
    loading,
    refetch: refetchCounts,
  };
}
