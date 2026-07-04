import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App'
import { queryClient } from './lib/queryClient'
import ChunkLoadBoundary from './components/ChunkLoadBoundary'
import { installChunkLoadRecovery } from './utils/chunkLoadRecovery'
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

console.log('Application Started');

if (!googleClientId) {
  throw new Error('VITE_GOOGLE_CLIENT_ID is required to enable Google Sign-In');
}

installChunkLoadRecovery();

createRoot(rootElement).render(
  <GoogleOAuthProvider clientId={googleClientId}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ChunkLoadBoundary>
          <App />
        </ChunkLoadBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  </GoogleOAuthProvider>,
)
