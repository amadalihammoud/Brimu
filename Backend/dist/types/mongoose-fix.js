"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStringParam = parseStringParam;
exports.parseNumberParam = parseNumberParam;
exports.parseBooleanParam = parseBooleanParam;
// Helper functions for query parameter validation
function parseStringParam(param) {
    if (Array.isArray(param))
        return param[0]?.toString() || '';
    return param?.toString() || '';
}
function parseNumberParam(param) {
    const str = parseStringParam(param);
    return parseInt(str) || 0;
}
function parseBooleanParam(param) {
    const str = parseStringParam(param);
    return str === 'true' || str === '1';
}
