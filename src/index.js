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

  static defaultProps = {
    store: [],
    View: null,
  };

  constructor (props) {
    super(props);

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
  }

  componentWillMount () {
    this.init(this.props.store);
  }

  componentWillUpdate (nextProps) {
    if (nextProps.store !== this.props.store) {
      this.init(nextProps.store, this.props.store);
    }
  }

  init (store = [], prevStore = []) {
    if (!Array.isArray(store)) {
      store = [store];
    }
    if (!Array.isArray(prevStore)) {
      prevStore = [prevStore];
    }

    this._actions = {};

    // Unbind previous stores
    prevStore.forEach(this.unbindStore.bind(this));
    // Bind stores
    store.forEach(this.bindStore.bind(this));
  }

  unbindStore (store) {
    // Unbind sync queue
    if (store._syncQueues && store._syncQueues.length > 0) {
      store._syncQueues.splice(store._syncQueues.indexOf(this._syncQueue), 1);
    }
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

      if (!store._definedProperties) {
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
      }

      return { state, properties };
    }, { state: {}, properties: {} });

    // Initialize state
    this._syncQueue.push(state);

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
    if (!store._definedProperties) {
      Object.defineProperties(store, properties);
      store._definedProperties = true;
    }
  }

  componentWillUnmount () {
    clearInterval(this._queueInterval);
  }

  render () {
    const { View, store, ...rest } = this.props;
    if (!View || !store || !this.state) return null;
    return (
      <View
        {...rest}
        {...this.state}
        {...this.actions}
      />
    );
  }
}