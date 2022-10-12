export class ProfitError extends Error {
  public statusCode: number;
  public statusText: string;
  public body: any;
  constructor (description: string, error: Error | { body: any, response: any }) {
    if (!(error as any).response) {
      console.warn(`Creating ProfitError without response:`, error);
    }
    const body = (() => {
      if (error instanceof Error) { return null; }
      else if (typeof error?.body === 'object') { return error.body; }
      else if (typeof error?.body === 'string') {
        try {
          return JSON.parse(error.body); 
        }
        catch (err) {
          return error.body;
        }
      }
    })();
    super(body?.externalMessage ?? (error as Error).message ?? description);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, ProfitError);
    this.statusCode = (error as any).response?.status ?? 0;
    this.statusText = (error as any).response?.statusText ?? '';
    this.body = body;
  }
}
