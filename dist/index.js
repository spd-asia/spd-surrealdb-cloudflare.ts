var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class ConnectionError extends Error {
}
const createAuthorization = (username, password) => {
    if (typeof btoa !== "undefined") {
        return `Basic ${btoa(`${username}:${password}`)}`;
    }
    if (typeof Buffer !== "undefined") {
        return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
    }
    throw new Error("Cannot encode credentials: btoa and Buffer are not available");
};
export class Surreal {
    constructor(config, fetcher) {
        this.host = config.host;
        this.username = config.username;
        this.password = config.password;
        this.namespace = config.namespace;
        this.database = config.database;
        this.fetcher = fetcher;
    }
    // Define connection variables
    connect(config) {
        this.host = config.host;
        this.username = config.username;
        this.password = config.password;
        this.namespace = config.namespace;
        this.database = config.database;
    }
    isInitialized() {
        return !!(this.host &&
            this.username &&
            this.password &&
            this.namespace &&
            this.database);
    }
    // General query function
    query(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.request("sql", {
                plainBody: true,
                body: query,
            });
        });
    }
    // Table functions affecting all records
    getRecords(table) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.request(`key/${table}`, {
                method: "GET",
            });
        });
    }
    createRecord(table, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.request(`key/${table}`, {
                method: "POST",
                body: data,
            });
        });
    }
    deleteRecords(table) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.request(`key/${table}`, {
                method: "DELETE",
            });
        });
    }
    // Table functions affecting specific records
    getRecordWithId(table, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.request(`key/${table}/${id}`, {
                method: "GET",
            });
        });
    }
    createRecordWithId(table, id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.request(`key/${table}/${id}`, {
                method: "POST",
                body: data,
            });
        });
    }
    setRecordWithId(table, id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.request(`key/${table}/${id}`, {
                method: "PUT",
                body: data,
            });
        });
    }
    updateRecordWithId(table, id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.request(`key/${table}/${id}`, {
                method: "PATCH",
                body: data,
            });
        });
    }
    deleteRecordWithId(table, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.request(`key/${table}/${id}`, {
                method: "DELETE",
            });
        });
    }
    // Request function interfacing with surreal HTTP api
    createHeaders(options) {
        var _a, _b, _c, _d;
        return new Headers({
            Authorization: createAuthorization((_a = options.username) !== null && _a !== void 0 ? _a : this.username, (_b = options.password) !== null && _b !== void 0 ? _b : this.password),
            "Content-Type": options.plainBody ? "text/plain" : "application/json",
            Accept: "application/json",
            NS: (_c = options.namespace) !== null && _c !== void 0 ? _c : this.namespace,
            DB: (_d = options.database) !== null && _d !== void 0 ? _d : this.database,
        });
    }
    request(path, options = {}) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isInitialized())
                throw new ConnectionError("The Surreal instance has not yet been connected");
            const url = `${(_a = options.host) !== null && _a !== void 0 ? _a : this.host}/${path.startsWith("/") ? path.slice(1) : path}`;
            const method = (_b = options.method) !== null && _b !== void 0 ? _b : "POST";
            const headers = this.createHeaders(options);
            const body = typeof options.body === "string"
                ? options.body
                : JSON.stringify(options.body);
            const response = yield (this.fetcher ? this.fetcher : fetch)(url, {
                method,
                headers,
                body,
            });
            return response.json();
        });
    }
}
export default Surreal;
