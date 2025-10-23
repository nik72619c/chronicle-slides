/**
 * PresenceInfo Component
 * 
 * Displays the number of users currently online in the room.
 * Shows a badge with user count and appropriate styling.
 */

import { Badge } from '@chakra-ui/react';
import { useOthers } from '../liveblocks.config';

/**
 * Shows real-time presence information
 * Updates automatically as users join/leave the room
 */
export function PresenceInfo() {
  const others = useOthers();
  const othersCount = others.length;
  
  return (
    <Badge
      colorPalette={othersCount > 0 ? 'green' : 'gray'}
      fontSize="sm"
      px={3}
      py={1}
      borderRadius="full"
    >
      {othersCount === 0 ? (
        <>👤 Only you</>
      ) : (
        <>👥 {othersCount + 1} user{othersCount > 0 ? 's' : ''} online</>
      )}
    </Badge>
  );
}

