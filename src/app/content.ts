import {
  makeStateKey,
  PLATFORM_ID,
  Service,
  TransferState,
  inject,
  signal,
} from "@angular/core";
import { isPlatformServer } from "@angular/common";
import type { ContentClient } from "comark-content";
import { content } from "../../content";

export type Content = typeof content;
type ContentDelegate = Content | ContentClient;

type ContentServiceApi = {
  [Property in keyof Content]: Content[Property];
};

export interface ContentService extends ContentServiceApi {}

@Service()
export abstract class ContentService {
  readonly changeVersion = signal(0);
  private readonly transferState = inject(TransferState);
  private readonly server = isPlatformServer(inject(PLATFORM_ID));
  private delegate?: ContentDelegate;

  protected constructor() {
    return new Proxy(this, {
      get: (target, property, receiver) => {
        if (property in target) {
          return Reflect.get(target, property, receiver);
        }

        const delegate = target.delegate;
        const value = delegate && Reflect.get(delegate, property);
        if (typeof value !== "function") {
          return value;
        }

        return (...args: unknown[]) => target.call(String(property), args);
      },
    });
  }

  protected setDelegate(delegate: ContentDelegate): void {
    this.delegate = delegate;
  }

  private call(method: string, args: unknown[]): unknown {
    if (!this.delegate) {
      throw new Error("ContentService has not been initialized with a delegate.");
    }

    const key = this.stateKey(method, args);
    // A watcher owns a live filesystem subscription and cannot be transferred
    // to the browser. Start it only on the server and return its stop handle.
    if (method === "watch") {
      const watcher = Reflect.get(this.delegate, method);
      if (typeof watcher !== "function") {
        throw new Error(`ContentService delegate does not implement "${method}".`);
      }
      return watcher.apply(this.delegate, args);
    }

    if (!this.server && this.transferState.hasKey(key)) {
      const result = this.transferState.get<unknown>(key, undefined);
      this.transferState.remove(key);
      return result;
    }

    const callable = Reflect.get(this.delegate, method);
    if (typeof callable !== "function") {
      throw new Error(`ContentService delegate does not implement "${method}".`);
    }

    const result = callable.apply(this.delegate, args);
    if (this.server) {
      if (result instanceof Promise) {
        return result.then((value) => {
          this.transferState.set(key, value);
          return value;
        });
      }
      this.transferState.set(key, result);
    }
    return result;
  }

  private stateKey(method: string, args: unknown[]): ReturnType<typeof makeStateKey> {
    return makeStateKey(`comark-content:${method}:${JSON.stringify(args)}`);
  }
}
