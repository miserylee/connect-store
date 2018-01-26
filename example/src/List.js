import React from 'react';
import Connector from '../../src';

const ItemView = ({ text, finished, onRemove, onUpdateText, onToggleFinish }) => {
  return (
    <li>
      <input type="checkbox" checked={finished} onChange={onToggleFinish}/>
      <input value={text} onChange={e => onUpdateText(e.target.value)}/>
      <button onClick={onRemove}>-</button>
    </li>
  );
};

const List = function ({ title, items, newItemText, onAdd, onUpdateNewItemText, onRemove }) {
  return (
    <div>
      <h2>{title}</h2>
      <ul>{items.map(itemStore => {
        if (!itemStore.remove) {
          itemStore.remove = _ => onRemove(itemStore);
        }
        return (
          <Connector
            key={itemStore._id}
            View={ItemView}
            store={itemStore}
          />
        );
      })}</ul>
      <input value={newItemText} onChange={e => onUpdateNewItemText(e.target.value)}/>
      <button onClick={onAdd}>+</button>
    </div>
  );
};

export default List;