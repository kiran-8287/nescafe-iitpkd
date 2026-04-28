import { lazy } from 'react';

/**
 * A helper function to wrap React.lazy with a retry mechanism for ChunkLoadErrors.
 * This is useful for dealing with network issues or when a new version is deployed
 * and the user still has an old version of the app open.
 * 
 * @param {Function} componentImport - The import function (e.g., () => import('./MyComponent'))
 * @returns {React.Component} A lazy-loaded component with retry logic
 */
const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasBeenForceRefreshed) {
        // The error might be due to a new version of the app being deployed.
        // We force a refresh once to try and get the new assets.
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        return window.location.reload();
      }

      // If we've already tried refreshing, we just throw the error.
      throw error;
    }
  });

export default lazyWithRetry;
