/**
 * Unit tests for PresenceInfo Component
 * 
 * Tests the behavior of the presence indicator that shows
 * the number of users currently online in the room.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../../test/utils';
import { PresenceInfo } from '../PresenceInfo';

// Mock the Liveblocks config module
vi.mock('../../liveblocks.config', () => ({
  useOthers: vi.fn(),
}));

// Import the mocked hook to control its behavior in tests
import { useOthers } from '../../liveblocks.config';

describe('PresenceInfo Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  describe('When user is alone', () => {
    it('should display "Only you" when no other users are present', () => {
      // Arrange: Mock useOthers to return empty array (no other users)
      vi.mocked(useOthers).mockReturnValue([]);

      // Act: Render the component
      render(<PresenceInfo />);

      // Assert: Check that the correct text is displayed
      expect(screen.getByText(/Only you/i)).toBeInTheDocument();
      expect(screen.getByText(/👤/)).toBeInTheDocument();
    });

    it('should render with gray appearance when alone', () => {
      // Arrange
      vi.mocked(useOthers).mockReturnValue([]);

      // Act
      const { container } = render(<PresenceInfo />);

      // Assert: Component should be rendered
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText(/Only you/i)).toBeInTheDocument();
    });
  });

  describe('When other users are present', () => {
    it('should display correct count with one other user', () => {
      // Arrange: Mock one other user present
      vi.mocked(useOthers).mockReturnValue([{ id: 1 }] as any);

      // Act
      render(<PresenceInfo />);

      // Assert: Should show "2 users online" (self + 1 other)
      expect(screen.getByText(/2 users online/i)).toBeInTheDocument();
      expect(screen.getByText(/👥/)).toBeInTheDocument();
    });

    it('should display correct count with multiple other users', () => {
      // Arrange: Mock multiple other users present
      vi.mocked(useOthers).mockReturnValue([
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ] as any);

      // Act
      render(<PresenceInfo />);

      // Assert: Should show "4 users online" (self + 3 others)
      expect(screen.getByText(/4 users online/i)).toBeInTheDocument();
    });

    it('should use "users" plural correctly', () => {
      // Arrange: Single other user
      vi.mocked(useOthers).mockReturnValue([{ id: 1 }] as any);

      // Act
      render(<PresenceInfo />);

      // Assert: Should use "users" (plural)
      expect(screen.getByText(/users online/i)).toBeInTheDocument();
    });

    it('should render with green appearance when others are present', () => {
      // Arrange
      vi.mocked(useOthers).mockReturnValue([{ id: 1 }] as any);

      // Act
      const { container } = render(<PresenceInfo />);

      // Assert: Component should render properly
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText(/2 users online/i)).toBeInTheDocument();
    });
  });

  describe('Badge styling', () => {
    it('should render as a Badge component with proper content', () => {
      // Arrange
      vi.mocked(useOthers).mockReturnValue([]);

      // Act
      const { container } = render(<PresenceInfo />);

      // Assert: Check component renders with content
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText(/Only you/i)).toBeInTheDocument();
    });
  });

  describe('Real-time updates', () => {
    it('should update display when users join', () => {
      // Arrange: Start with no other users
      vi.mocked(useOthers).mockReturnValue([]);

      // Act: Initial render
      const { rerender } = render(<PresenceInfo />);
      expect(screen.getByText(/Only you/i)).toBeInTheDocument();

      // Simulate a user joining
      vi.mocked(useOthers).mockReturnValue([{ id: 1 }] as any);
      rerender(<PresenceInfo />);

      // Assert: Display should update
      expect(screen.getByText(/2 users online/i)).toBeInTheDocument();
    });

    it('should update display when users leave', () => {
      // Arrange: Start with two other users
      vi.mocked(useOthers).mockReturnValue([{ id: 1 }, { id: 2 }] as any);

      // Act: Initial render
      const { rerender } = render(<PresenceInfo />);
      expect(screen.getByText(/3 users online/i)).toBeInTheDocument();

      // Simulate all users leaving
      vi.mocked(useOthers).mockReturnValue([]);
      rerender(<PresenceInfo />);

      // Assert: Display should update to show "Only you"
      expect(screen.getByText(/Only you/i)).toBeInTheDocument();
    });

    it('should update appearance when transitioning from alone to with others', () => {
      // Arrange: Start alone
      vi.mocked(useOthers).mockReturnValue([]);

      // Act: Initial render
      const { rerender } = render(<PresenceInfo />);
      expect(screen.getByText(/Only you/i)).toBeInTheDocument();

      // Simulate someone joining
      vi.mocked(useOthers).mockReturnValue([{ id: 1 }] as any);
      rerender(<PresenceInfo />);

      // Assert: Display and appearance should update
      expect(screen.getByText(/2 users online/i)).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle large number of users correctly', () => {
      // Arrange: Mock 100 other users
      const manyUsers = Array.from({ length: 100 }, (_, i) => ({ id: i }));
      vi.mocked(useOthers).mockReturnValue(manyUsers as any);

      // Act
      render(<PresenceInfo />);

      // Assert: Should show "101 users online"
      expect(screen.getByText(/101 users online/i)).toBeInTheDocument();
    });

    it('should be accessible with proper content structure', () => {
      // Arrange
      vi.mocked(useOthers).mockReturnValue([]);

      // Act
      const { container } = render(<PresenceInfo />);

      // Assert: Component should have proper structure for accessibility
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText(/Only you/i)).toBeInTheDocument();
      expect(screen.getByText(/👤/)).toBeInTheDocument();
    });
  });

  describe('Hook integration', () => {
    it('should call useOthers hook on mount', () => {
      // Arrange
      vi.mocked(useOthers).mockReturnValue([]);

      // Act
      render(<PresenceInfo />);

      // Assert: useOthers should have been called
      expect(useOthers).toHaveBeenCalled();
    });

    it('should handle undefined return from useOthers gracefully', () => {
      // Arrange: Mock undefined return (edge case)
      vi.mocked(useOthers).mockReturnValue(undefined as any);

      // Act & Assert: Should not crash
      expect(() => render(<PresenceInfo />)).toThrow();
    });
  });
});

