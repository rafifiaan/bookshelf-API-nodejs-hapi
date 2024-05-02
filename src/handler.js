// eslint-disable-next-line import/no-extraneous-dependencies
const { nanoid } = require('nanoid');

const bookshelf = require('./bookshelf');

const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading = true
  } = request.payload;

  const insertedAt = new Date().toISOString();
  const id = nanoid(16);

  const book = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished: Number(pageCount) === Number(readPage),
    reading,
    insertedAt,
    updatedAt: insertedAt
  };

  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku'
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount'
    });
    response.code(400);
    return response;
  }

  bookshelf.push(book);

  const response = h.response({
    status: 'success',
    message: 'Buku berhasil ditambahkan',
    data: {
      bookId: id
    }
  });
  response.code(201);
  return response;
};

const getAllBooksHandler = (request) => {
  const { name: bookName, reading, finished } = request.query;

  const filteredBook = bookshelf.map(({ id, name, publisher }) => ({
    id,
    name,
    publisher
  }));

  const arrNotReadingBooks = bookshelf
    .filter((book) => book.reading === false)
    .map(({ id, name, publisher }) => ({
      id,
      name,
      publisher
    }));

  const arrReadingBooks = bookshelf
    .filter((book) => book.reading === true)
    .map(({ id, name, publisher }) => ({
      id,
      name,
      publisher
    }));

  const arrFinishedBooks = bookshelf
    .filter((book) => book.finished === true)
    .map(({ id, name, publisher }) => ({
      id,
      name,
      publisher
    }));

  const arrNotFinishedBooks = bookshelf
    .filter((book) => book.finished === false)
    .map(({ id, name, publisher }) => ({
      id,
      name,
      publisher
    }));

  if (bookName) {
    const filterByNameBooks = bookshelf
      .filter((book) => book.name.toLowerCase().includes(bookName?.toLowerCase()))
      .map(({ id, name, publisher }) => ({ id, name, publisher }));

    return {
      status: 'success',
      data: {
        books: filterByNameBooks
      }
    };
  }

  if (reading) {
    if (reading === '1') {
      return { status: 'success', data: { books: arrNotReadingBooks } };
    }

    if (reading === '0') {
      return { status: 'success', data: { books: arrReadingBooks } };
    }
  }

  if (finished) {
    if (finished === '1') {
      return { status: 'success', data: { books: arrFinishedBooks } };
    }
    if (finished === '0') {
      return { status: 'success', data: { books: arrNotFinishedBooks } };
    }
  }

  const result = {
    status: 'success',
    data: { books: filteredBook }
  };

  return result;
};

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const foundBook = bookshelf.filter((book) => book.id === bookId)[0];

  if (!foundBook) {
    const response = h.response({
      status: 'fail',
      message: 'Buku tidak ditemukan'
    });
    response.code(404);
    return response;
  }

  return {
    status: 'success',
    data: { book: foundBook }
  };
};

const editBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading = true
  } = request.payload;

  const book = bookshelf.filter((item) => item.id === bookId)[0];
  const index = bookshelf.findIndex((item) => item.id === bookId);
  const updatedAt = new Date().toISOString();

  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku'
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount'
    });
    response.code(400);
    return response;
  }

  if (!book) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Id tidak ditemukan'
    });
    response.code(404);
    return response;
  }

  bookshelf[index] = {
    ...bookshelf[index],
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
    updatedAt
  };

  const response = {
    status: 'success',
    message: 'Buku berhasil diperbarui'
  };

  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const index = bookshelf.findIndex((item) => item.id === bookId);

  if (index === -1) {
    const response = h.response({
      status: 'fail',
      message: 'Buku gagal dihapus. Id tidak ditemukan'
    });
    response.code(404);
    return response;
  }

  bookshelf.splice(index, 1);
  const response = h.response({
    status: 'success',
    message: 'Buku berhasil dihapus'
  });
  response.code(200);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler
};
