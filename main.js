// Mendefinisikan konstanta dan variabel global
const STORAGE_KEY = "BOOKSHELF_APPS";
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const SEARCH_EVENT = "search-book";
const EDIT_EVENT = "edit-book";
let books = [];
let isEditing = false;
let bookIdToEdit = null;

// Fungsi untuk membuat ID unik menggunakan timestamp
function generateId() {
  return +new Date();
}

// Fungsi untuk memeriksa apakah browser mendukung localStorage
function isStorageAvailable() {
  if (typeof(Storage) === undefined) {
    alert("Browser Anda tidak mendukung local storage");
    return false;
  }
  return true;
}

// Fungsi untuk menyimpan data buku ke localStorage
function saveData() {
  if (isStorageAvailable()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

// Fungsi untuk memuat data buku dari localStorage
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  
  if (serializedData !== null) {
    const data = JSON.parse(serializedData);
    
    if (data !== null) {
      books = data;
    }
    
    document.dispatchEvent(new Event(RENDER_EVENT));
  }
}

// Fungsi untuk membuat objek buku baru
function makeBook(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete
  };
}

// Fungsi untuk menemukan buku berdasarkan ID
function findBook(bookId) {
  return books.find(book => book.id === bookId);
}

// Fungsi untuk menemukan indeks buku berdasarkan ID
function findBookIndex(bookId) {
  return books.findIndex(book => book.id === bookId);
}

// Fungsi untuk membuat elemen HTML untuk buku
function createBookElement(bookObject) {
  const bookTitle = document.createElement("h3");
  bookTitle.innerText = bookObject.title;
  bookTitle.setAttribute("data-testid", "bookItemTitle");

  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = `Penulis: ${bookObject.author}`;
  bookAuthor.setAttribute("data-testid", "bookItemAuthor");

  const bookYear = document.createElement("p");
  bookYear.innerText = `Tahun: ${bookObject.year}`;
  bookYear.setAttribute("data-testid", "bookItemYear");

  const actionContainer = document.createElement("div");
  
  const toggleButton = document.createElement("button");
  toggleButton.setAttribute("data-testid", "bookItemIsCompleteButton");
  
  if (bookObject.isComplete) {
    toggleButton.innerText = "Belum selesai dibaca";
  } else {
    toggleButton.innerText = "Selesai dibaca";
  }
  
  toggleButton.addEventListener("click", function() {
    toggleBookStatus(bookObject.id);
  });
  
  const deleteButton = document.createElement("button");
  deleteButton.innerText = "Hapus Buku";
  deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
  deleteButton.addEventListener("click", function() {
    if (confirm("Apakah Anda yakin ingin menghapus buku ini?")) {
      removeBook(bookObject.id);
    }
  });
  
  const editButton = document.createElement("button");
  editButton.innerText = "Edit Buku";
  editButton.setAttribute("data-testid", "bookItemEditButton");
  editButton.addEventListener("click", function() {
    editBook(bookObject.id);
  });
  
  actionContainer.append(toggleButton, deleteButton, editButton);
  
  const bookItem = document.createElement("div");
  bookItem.classList.add("book-item");
  bookItem.setAttribute("data-bookid", bookObject.id);
  bookItem.setAttribute("data-testid", "bookItem");
  bookItem.append(bookTitle, bookAuthor, bookYear, actionContainer);
  
  return bookItem;
}

// Fungsi untuk menambahkan buku baru
function addBook() {
  const bookTitle = document.getElementById("bookFormTitle").value;
  const bookAuthor = document.getElementById("bookFormAuthor").value;
  const bookYear = parseInt(document.getElementById("bookFormYear").value);
  const isComplete = document.getElementById("bookFormIsComplete").checked;
  
  const id = isEditing ? bookIdToEdit : generateId();
  const bookObject = makeBook(id, bookTitle, bookAuthor, bookYear, isComplete);
  
  if (isEditing) {
    // Update buku yang sudah ada
    const index = findBookIndex(id);
    if (index !== -1) {
      books[index] = bookObject;
      isEditing = false;
      bookIdToEdit = null;
      
      // Update teks tombol submit
      const submitButton = document.getElementById("bookFormSubmit");
      const submitSpan = submitButton.querySelector("span");
      submitSpan.innerText = isComplete ? "Selesai dibaca" : "Belum selesai dibaca";
      
      saveData();
      document.dispatchEvent(new Event(RENDER_EVENT));
      resetForm();
    }
  } else {
    // Tambah buku baru
    books.push(bookObject);
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
    resetForm();
  }
}

// Fungsi untuk mereset form
function resetForm() {
  document.getElementById("bookForm").reset();
  
  // Reset tombol submit
  const submitButton = document.getElementById("bookFormSubmit");
  const submitSpan = submitButton.querySelector("span");
  submitSpan.innerText = "Belum selesai dibaca";
  
  isEditing = false;
  bookIdToEdit = null;
}

// Fungsi untuk menghapus buku
function removeBook(bookId) {
  const bookIndex = findBookIndex(bookId);
  
  if (bookIndex !== -1) {
    books.splice(bookIndex, 1);
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
  }
}

// Fungsi untuk toggle status buku (selesai/belum selesai)
function toggleBookStatus(bookId) {
  const bookTarget = findBook(bookId);
  
  if (bookTarget) {
    bookTarget.isComplete = !bookTarget.isComplete;
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
  }
}

// Fungsi untuk mengedit buku
function editBook(bookId) {
  const bookTarget = findBook(bookId);
  
  if (bookTarget) {
    // Isi form dengan data buku
    document.getElementById("bookFormTitle").value = bookTarget.title;
    document.getElementById("bookFormAuthor").value = bookTarget.author;
    document.getElementById("bookFormYear").value = bookTarget.year;
    document.getElementById("bookFormIsComplete").checked = bookTarget.isComplete;
    
    // Ubah teks tombol submit
    const submitButton = document.getElementById("bookFormSubmit");
    const submitSpan = submitButton.querySelector("span");
    submitSpan.innerText = bookTarget.isComplete ? "Selesai dibaca" : "Belum selesai dibaca";
    
    // Gulir ke form
    document.getElementById("bookForm").scrollIntoView({behavior: "smooth"});
    
    // Set flag editing dan ID buku yang diedit
    isEditing = true;
    bookIdToEdit = bookId;
    
    document.dispatchEvent(new Event(EDIT_EVENT));
  }
}

// Fungsi untuk mencari buku
function searchBooks() {
  const query = document.getElementById("searchBookTitle").value.toLowerCase();
  
  if (query) {
    const filteredBooks = books.filter(book => 
      book.title.toLowerCase().includes(query)
    );
    
    document.dispatchEvent(new CustomEvent(SEARCH_EVENT, {
      detail: {
        books: filteredBooks
      }
    }));
  } else {
    document.dispatchEvent(new Event(RENDER_EVENT));
  }
}

// Fungsi untuk menampilkan buku di rak
function renderBooks(booksToRender = null) {
  const incompleteBookshelfList = document.getElementById("incompleteBookList");
  const completeBookshelfList = document.getElementById("completeBookList");
  
  // Kosongkan kedua rak
  incompleteBookshelfList.innerHTML = "";
  completeBookshelfList.innerHTML = "";
  
  const booksData = booksToRender || books;
  
  for (const book of booksData) {
    const bookElement = createBookElement(book);
    
    if (book.isComplete) {
      completeBookshelfList.append(bookElement);
    } else {
      incompleteBookshelfList.append(bookElement);
    }
  }
}

// Event listener saat DOM sudah dimuat
document.addEventListener("DOMContentLoaded", function() {
  // Form untuk menambah buku
  const bookForm = document.getElementById("bookForm");
  
  // Form untuk pencarian
  const searchForm = document.getElementById("searchBook");
  
  // Reset form jika sedang dalam mode edit ketika halaman dimuat
  resetForm();
  
  // Event listener untuk submit form buku
  bookForm.addEventListener("submit", function(event) {
    event.preventDefault();
    addBook();
  });
  
  // Event listener untuk checkbox IsComplete
  const checkboxIsComplete = document.getElementById("bookFormIsComplete");
  const submitButton = document.getElementById("bookFormSubmit");
  const submitSpan = submitButton.querySelector("span");
  
  checkboxIsComplete.addEventListener("change", function() {
    submitSpan.innerText = checkboxIsComplete.checked ? "Selesai dibaca" : "Belum selesai dibaca";
  });
  
  // Event listener untuk form pencarian
  searchForm.addEventListener("submit", function(event) {
    event.preventDefault();
    searchBooks();
  });
  
  // Custom event untuk render buku
  document.addEventListener(RENDER_EVENT, function() {
    renderBooks();
  });
  
  // Custom event untuk pencarian buku
  document.addEventListener(SEARCH_EVENT, function(event) {
    renderBooks(event.detail.books);
  });
  
  // Muat data dari localStorage jika tersedia
  if (isStorageAvailable()) {
    loadDataFromStorage();
  }
});