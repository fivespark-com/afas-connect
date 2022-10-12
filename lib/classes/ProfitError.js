"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfitError = void 0;
class ProfitError extends Error {
    constructor(description, error) {
        var _a, _b, _c, _d, _e, _f;
        if (!error.response) {
            console.warn(`Creating ProfitError without response:`, error);
        }
        const body = (() => {
            if (error instanceof Error) {
                return null;
            }
            else if (typeof (error === null || error === void 0 ? void 0 : error.body) === 'object') {
                return error.body;
            }
            else if (typeof (error === null || error === void 0 ? void 0 : error.body) === 'string') {
                try {
                    return JSON.parse(error.body);
                }
                catch (err) {
                    return error.body;
                }
            }
        })();
        super((_b = (_a = body === null || body === void 0 ? void 0 : body.externalMessage) !== null && _a !== void 0 ? _a : error.message) !== null && _b !== void 0 ? _b : description);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, ProfitError);
        this.statusCode = (_d = (_c = error.response) === null || _c === void 0 ? void 0 : _c.status) !== null && _d !== void 0 ? _d : 0;
        this.statusText = (_f = (_e = error.response) === null || _e === void 0 ? void 0 : _e.statusText) !== null && _f !== void 0 ? _f : '';
        this.body = body;
    }
}
exports.ProfitError = ProfitError;
