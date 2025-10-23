/**
 * Test utilities and helpers
 * Provides custom render functions with necessary providers
 */

import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

/**
 * Custom render function that wraps components with ChakraProvider
 * Use this instead of the default render from @testing-library/react
 */
export function renderWithChakra(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
    ),
    ...options,
  });
}

// Re-export everything from testing library
export * from '@testing-library/react';
export { renderWithChakra as render };

