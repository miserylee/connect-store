import * as React from 'react';

function getMethods(obj: object) {
  const methods = Object.getOwnPropertyNames(obj).filter(k => !/^_/.test(k) && typeof Object.getOwnPropertyDescriptor(obj, k)!.value === 'function');
  if (Object.getPrototypeOf(obj).constructor.name !== 'Object') {
    const inheritedMethods = getMethods(Object.getPrototypeOf(obj));
    inheritedMethods.forEach(method => {
      if (!methods.includes(method) && method !== 'constructor' && !/^_/.test(method)) {
        methods.push(method);
      }
    });
  }
  return methods;
}

function getFields(store: object) {
  return Object.getOwnPropertyNames(store).filter(k => !/^_/.test(k));
}

export interface IObject {
  [key: string]: any;
}

export type TFieldWatcher = (field: string, value: any) => void;

export interface IStore extends IObject {
  __$__enhanced: boolean;
  __$__watchers: TFieldWatcher[];

  __$__state: object;
}

function enhanceStore<T extends object>(store: T): T & IStore {
  const _store = store as (IStore & T);
  if (_store.__$__enhanced) {
    return _store;
  }
  _store.__$__watchers = [];
  const fields = getFields(_store);

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

  return _store;
}

class Connector {
  private _View?: React.ElementType;

  constructor(View?: React.ElementType) {
    this._View = View;
  }

  public connect(store: IObject) {

  }

  public disconnect(store: IObject) {

  }

  public render() {
    class Wrapper extends React.PureComponent {

    }
  }
}
