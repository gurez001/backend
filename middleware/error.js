const ErrorHandler = require('../utils/errorhandler');
// const Errorhandler = require('../utils/errorhandler');

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal server error';

    //Wrong mongodb id error
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid ${err.path}`;
        err = new ErrorHandler(message, 404);
    }
    

    //Mongo dublicate key errors
    if(err.code === 11000 ){
        const message = `Dublicate ${Object.keys(err.keyValue)} Entered`;
        err = new ErrorHandler(message,400)
    }

      //Wrong jwt error
      if(err.name === 'JsonWebTokenError' ){
        const message = `Token invalid, try again`;
        err = new ErrorHandler(message,400)
    }

        //jwt expire error
        if(err.name === 'TokenExpiredError' ){
            const message = `Token Expired, try again`;
            err = new ErrorHandler(message,400)
        }

    res.status(err.statusCode).json({
        success: false,
        error: err.stack,
        message:err.message,
    })
}