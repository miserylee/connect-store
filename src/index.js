import React, { PureComponent } from 'react';

function getMethods (store) {
  const methods = Object.getOwnPropertyNames(store).filter(k => !/^_/.test(k) && typeof Object.getOwnPropertyDescriptor(store, k).value === 'function');
  if (Object.getPrototypeOf(store).constructor.name !== 'Object') {
    const inheritedMethods = getMethods(Object.getPrototypeOf(store));
    inheritedMethods.forEach(method => {
      if (!methods.includes(method) && method !== 'constructor' && !/^_/.test(method)) methods.push(method);
    });
  }
  return methods;
}

export default class Connector extends PureComponent {

  constructor (props) {
    super(props);

    let { store } = props;
    if (!Array.isArray(store)) {
      store = [store];
    }

    // Start sync queue
    this._syncQueue = [];
    this._queueInterval = setInterval(_ => {
      if (this._syncQueue.length > 0) {
        try {
          this.setState(Object.assign(...this._syncQueue));
        } catch (err) {
          console.error(err);
        }
        this._syncQueue.splice(0);
      }
    });

    // Bind stores
    store.forEach(this.bindStore.bind(this));
  }

  bindStore (store) {
    const keys = Object.getOwnPropertyNames(store).filter(k => !/^_/.test(k));
    const methods = getMethods(store);

    // Bind sync queue
    store._syncQueues = store._syncQueues || [];
    store._syncQueues.push(this._syncQueue);

    const { state, properties } = keys.reduce(({ state, properties }, key) => {
      const privateKey = `_${key}`;

      state[key] = store[key];
      store[privateKey] = store[key];

      const setter = store.__lookupSetter__(key);
      properties[key] = {
        set (value) {
          setter && setter.bind(this)(value);
          this[privateKey] = value;
          const setState = {
            [key]: value,
          };
          this._syncQueues.forEach(syncQueue => syncQueue.push(setState));
        },
        get () {
          return this[privateKey];
        },
      };

      return { state, properties };
    }, { state: {}, properties: {} });

    // Initialize state
    this.state = {
      ...this.state,
      ...state,
    };

    // Transform actions
    this.actions = {
      ...this.actions,
      ...methods.reduce((memo, method) => {
        const actionName = `on${method.slice(0, 1).toUpperCase()}${method.slice(1)}`;
        memo[actionName] = (...params) => {
          store[method](...params);
        };
        return memo;
      }, {})
    };

    // Define getters/setters
    Object.defineProperties(store, properties);
  }

  componentWillUnmount () {
    clearInterval(this._queueInterval);
  }

  render () {
    const { View, store, ...rest } = this.props;
    return (
      <View
        {...rest}
        {...this.state}
        {...this.actions}
      />
    );
  }
}