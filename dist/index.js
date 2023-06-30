"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Surreal = void 0;
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
class Surreal {
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
    async query(query) {
        return await this.request("sql", {
            plainBody: true,
            body: query,
        });
    }
    // Table functions affecting all records
    async getRecords(table) {
        return await this.request(`key/${table}`, {
            method: "GET",
        });
    }
    async createRecord(table, data) {
        return await this.request(`key/${table}`, {
            method: "POST",
            body: data,
        });
    }
    async deleteRecords(table) {
        return await this.request(`key/${table}`, {
            method: "DELETE",
        });
    }
    // Table functions affecting specific records
    async getRecordWithId(table, id) {
        return await this.request(`key/${table}/${id}`, {
            method: "GET",
        });
    }
    async createRecordWithId(table, id, data) {
        return await this.request(`key/${table}/${id}`, {
            method: "POST",
            body: data,
        });
    }
    async setRecordWithId(table, id, data) {
        return await this.request(`key/${table}/${id}`, {
            method: "PUT",
            body: data,
        });
    }
    async updateRecordWithId(table, id, data) {
        return await this.request(`key/${table}/${id}`, {
            method: "PATCH",
            body: data,
        });
    }
    async deleteRecordWithId(table, id) {
        return await this.request(`key/${table}/${id}`, {
            method: "DELETE",
        });
    }
    // Request function interfacing with surreal HTTP api
    createHeaders(options) {
        return new Headers({
            Authorization: createAuthorization(options.username ?? this.username, options.password ?? this.password),
            "Content-Type": options.plainBody ? "text/plain" : "application/json",
            Accept: "application/json",
            NS: options.namespace ?? this.namespace,
            DB: options.database ?? this.database,
        });
    }
    async request(path, options = {}) {
        if (!this.isInitialized())
            throw new ConnectionError("The Surreal instance has not yet been connected");
        const url = `${options.host ?? this.host}/${path.startsWith("/") ? path.slice(1) : path}`;
        const method = options.method ?? "POST";
        const headers = this.createHeaders(options);
        const body = typeof options.body === "string"
            ? options.body
            : JSON.stringify(options.body);
        const response = await (this.fetcher ? this.fetcher : fetch)(url, {
            method,
            headers,
            body,
        });
        return response.json();
    }
}
exports.Surreal = Surreal;
exports.default = Surreal;
