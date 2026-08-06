declare module 'redlock' {
  export interface Lock {
    resources: string[];
    value: string;
    attempts: number;
    expiration: number;
    release(): Promise<void>;
    extend(time: number): Promise<Lock>;
  }

  export interface Options {
    driftFactor?: number;
    retryCount?: number;
    retryDelay?: number;
    retryJitter?: number;
    automaticExtensionThreshold?: number;
  }

  export default class Redlock {
    constructor(clients: any[], options?: Options);
    acquire(resources: string[], duration: number): Promise<Lock>;
    on(event: 'clientError' | 'error', callback: (err: any) => void): void;
  }
}
