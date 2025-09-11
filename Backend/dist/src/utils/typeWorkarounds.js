"use strict";
// Aggressive type workarounds for deployment
Object.defineProperty(exports, "__esModule", { value: true });
exports.forceString = forceString;
exports.forceNumber = forceNumber;
exports.forceDate = forceDate;
exports.forceAny = forceAny;
function forceString(value) {
    if (Array.isArray(value))
        return value[0]?.toString() || '';
    return value?.toString() || '';
}
function forceNumber(value) {
    if (Array.isArray(value))
        return parseInt(value[0]?.toString()) || 0;
    return parseInt(value?.toString()) || 0;
}
function forceDate(value) {
    if (Array.isArray(value))
        return new Date(value[0]?.toString() || '');
    return new Date(value?.toString() || '');
}
function forceAny(value) {
    return value;
}
