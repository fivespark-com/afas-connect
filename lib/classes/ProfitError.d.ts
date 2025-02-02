export declare class ProfitError extends Error {
    statusCode: number;
    statusText: string;
    body: any;
    constructor(description: string, error: Error | {
        body: any;
        response: any;
    });
}
