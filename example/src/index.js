import React from 'react';
import { render } from 'react-dom';
import Connector from '../../src';
import List from './List';
import ListStore from './ListStore';
import { CounterView, CounterStore } from './Counter';

const listStore = new ListStore();
const counterStore = new CounterStore();

render(<div>
  <Connector
    View={CounterView}
    store={[counterStore, listStore]}
    label="Header Counter"
  />
  <Connector
    View={List}
    store={listStore}
    title="Todo List"
  />
  <Connector
    View={CounterView}
    store={[counterStore, listStore]}
    label="Footer Counter"
  />
</div>, document.getElementById('root'));
