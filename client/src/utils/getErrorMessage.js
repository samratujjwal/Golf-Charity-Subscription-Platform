/**
 * Safely extracts a human-readable error message from any error shape.
 *
 * Handles:
 *  - axios errors: err.response.data.error (string or object)
 *  - plain Error objects: err.message
 *  - objects with {code, message}: err.message
 *  - raw strings
 *  - anything else → fallback string
 */
export function getErrorMessage(
  err,
  fallback = "Something went wrong. Please try again.",
) {
  if (!err) return fallback;

  // Axios response error
  if (err.response?.data) {
    const { error, message } = err.response.data;

    // error field is a plain string
    if (typeof error === "string" && error.length > 0) return error;

    // error field is an object with message key (e.g. Mongoose, Stripe)
    if (error && typeof error === "object") {
      if (typeof error.message === "string") return error.message;
      // Last resort — stringify the object so it's at least renderable
      return JSON.stringify(error);
    }

    // message field fallback
    if (typeof message === "string" && message.length > 0) return message;
    if (message && typeof message === "object" && message.message)
      return message.message;
  }

  // Plain Error or any object with .message
  if (typeof err.message === "string" && err.message.length > 0)
    return err.message;

  // Raw string
  if (typeof err === "string" && err.length > 0) return err;

  return fallback;
}
