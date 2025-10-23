import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import './index.css'
import App from './App.tsx'

// Note: Liveblocks configuration is now handled in src/liveblocks.config.ts
// The API key is set there directly. For production, you should use environment variables.

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Force light design system by using the default light system */}
    <ChakraProvider value={defaultSystem}>
      <App />
    </ChakraProvider>
  </StrictMode>,
)
