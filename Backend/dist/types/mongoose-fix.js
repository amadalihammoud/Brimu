"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStringFromQuery = getStringFromQuery;
// Helper function to safely get string from query
function getStringFromQuery(value, defaultValue = '') {
    if (typeof value === 'string')
        return value;
    return defaultValue;
}
