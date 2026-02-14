/**
 * Logging Utility
 * Conditional logging based on environment
 * In production, only errors are logged
 */

const IS_DEV = import.meta.env.DEV || import.meta.env.MODE === "development";

export const logger = {
  /**
   * Log informational messages (development only)
   */
  info: (...args: any[]) => {
    if (IS_DEV) {
      console.log(...args);
    }
  },

  /**
   * Log warning messages (development only)
   */
  warn: (...args: any[]) => {
    if (IS_DEV) {
      console.warn(...args);
    }
  },

  /**
   * Log error messages (always logged)
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Log debug messages (development only)
   */
  debug: (...args: any[]) => {
    if (IS_DEV) {
      console.debug(...args);
    }
  },

  /**
   * Log success messages (development only)
   */
  success: (...args: any[]) => {
    if (IS_DEV) {
      console.log("✅", ...args);
    }
  },
};
