import { reactive } from 'vue';

class Queue {
  constructor() {
    this.queue = reactive([]);
  }

  addToQueue(item) {
    if (this.queue.includes(item)) return;
    this.queue.push(item);
  }

  deleteFromQueue(item) {
    const itemIndex = this.queue.indexOf(item);
    this.queue.splice(itemIndex, 1)
  }

  queueIsEmpty() {
    return this.queue.length === 0;
  }
}

export default Queue;