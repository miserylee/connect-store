import uniqid from 'uniqid';

class ItemStore {
  _id = uniqid();

  text = '';
  finished = false;

  constructor (defaultText) {
    this.text = defaultText;
  }

  updateText (text) {
    this.text = text;
  }

  toggleFinish () {
    this.finished = !this.finished;
  }

}

export default class ListStore {
  items = [
    new ItemStore('Hello world!'),
    new ItemStore('Hello world!'),
    new ItemStore('Hello world!'),
    new ItemStore('Hello world!'),
    new ItemStore('Hello world!'),
    new ItemStore('Hello world!'),
    new ItemStore('Hello world!'),
    new ItemStore('Hello world!'),
  ];

  newItemText = '';

  add () {
    if (!this.newItemText) return;
    this.items = [...this.items, new ItemStore(this.newItemText)];
    this.newItemText = '';
  }

  updateNewItemText (text) {
    this.newItemText = text;
  }

  remove (item) {
    this.items.splice(this.items.indexOf(item), 1);
    this.items = [...this.items];
  }
}