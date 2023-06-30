/// <reference types="@cloudflare/workers-types" />
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
export type SurrealQueryResult<TResult = any> = SurrealQueryOK<TResult> | SurrealQueryERR;
export type SurrealResponse<TResult = any> = Array<SurrealQueryResult<TResult>>;
type FetchFunction = (input: RequestInfo, init?: RequestInit) => Promise<Response>;
export declare class Surreal<TFetcher extends FetchFunction = FetchFunction> {
    private host?;
    private username?;
    private password?;
    private namespace?;
    private database?;
    private fetcher?;
    constructor(config: SurrealConfig, fetcher: TFetcher);
    connect(config: SurrealConfig): void;
    isInitialized(): boolean;
    query<TResult = unknown>(query: string): Promise<SurrealResponse<TResult>>;
    getRecords<TResult = any>(table: string): Promise<SurrealResponse<TResult>>;
    createRecord<TResult = any>(table: string, data: Record<string, unknown>): Promise<SurrealResponse<TResult>>;
    deleteRecords<TResult = any>(table: string): Promise<SurrealResponse<TResult>>;
    getRecordWithId<TResult = any>(table: string, id: string | number): Promise<SurrealResponse<TResult>>;
    createRecordWithId<TResult = any>(table: string, id: string | number, data: Record<string, unknown>): Promise<SurrealResponse<TResult>>;
    setRecordWithId<TResult = any>(table: string, id: string | number, data: Record<string, unknown>): Promise<SurrealResponse<TResult>>;
    updateRecordWithId<TResult = any>(table: string, id: string | number, data: Record<string, unknown>): Promise<SurrealResponse<TResult>>;
    deleteRecordWithId<TResult = any>(table: string, id: string | number): Promise<SurrealResponse<TResult>>;
    private createHeaders;
    private request;
}
export default Surreal;
