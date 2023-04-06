import type { SdkResponse } from './types';

export class ResponseError extends Error {
  readonly status: SdkResponse['status'];
  constructor(public response: SdkResponse, message?: string) {
    super(message);
    this.status = response.status;
  }
}
