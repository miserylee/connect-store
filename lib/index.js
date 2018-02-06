'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function getMethods(store) {
  var methods = Object.getOwnPropertyNames(store).filter(function (k) {
    return !/^_/.test(k) && typeof Object.getOwnPropertyDescriptor(store, k).value === 'function';
  });
  if (Object.getPrototypeOf(store).constructor.name !== 'Object') {
    var inheritedMethods = getMethods(Object.getPrototypeOf(store));
    inheritedMethods.forEach(function (method) {
      if (!methods.includes(method) && method !== 'constructor' && !/^_/.test(method)) methods.push(method);
    });
  }
  return methods;
}

var Connector = function (_PureComponent) {
  _inherits(Connector, _PureComponent);

  function Connector(props) {
    _classCallCheck(this, Connector);

    // Start sync queue
    var _this = _possibleConstructorReturn(this, (Connector.__proto__ || Object.getPrototypeOf(Connector)).call(this, props));

    _this._syncQueue = [];
    _this._queueInterval = setInterval(function (_) {
      if (_this._syncQueue.length > 0) {
        try {
          _this.setState(Object.assign.apply(Object, _toConsumableArray(_this._syncQueue)));
        } catch (err) {
          console.error(err);
        }
        _this._syncQueue.splice(0);
      }
    });
    return _this;
  }

  _createClass(Connector, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.init(this.props.store);
    }
  }, {
    key: 'componentWillUpdate',
    value: function componentWillUpdate(nextProps) {
      if (nextProps.store !== this.props.store) {
        this.init(nextProps.store, this.props.store);
      }
    }
  }, {
    key: 'init',
    value: function init() {
      var store = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var prevStore = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

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
  }, {
    key: 'unbindStore',
    value: function unbindStore(store) {
      // Unbind sync queue
      if (store._syncQueues && store._syncQueues.length > 0) {
        store._syncQueues.splice(store._syncQueues.indexOf(this._syncQueue), 1);
      }
    }
  }, {
    key: 'bindStore',
    value: function bindStore(store) {
      var keys = Object.getOwnPropertyNames(store).filter(function (k) {
        return !/^_/.test(k);
      });
      var methods = getMethods(store);

      // Bind sync queue
      store._syncQueues = store._syncQueues || [];
      store._syncQueues.push(this._syncQueue);

      var _keys$reduce = keys.reduce(function (_ref, key) {
        var state = _ref.state,
            properties = _ref.properties;

        var privateKey = '_' + key;

        state[key] = store[key];
        store[privateKey] = store[key];

        if (!store._definedProperties) {
          var setter = store.__lookupSetter__(key);
          properties[key] = {
            set: function set(value) {
              setter && setter.bind(this)(value);
              this[privateKey] = value;
              var setState = _defineProperty({}, key, value);
              this._syncQueues.forEach(function (syncQueue) {
                return syncQueue.push(setState);
              });
            },
            get: function get() {
              return this[privateKey];
            }
          };
        }

        return { state: state, properties: properties };
      }, { state: {}, properties: {} }),
          state = _keys$reduce.state,
          properties = _keys$reduce.properties;

      // Initialize state


      this._syncQueue.push(state);

      // Transform actions
      this.actions = _extends({}, this.actions, methods.reduce(function (memo, method) {
        var actionName = 'on' + method.slice(0, 1).toUpperCase() + method.slice(1);
        memo[actionName] = function () {
          store[method].apply(store, arguments);
        };
        return memo;
      }, {}));

      // Define getters/setters
      if (!store._definedProperties) {
        Object.defineProperties(store, properties);
        store._definedProperties = true;
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      clearInterval(this._queueInterval);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          View = _props.View,
          store = _props.store,
          rest = _objectWithoutProperties(_props, ['View', 'store']);

      if (!View || !store || !this.state) return null;
      return _react2.default.createElement(View, _extends({}, rest, this.state, this.actions));
    }
  }]);

  return Connector;
}(_react.PureComponent);

Connector.defaultProps = {
  store: [],
  View: null
};
exports.default = Connector;