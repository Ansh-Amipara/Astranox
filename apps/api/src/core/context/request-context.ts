import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContextStore {
  requestId: string;
  userId?: string;
  ip?: string;
}

export const requestContext = new AsyncLocalStorage<RequestContextStore>();

export const getRequestContext = (): RequestContextStore | undefined => {
  return requestContext.getStore();
};

export const getRequestId = (): string | undefined => {
  return requestContext.getStore()?.requestId;
};
