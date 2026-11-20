// What $fetch / FetchError expose; everything is optional because the input is unknown.
interface ErrorLike {
  status?: number;
  name?: string;
  message?: string;
}

/**
 * Composable for handling API errors consistently
 */
export const useErrorHandler = () => {
  const getErrorMessage = (input: unknown): string => {
    if (typeof input === 'string') return input;
    const error = (input ?? undefined) as ErrorLike | undefined;

    // HTTP status first: Spotify's raw error text isn't meant for end users.
    if (error?.status) {
      switch (error.status) {
        case 401:
          return 'Authentication failed. Please log in again.';
        case 403:
          return 'Access denied. Check your permissions.';
        case 404:
          return 'Resource not found.';
        case 429:
          return 'Spotify is rate-limiting requests. Wait a minute and try again.';
        case 500:
          return 'Spotify is having trouble right now. Please try again later.';
        default:
          return `Spotify returned an error (${error.status}). Please try again.`;
      }
    }

    // $fetch network failures carry no status.
    if (error?.name === 'FetchError') {
      return "Couldn't reach Spotify. Check your connection and try again.";
    }
    if (error?.message) return error.message;

    return 'An unexpected error occurred';
  };

  const isUnauthorizedError = (input: unknown): boolean => {
    return (input as ErrorLike | null | undefined)?.status === 401;
  };

  return {
    getErrorMessage,
    isUnauthorizedError,
  };
};
