/**
 * Liveblocks Configuration
 * 
 * This file sets up the Liveblocks client and exports typed hooks for use throughout the app.
 * Type definitions have been moved to src/types/slide.types.ts for better organization.
 */

import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import type { TextBox, Slide, Storage, Presence, UserMeta } from './types/slide.types';

// Re-export types for backward compatibility
export type { TextBox, Slide, Storage, Presence, UserMeta };

// IMPORTANT: Add your Liveblocks Public API key here
// Get it from: https://liveblocks.io/dashboard → Your Project → API Keys
// For production, use environment variables: import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY
const LIVEBLOCKS_PUBLIC_KEY = "pk_dev_WtTZukg6BbLDV0ZxsbVSjW5_fn0HSjbP3_uurBjGdus8MTQxAvZvxEhPnWlmWH6K";

// Create a Liveblocks client with your public API key
const client = createClient({
  publicApiKey: LIVEBLOCKS_PUBLIC_KEY,
});

// Export typed hooks and components for use throughout the app
export const {
  suspense: {
    RoomProvider,
    useRoom,
    useMyPresence,
    useUpdateMyPresence,
    useSelf,
    useOthers,
    useOthersMapped,
    useOthersConnectionIds,
    useOther,
    useBroadcastEvent,
    useEventListener,
    useErrorListener,
    useStorage,
    useHistory,
    useUndo,
    useRedo,
    useCanUndo,
    useCanRedo,
    useMutation,
    useStatus,
    useLostConnectionListener,
  },
} = createRoomContext<Presence, Storage, UserMeta>(client);
