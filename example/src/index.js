import React from 'react';
import { render } from 'react-dom';
import Connector from '../../lib';
import List from './List';
import ListStore from './ListStore';
import { CounterView, CounterStore } from './Counter';

const listStore = new ListStore();
const counterStore = new CounterStore();

const counter = (
  <div>
    <Connector
      View={CounterView}
      store={[counterStore, listStore]}
      label="Header Counter"
      flushKeys={['newItemText']}
    />
    <Connector
      View={List}
      store={listStore}
      title="Todo List"
      flushKeys={['newItemText']}
    />
    <Connector
      View={CounterView}
      store={[counterStore, listStore]}
      label="Footer Counter"
      flushKeys={['newItemText']}
    />
  </div>
);

const TestView = ({ count, onInc, onAsyncInc }) => {
  return (
    <div>
      <span>{count}</span>
      <button onClick={onInc}>+</button>
    </div>
  );
};

class TestStore {
  count = 10;

  inc() {
    this.count += 1;
    this.count += 1;
  }

  asyncInc() {
    setTimeout(() => {
      this.count += 1;
      this.count += 1;
    }, 1000);
  }

  __binding() {
    console.log('binding');
  }
}

render(counter, document.getElementById('root'));
render(<Connector View={TestView} store={new TestStore()}/>, document.getElementById('root2'));
