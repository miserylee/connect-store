import * as React from 'react';

export interface IObject {
  [key: string]: any;
}

export type TFieldWatcher = (field: string, value: any) => void;

export interface IStore extends IObject {
  __$__enhanced: boolean;
  __$__watchers: TFieldWatcher[];
  __$__refCount: number;

  __$__state: object;

  __idle?(): void;
}

function enhanceStore<T extends object>(store: T): T & IStore {
  const _store = store as (IStore & T);
  if (_store.__$__enhanced) {
    return _store;
  }
  _store.__$__watchers = [];
  _store.__$__refCount = 0;
  const fields = Object.getOwnPropertyNames(_store).filter(k => !/^_/.test(k));

  const properties: IObject = {};

  fields.forEach(field => {
    const innerField = `__$$__${field}`;
    _store[innerField] = _store[field];
    const setter = _store.__lookupSetter__(field);
    properties[field] = {
      set(this: IStore, value: any) {
        if (setter) {
          setter.bind(this)(value);
        }
        this[innerField] = value;
        this.__$__watchers.forEach(watcher => watcher(field, value));
      },
      get() {
        return this[innerField];
      },
    };
  });

  properties.__$__state = {
    get() {
      return fields.reduce((memo, field) => {
        memo[field] = _store[field];
        return memo;
      }, {} as IObject);
    },
  };

  Object.defineProperties(_store, properties);
  _store.__$__enhanced = true;
  return _store;
}

export interface IDataSource {
  [key: string]: any;
}

export interface IDelegate {
  [key: string]: any;
}

export type TView<P> = React.ElementType<P>;

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

class SyncQueue {
  private _queue: IObject[] = [];
  private _activated: boolean = false;
  private _wrapper: React.PureComponent;
  private _flushKeys: string[];
  private _shouldRelease = false;

  constructor(wrapper: React.PureComponent, flushKeys: string[]) {
    this._wrapper = wrapper;
    this._flushKeys = flushKeys;
  }

  public release() {
    this._shouldRelease = true;
  }

  public push(state: IObject) {
    if (this._flushKeys.length > 0 && this._flushKeys.includes(Object.keys(state)[0])) {
      this._wrapper.setState(state);
      return;
    }
    this._queue.push(state);
    this._activate();
  }

  private _activate() {
    if (this._activated) {
      return;
    }
    this._activated = true;
    setImmediate(() => {
      if (this._shouldRelease) {
        return;
      }
      this._wrapper.setState(Object.assign({}, ...this._queue));
      this._queue = [];
      this._activated = false;
    });
  }
}

export default class Connector<DS extends IDataSource, DG extends IDelegate, P extends {
  dataSource?: DS;
  delegate?: DG;
}> {
  private _View: TView<P>;
  private _dataSources: Array<DS & IStore> = [];
  private _delegates: Array<DG & IStore> = [];

  constructor(View: TView<P>) {
    this._View = View;
  }

  public connect(store: DS & DG) {
    this.dataSource(store);
    this.delegate(store);
    return this;
  }

  public dataSource(store: DS) {
    const enhancedStore = enhanceStore(store);
    if (this._dataSources.includes(enhancedStore)) {
      return this;
    }
    this._dataSources.push(enhancedStore);
    enhancedStore.__$__refCount += 1;
    return this;
  }

  public delegate(delegate: DG) {
    const enhancedStore = enhanceStore(delegate);
    if (this._delegates.includes(enhancedStore)) {
      return this;
    }
    this._delegates.push(enhancedStore);
    enhancedStore.__$__refCount += 1;
    return this;
  }

  public render(staticProps?: Omit<P, 'dataSource' | 'delegate'>, flushKeys: string[] = []) {
    const connector = this;

    class Wrapper extends React.PureComponent {
      private delegate: IDelegate;
      private watcher: TFieldWatcher;
      private queue: SyncQueue;

      constructor(props: any) {
        super(props);
        this.queue = new SyncQueue(this, flushKeys);
        this.watcher = (field, value) => {
          this.queue.push({
            [field]: value,
          });
        };
        this.state = Object.assign({}, ...connector._dataSources.map(dataSource => {
          dataSource.__$__watchers.push(this.watcher);
          return dataSource.__$__state;
        }));
        this.delegate = new Proxy({}, {
          get(target: {}, p: string, receiver: any): any {
            if (/^_/.test(p)) {
              throw new Error(`Do not bind private methods of store. You may bind method '${p}'`);
            }
            return (...args: any[]) => {
              connector._delegates.forEach(delegate => {
                try {
                  if (delegate[p] && typeof delegate[p] === 'function') {
                    delegate[p](...args);
                  }
                } catch (e) {
                  console.error(e);
                }
              });
            };
          },
        });
      }

      public componentWillUnmount(): void {
        const checkRefCount = (store: IStore) => {
          if (store.__$__refCount <= 0) {
            if (store.__idle && typeof store.__idle === 'function') {
              store.__idle();
            }
          }
        };

        connector._dataSources.forEach(dataSource => {
          dataSource.__$__watchers.splice(dataSource.__$__watchers.indexOf(this.watcher), 1);
          dataSource.__$__refCount -= 1;
          checkRefCount(dataSource);
        });
        connector._delegates.forEach(delegate => {
          delegate.__$__refCount -= 1;
          checkRefCount(delegate);
        });
        connector._delegates = [];
        this.queue.release();
      }

      public render() {
        const View = connector._View;
        return React.createElement(View, {
          ...this.props,
          dataSource: this.state,
          delegate: this.delegate,
        } as P);
      }
    }

    return (
      <Wrapper {...staticProps}/>
    );
  }
}
