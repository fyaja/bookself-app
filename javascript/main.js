const books = [];
const RENDER_EVENT = 'render-todo';
const SAVED_EVENT = 'saved-books';
const STORAGE_KEY = 'book-apps';

const titleElement = document.getElementById('book-title-input');
const authorElement = document.getElementById('book-writer-input');
const yearElement = document.getElementById('publication-year-input');
const checkBoxElement = document.getElementById('check-box-input');

const searchInput = document.getElementById('search-input');
const clearBtn = document.getElementById('clear-search-button');

let search = '';

searchInput.addEventListener('input', handleSearchInput)
clearBtn.addEventListener('click', clearSearch)
document.getElementById('search-btn').addEventListener('click', () => {
  search = document.getElementById('search-input').value.toLowerCase();
  document.dispatchEvent(new Event(RENDER_EVENT));
})

function isStorageExist(){
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function saveData(){
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
 
  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
 
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function handleSearchInput() {
  if (searchInput.value.length > 0) {
    clearBtn.style.display = 'block';
  } else {
    clearBtn.style.display = 'none';
  }
}

function clearSearch() {
  searchInput.value = '';
  search = '';
  clearBtn.style.display = 'none';
  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener('DOMContentLoaded', () => {
  const addBookForm = document.getElementById('form');
  
  addBookForm.addEventListener('submit', (event) => {
    event.preventDefault();
    addBook();
  });
  
  if(isStorageExist()){
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, () => {
  const unreadBooks = document.getElementById('unread-books');
  unreadBooks.innerHTML = '';

  const readBooks = document.getElementById('read-books');
  readBooks.innerHTML = '';

  const booksFiltered = books.filter(
    book => book.title.toLowerCase().includes(search)
  );

  for(const book of booksFiltered){
    const bookElement = makeBook(book);
    if(!book.isCompleted){
      unreadBooks.appendChild(bookElement);
    } else {
      readBooks.appendChild(bookElement);
    }
  }
})

function generateId(){
  return +new Date();
}

function createObject(id, title, author, year, isCompleted){
  return {
    id,
    title,
    author,
    year,
    isCompleted
  }
}

function addBook(){
  const title = titleElement.value;
  const author = authorElement.value;
  const year = yearElement.value.slice(0, 4);
  const checkBox = checkBoxElement.checked;
  
  const id = generateId();
  const boolean = checkBox;

  const bookObject = createObject(id, title, author, year, boolean);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  
  titleElement.value = ''
  authorElement.value = ''
  yearElement.value = ''
  checkBoxElement.checked = false
}


function makeBook(bookObject){
  const textTitle = document.createElement('h3');
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = bookObject.author;

  const textYear = document.createElement('p');
  textYear.innerText = bookObject.year;

  const textDiv = document.createElement('div');
  textDiv.classList.add('book-desc');
  textDiv.append(textTitle, textAuthor, textYear);

  let checkOrUndo;
  if (bookObject.isCompleted) {
    const undoButton = document.createElement('button');
    undoButton.innerHTML = `<i class="ri-arrow-go-back-line"></i>`
    undoButton.classList.add('undo');
    undoButton.addEventListener('click', () => undoBook(bookObject.id));
    checkOrUndo = undoButton;
  } else {
    const checkButton = document.createElement('button');
    checkButton.innerHTML = `<i class="ri-check-line"></i>`
    checkButton.classList.add('check');
    checkButton.addEventListener('click', () => checkBook(bookObject.id));
    checkOrUndo = checkButton;
  }

  const deleteButton = document.createElement('button');
  deleteButton.innerHTML = `<i class="ri-delete-bin-line"></i>`
  deleteButton.classList.add('delete');
  deleteButton.addEventListener('click', () => deleteBook(bookObject.id));

  const buttons = document.createElement('div');
  buttons.classList.add('buttons');
  buttons.append(checkOrUndo, deleteButton);

  const bookDiv = document.createElement('div');
  bookDiv.classList.add('read-container')
  bookDiv.setAttribute("id", `book-${bookObject.id}`);
  bookDiv.append(textDiv, buttons);

  return bookDiv
}

function findBook(id) {
  return books.find(book => book.id === id) || null;
}

function findBookIndex(id) {
  return books.findIndex(book => book.id === id);
}

function checkBook(bookId) {
  const bookFound = findBook(bookId);
 
  if (bookFound == null) return;
 
  bookFound.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
}

function undoBook(bookId){
  const bookFound = findBook(bookId)
  if (bookFound == null) return;
 
  bookFound.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function deleteBook(bookId){
  const bookFound = findBookIndex(bookId);
  
  if (bookFound === -1) return;

  books.splice(bookFound, 1)

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}