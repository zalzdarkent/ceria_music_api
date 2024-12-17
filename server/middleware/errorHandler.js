const ResponseAPI = require("../utils/response");

const errorHandler = (err, req, res, next) => {
    console.error(err);

    if (err.name === 'ValidationError') {
        return ResponseAPI.error(res, 'Validation Error', 400, err.errors);
    }

    if (err.code === 11000) {
        return ResponseAPI.error(res, 'Duplicate field value', 400);
    }

    return ResponseAPI.serverError(res, err);
};

module.exports = errorHandler