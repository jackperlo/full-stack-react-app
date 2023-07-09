'use strict';
/* Data Access Object (DAO) module for accessing pages */

const sqlite = require('sqlite3');

// open the database
const db = new sqlite.Database('cms.sqlite', (err) => {
  if(err) throw err;
});

exports.getSiteName = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT name FROM cms_name';
    db.get(sql, [], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
};

exports.editSiteName = (siteName) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE cms_name SET name = ?';
    db.run(sql, [siteName], function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.changes);
    });
  });
};

// get images
exports.getImages = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM images";
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      //const images = rows.map({name: image.name}));
      resolve(rows);
    });
  });
};

// get authors
exports.getAuthors = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT id, name, surname FROM users";
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const authors = rows.map((author) => ({id: author.id, name: author.name, surname: author.surname}));
      resolve(authors);
    });
  });
};

// get published pages
exports.getPublishedPages = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT pages.*, users.name, users.surname FROM pages, users WHERE JULIANDAY(DATE(\'now\')) - JULIANDAY(DATE(pages.publication_date)) >= 0 and pages.author_id = users.id ORDER BY DATE(pages.publication_date) DESC';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const pages = rows.map((p) => ({id: p.id, title: p.title, author_id: p.author_id, creation_date: p.creation_date, publication_date: p.publication_date, author_name: p.name, author_surname: p.surname}));
      resolve(pages);
    });
  });
};

// get all pages
exports.getAllPages = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT pages.*, users.name, users.surname FROM pages, users WHERE pages.author_id = users.id ORDER BY DATE(pages.publication_date) DESC';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const pages = rows.map((p) => ({id: p.id, title: p.title, author_id: p.author_id, creation_date: p.creation_date, publication_date: p.publication_date, author_name: p.name, author_surname: p.surname}));
      resolve(pages);
    });
  });
};

// get all contents of a given page
exports.getPageContents = (page_id) => {
  return new Promise((resolve, reject) => {
    let sql = 'SELECT contents.*, images.name FROM contents LEFT JOIN images on contents.image_content = images.id WHERE contents.page_id = ?';
    db.all(sql, [page_id], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      const contents = rows.map((c) => {
        if(c.image_type === 1)
          return {
            id: c.id,
            header_type: c.header_type,
            header_content: c.header_content,
            image_type: c.image_type,
            image_content: c.name,
            paragraph_type: c.paragraph_type,
            paragraph_content: c.paragraph_content,
            position: c.position,
            page_id: c.page_id
          };
        else
          return {
            id: c.id,
            header_type: c.header_type,
            header_content: c.header_content,
            image_type: c.image_type,
            image_content: c.image_content,
            paragraph_type: c.paragraph_type,
            paragraph_content: c.paragraph_content,
            position: c.position,
            page_id: c.page_id
          }
      });
      resolve(contents);
    });
  });
};

// add a new page
exports.createPage = (page) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO pages(title, author_id, creation_date, publication_date) VALUES(?, ?, DATE(?), DATE(?))';
    db.run(sql, [page.title, page.author_id, page.creation_date, page.publication_date], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
};

// add a new content
exports.createContent = (content, pageId, authorId) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO contents(header_type, header_content, image_type, image_content, paragraph_type, paragraph_content, position, page_id, author_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.run(sql, [content.header_type, content.header_content, content.image_type, content.image_content, content.paragraph_type, content.paragraph_content, content.position, pageId, authorId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
};

// delete an existing page
exports.deletePage = (pageId, userId) => {
  return new Promise((resolve, reject) => {
    let sql = 'DELETE FROM pages WHERE pages.id = ? and pages.author_id = ?';  // Double-check that the page belongs to the userId
    db.run(sql, [pageId, userId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.changes);
    });
  });
}

// delete an existing content
exports.deleteContent = (pageId, userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM contents WHERE contents.page_id = ? and contents.author_id = ?'; // Double-check that the content belongs to the userId
    db.run(sql, [pageId, userId], function (err) {
      if (err) {
        reject(err);
        return;
      }
    });
    resolve(this.changes);
  });
}

// delete an existing page
exports.deletePageForAdmin = (pageId) => {
  return new Promise((resolve, reject) => {
    let sql = 'DELETE FROM pages WHERE pages.id = ?';  // NO MORE Double-check that the page belongs to the userId
    db.run(sql, [pageId], function (err) {
      if (err) {
        reject(err);  
        return;
      }
      resolve(this.changes);
    });
  });
}

// delete an existing content
exports.deleteContentForAdmin = (pageId) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM contents WHERE contents.page_id = ?'; // NO MORE Double-check that the content belongs to the userId
    db.run(sql, [pageId], function (err) {
      if (err) {
        reject(err);
        return;
      }
    });
    resolve(this.changes);
  });
}