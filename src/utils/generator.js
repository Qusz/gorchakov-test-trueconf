const queueIterator = function* (arr) {
  for (let i = 0; i < arr.length; i++) {
    yield arr[i];
  }
}

export default queueIterator;