import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout.js';
import { HomePage } from './pages/HomePage.js';
import { ShowPage } from './pages/ShowPage.js';
import { AdminShowsPage } from './pages/admin/AdminShowsPage.js';
import { AdminShowEditPage } from './pages/admin/AdminShowEditPage.js';
import { AdminEpisodesPage } from './pages/admin/AdminEpisodesPage.js';
import { AdminEpisodeEditPage } from './pages/admin/AdminEpisodeEditPage.js';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage.js';

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Listener pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/shows/:id" element={<ShowPage />} />

        {/* Admin pages */}
        <Route path="/admin" element={<AdminShowsPage />} />
        <Route path="/admin/shows/:id" element={<AdminShowEditPage />} />
        <Route path="/admin/shows/:showId/episodes" element={<AdminEpisodesPage />} />
        <Route path="/admin/shows/:showId/episodes/:episodeId" element={<AdminEpisodeEditPage />} />
        <Route path="/admin/shows/:showId/analytics" element={<AdminAnalyticsPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
