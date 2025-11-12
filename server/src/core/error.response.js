'use strict';

const statusCodes = require('./statusCodes');
const reasonPhrases = require('./reasonPhrases');

/**
 * Base error class for all HTTP errors
 */
class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

/**
 * 409 Conflict - Request conflicts with current state of server
 * Usage: When resource already exists (e.g., duplicate email)
 */
class ConflictRequestError extends ErrorResponse {
    constructor(message = reasonPhrases.CONFLICT, statusCode = statusCodes.CONFLICT) {
        super(message, statusCode);
    }
}

/**
 * 400 Bad Request - Client sent invalid data
 * Usage: Validation errors, missing required fields, invalid format
 */
class BadRequestError extends ErrorResponse {
    constructor(message = reasonPhrases.BAD_REQUEST, statusCode = statusCodes.BAD_REQUEST) {
        super(message, statusCode);
    }
}

/**
 * 401 Unauthorized - User not authenticated
 * Usage: Missing or invalid token, expired session
 */
class BadUserRequestError extends ErrorResponse {
    constructor(message = reasonPhrases.UNAUTHORIZED, statusCode = statusCodes.UNAUTHORIZED) {
        super(message, statusCode);
    }
}

/**
 * 403 Forbidden - User authenticated but lacks permission
 * Usage: Normal user trying to access admin-only resources
 */
class BadUser2RequestError extends ErrorResponse {
    constructor(message = reasonPhrases.FORBIDDEN, statusCode = statusCodes.FORBIDDEN) {
        super(message, statusCode);
    }
}

module.exports = {
    ConflictRequestError,
    BadRequestError,
    BadUserRequestError,
    BadUser2RequestError,
};
