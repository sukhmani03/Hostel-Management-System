// Global error handling middleware - catches all errors passed via next(err)
const errorHandler = (err, req, res, next) => {
  // Use the status code set on the error, fall back to the response status, or default to 500
  let statusCode = 500;
  if (err.statusCode) {
    statusCode = err.statusCode;
  } else if (res.statusCode && res.statusCode !== 200) {
    statusCode = res.statusCode;
  }

  // Log error details to console for debugging
  console.error(`[Error] ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Only include stack trace in development mode
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = { errorHandler };
