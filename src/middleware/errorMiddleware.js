const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
  
    console.error(err.stack); // Log del error para debugging
  
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Error interno del servidor',
      error: process.env.NODE_ENV === 'production' ? null : err.stack
    });
  };
  
  module.exports = { errorHandler };