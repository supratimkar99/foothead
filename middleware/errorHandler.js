const { logEvents } = require('./logger');

const errorHandler = (err, req, res, next) => {
    logEvents(`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
    console.log(err.stack)

    // const status = res.statusCode ? res.statusCode : 500
    // hard coding to avoid 200 status code (TO-DO: look into this issue further)
    const status = 500 // Internal server error

    res.status(status).json({ message: err.message })
}

module.exports = errorHandler;