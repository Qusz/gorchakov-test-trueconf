const writeToLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
}

const readFromLocalStorage = (key) => {
  if (localStorage.getItem(key) === null) return;
  return localStorage.getItem(key);
}

export { writeToLocalStorage, readFromLocalStorage }