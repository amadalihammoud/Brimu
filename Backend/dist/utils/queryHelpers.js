"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBooleanParam = exports.parseDateParam = exports.parseNumberParam = exports.parseStringParam = void 0;
const parseStringParam = (param) => Array.isArray(param) ? param[0]?.toString() || '' : param?.toString() || '';
exports.parseStringParam = parseStringParam;
const parseNumberParam = (param) => parseInt((0, exports.parseStringParam)(param)) || 0;
exports.parseNumberParam = parseNumberParam;
const parseDateParam = (param) => new Date((0, exports.parseStringParam)(param));
exports.parseDateParam = parseDateParam;
const parseBooleanParam = (param) => {
    const str = (0, exports.parseStringParam)(param);
    return str === 'true' || str === '1';
};
exports.parseBooleanParam = parseBooleanParam;
