/**
 * RoomContent Component
 * 
 * Main content area for the application that renders inside the Liveblocks room.
 * Includes the header with app title and presence info, plus the main slide list.
 */

import { Box, Flex, Heading } from '@chakra-ui/react';
import { SlideList } from './SlideList';
import { PresenceInfo } from './PresenceInfo';

/**
 * Renders the main application layout within a Liveblocks room
 * Must be used inside RoomProvider and YjsProvider
 */
export function RoomContent() {
  return (
    <Flex direction="column" h="100vh" bg="gray.50">
      {/* Header */}
      <Box
        as="header"
        bg="white"
        borderBottom="1px"
        borderColor="gray.200"
        px={6}
        py={4}
        shadow="sm"
      >
        <Flex justify="space-between" align="center">
          <Heading size="lg" color="gray.800">
            📊 Chronicle Slides
          </Heading>
          <PresenceInfo />
        </Flex>
      </Box>
      
      {/* Main content area */}
      <Box as="main" flex="1" overflow="hidden">
        <SlideList />
      </Box>
    </Flex>
  );
}

