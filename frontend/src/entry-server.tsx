import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { AppContent } from './App';

export function render(url: string) {
  const html = ReactDOMServer.renderToString(
    <LanguageProvider>
      <AuthProvider>
        <StaticRouter location={url}>
          <AppContent />
        </StaticRouter>
      </AuthProvider>
    </LanguageProvider>
  );

  return { html };
}
