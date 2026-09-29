import { useEffect, useState } from 'react';
import Layout from './components/Layout.jsx';
import PlaceholderPage from './components/PlaceholderPage.jsx';
import { pages } from './pages.js';

function getPageId() {
  const hash = window.location.hash;
  // Preserve the current page when using the keyboard skip link.
  return hash === '#main-content' ? null : (hash.replace(/^#\/?/, '') || 'dashboard');
}

export default function App() {
  const [pageId, setPageId] = useState(() => getPageId() ?? 'dashboard');
  useEffect(() => {
    const onHashChange = () => { const id = getPageId(); if (id !== null) setPageId(id); };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  const page = pages.find((item) => item.id === pageId);
  useEffect(() => { document.title = `${page?.label ?? 'Page not found'} | Elastic Fulfillment`; }, [page]);

  return <Layout pages={pages} currentPage={page}>{page ? <PlaceholderPage page={page} /> : <section className="page-heading"><h1>Page not found</h1><p>Choose a workspace from the navigation.</p><a href="#/dashboard">Return to Dashboard</a></section>}</Layout>;
}
