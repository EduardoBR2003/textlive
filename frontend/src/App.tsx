import React, { useEffect, useState, useCallback } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
} from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { SessionPage } from '@/pages/SessionPage';
import { ProtectedSessionPage } from '@/pages/ProtectedSessionPage';
import { SessionLimitPage } from '@/pages/SessionLimitPage';
import { NotFoundOrExpiredPage } from '@/pages/NotFoundOrExpiredPage';
import { LoadingState } from '@/components/LoadingState';
import { sessionApi } from '@/services/sessionApi';

function SessionGuard() {
  const { slug } = useParams<{ slug: string }>();
  const [status, setStatus] = useState<
    'loading' | 'exists' | 'hasPassword' | 'notFound' | 'limitReached'
  >('loading');

  const verifySession = useCallback(async () => {
    if (!slug) {
      setStatus('notFound');
      return;
    }

    const sessionKey = `textlive_auth_${slug}`;
    if (sessionStorage.getItem(sessionKey)) {
      setStatus('exists');
      return;
    }

    try {
      const result = await sessionApi.verifySession(slug);
      if (!result.exists) {
        setStatus('notFound');
      } else if (result.hasPassword) {
        setStatus('hasPassword');
      } else {
        sessionStorage.setItem(sessionKey, 'true');
        setStatus('exists');
      }
    } catch {
      setStatus('notFound');
    }
  }, [slug]);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  if (status === 'loading') return <LoadingState />;
  if (status === 'notFound') return <NotFoundOrExpiredPage />;
  if (status === 'hasPassword') return <ProtectedSessionPage />;
  if (status === 'limitReached') return <SessionLimitPage />;

  return <SessionPage />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/s/:slug" element={<SessionGuard />} />
        <Route path="/expired" element={<NotFoundOrExpiredPage />} />
        <Route path="/limit" element={<SessionLimitPage />} />
        <Route path="*" element={<NotFoundOrExpiredPage />} />
      </Routes>
    </Router>
  );
}
