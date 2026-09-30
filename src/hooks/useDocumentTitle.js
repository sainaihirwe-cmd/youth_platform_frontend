import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | JobConnect Rwanda` : 'JobConnect Rwanda';
  }, [title]);
}
