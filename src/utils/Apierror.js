class ApiError extends Error {
   constructor(statusCode, message = "something went wrong", errors = [], stack = null) {
      super(message);
      this.statusCode = statusCode; // Use statusCode instead of status
      this.errors = errors;
      if (stack) {
         this.stack = stack;
      } else {
         Error.captureStackTrace(this, this.constructor);
      }
   }
}

export { ApiError };
