import { EventEmitter } from "events";

declare global {
  // eslint-disable-next-line no-var
  var __storeEmitter: EventEmitter | undefined;
}

// Singleton so HMR in dev doesn't create duplicate emitters
export const storeEmitter: EventEmitter =
  global.__storeEmitter ?? (global.__storeEmitter = new EventEmitter());

storeEmitter.setMaxListeners(200);

export type UpdateType = "announcement" | "product" | "settings";

export function emitStoreUpdate(type: UpdateType) {
  storeEmitter.emit("update", { type, ts: Date.now() });
}
