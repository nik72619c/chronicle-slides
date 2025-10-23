/**
 * App Component
 * 
 * Main application entry point. Sets up the Liveblocks room with initial storage
 * and renders the slide editor interface. Generates random user identity for each session.
 */

import { Suspense, useMemo } from 'react'
import { Flex, Text, Spinner, Center } from '@chakra-ui/react'
import { RoomProvider } from './liveblocks.config'
import { RoomContent } from './components/RoomContent'
import { YjsProvider } from './lib/yjsProvider'
import { generateRandomName, getUserColor } from './lib/userUtils'

/**
 * Root application component
 * Configures Liveblocks room and Y.js provider for real-time collaboration
 */
function App() {
  // Generate a random name and color for this user session
  const userInfo = useMemo(() => {
    const name = generateRandomName();
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const color = getUserColor(userId);
    return { name, color, userId };
  }, []);

  return (
    // RoomProvider connects this component tree to a Liveblocks room.
    // The "id" determines which room users join (all users with same id share state).
    // initialStorage sets up the default data structure when the room is first created.
    <RoomProvider
      id="chronicle-slides"
      initialPresence={{ 
        currentSlideId: null, 
        editingTextBoxId: null, 
        cursor: null,
        userName: userInfo.name,
        userColor: userInfo.color,
      }}
      initialStorage={{ slides: [] }}
    >
      <Suspense fallback={
        <Center h="100vh" bg="gray.50">
          <Flex direction="column" align="center" gap={4}>
            <Spinner size="xl" colorPalette="blue" />
            <Text color="gray.600" fontSize="lg">Welcome to Chronicle slides! Please wait while we set up your session...</Text>
          </Flex>
        </Center>
      }>
        <YjsProvider>
          <RoomContent />
        </YjsProvider>
      </Suspense>
    </RoomProvider>
  )
}

export default App
