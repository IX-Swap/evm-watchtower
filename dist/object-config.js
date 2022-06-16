"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectConfig = void 0;
class ObjectConfig {
    constructor(config) {
        this.config = config;
    }
    get(key) {
        return this.config.hasOwnProperty(key) ? this.config[key] : null;
    }
}
exports.ObjectConfig = ObjectConfig;
//# sourceMappingURL=object-config.js.map