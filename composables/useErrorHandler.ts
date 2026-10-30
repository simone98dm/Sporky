/**
 * Composable for handling API errors consistently
 */
export const useErrorHandler = () => {
  const getErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error;

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

  const isUnauthorizedError = (error: any): boolean => {
    return error?.status === 401;
  };

  const shouldRetry = (error: any): boolean => {
    // Retry on network errors or 5xx server errors
    return !error?.status || (error.status >= 500 && error.status < 600);
  };

  return {
    getErrorMessage,
    isUnauthorizedError,
    shouldRetry,
  };
};
