import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'katex/dist/katex.min.css';
import './styles/global.css';
import './i18n/config';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container #root was not found');
}

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
