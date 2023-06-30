export type SurrealConfig = {
  host: string;
  username: string;
  password: string;
  namespace: string;
  database: string;
};

export type SurrealQueryOK<TResult = any> = {
  time: string;
  status: "OK";
  result: TResult;
};

export type SurrealQueryERR = {
  time: string;
  status: "ERR";
  detail: string;
};

export type SurrealQueryResult<TResult = any> =
  | SurrealQueryOK<TResult>
  | SurrealQueryERR;
export type SurrealResponse<TResult = any> = Array<SurrealQueryResult<TResult>>;

class ConnectionError extends Error {}

const createAuthorization = (username: string, password: string) => {
  if (typeof btoa !== "undefined") {
    return `Basic ${btoa(`${username}:${password}`)}`;
  }
  if (typeof Buffer !== "undefined") {
    return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
  }
  throw new Error(
    "Cannot encode credentials: btoa and Buffer are not available"
  );
};

type FetchFunction = (
  input: RequestInfo,
  init?: RequestInit
) => Promise<Response>;

type RequestOptions = {
  host?: string;
  username?: string;
  password?: string;
  namespace?: string;
  database?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  plainBody?: boolean;
  body?: Record<string, unknown> | string;
};

export class Surreal<TFetcher extends FetchFunction = FetchFunction> {
  private host?: string;
  private username?: string;
  private password?: string;
  private namespace?: string;
  private database?: string;
  private fetcher?: TFetcher;

  constructor(config: SurrealConfig, fetcher: TFetcher) {
    this.host = config.host;
    this.username = config.username;
    this.password = config.password;
    this.namespace = config.namespace;
    this.database = config.database;
    this.fetcher = fetcher;
  }

  // Define connection variables

  connect(config: SurrealConfig) {
    this.host = config.host;
    this.username = config.username;
    this.password = config.password;
    this.namespace = config.namespace;
    this.database = config.database;
  }

  isInitialized(): boolean {
    return !!(
      this.host &&
      this.username &&
      this.password &&
      this.namespace &&
      this.database
    );
  }

  // General query function

  async query<TResult = unknown>(
    query: string
  ): Promise<SurrealResponse<TResult>> {
    return await this.request<TResult>("sql", {
      plainBody: true,
      body: query,
    });
  }

  // Table functions affecting all records

  async getRecords<TResult = any>(table: string) {
    return await this.request<TResult>(`key/${table}`, {
      method: "GET",
    });
  }

  async createRecord<TResult = any>(
    table: string,
    data: Record<string, unknown>
  ) {
    return await this.request<TResult>(`key/${table}`, {
      method: "POST",
      body: data,
    });
  }

  async deleteRecords<TResult = any>(table: string) {
    return await this.request<TResult>(`key/${table}`, {
      method: "DELETE",
    });
  }

  // Table functions affecting specific records

  async getRecordWithId<TResult = any>(table: string, id: string | number) {
    return await this.request<TResult>(`key/${table}/${id}`, {
      method: "GET",
    });
  }

  async createRecordWithId<TResult = any>(
    table: string,
    id: string | number,
    data: Record<string, unknown>
  ) {
    return await this.request<TResult>(`key/${table}/${id}`, {
      method: "POST",
      body: data,
    });
  }

  async setRecordWithId<TResult = any>(
    table: string,
    id: string | number,
    data: Record<string, unknown>
  ) {
    return await this.request<TResult>(`key/${table}/${id}`, {
      method: "PUT",
      body: data,
    });
  }

  async updateRecordWithId<TResult = any>(
    table: string,
    id: string | number,
    data: Record<string, unknown>
  ) {
    return await this.request<TResult>(`key/${table}/${id}`, {
      method: "PATCH",
      body: data,
    });
  }

  async deleteRecordWithId<TResult = any>(table: string, id: string | number) {
    return await this.request<TResult>(`key/${table}/${id}`, {
      method: "DELETE",
    });
  }

  // Request function interfacing with surreal HTTP api

  private createHeaders(options: RequestOptions): Headers {
    return new Headers({
      Authorization: createAuthorization(
        options.username ?? this.username!,
        options.password ?? this.password!
      ),
      "Content-Type": options.plainBody ? "text/plain" : "application/json",
      Accept: "application/json",
      NS: options.namespace ?? this.namespace!,
      DB: options.database ?? this.database!,
    });
  }

  private async request<TResult = unknown>(
    path: string,
    options: RequestOptions = {}
  ): Promise<SurrealResponse<TResult>> {
    if (!this.isInitialized())
      throw new ConnectionError(
        "The Surreal instance has not yet been connected"
      );

    const url = `${options.host ?? this.host!}/${
      path.startsWith("/") ? path.slice(1) : path
    }`;
    const method = options.method ?? "POST";
    const headers = this.createHeaders(options);
    const body =
      typeof options.body === "string"
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

export default Surreal;
