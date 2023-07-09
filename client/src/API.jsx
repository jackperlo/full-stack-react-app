/**
 * All the API calls
 */

const URL = 'http://localhost:3001/api';

/**
 * A utility function for parsing the HTTP response.
 */
function getJson(httpResponsePromise) {
  // server API always return JSON, in case of error the format is the following { error: <message> } 
  return new Promise((resolve, reject) => {
    httpResponsePromise
      .then((response) => {
        if (response.ok) {
         // the server always returns a JSON, even empty {}. Never null or non json, otherwise the method will fail
         response.json()
            .then( json => resolve(json) )
            .catch( err => reject({ error: "Cannot parse server response" }))
        } else {
          // analyzing the cause of error
          response.json()
            .then(obj => reject(obj)) // error msg in the response body
            .catch(err => reject({ error: "Cannot parse server response" })) // something else
        }
      })
      .catch(err => 
        reject({ error: "Cannot communicate"  })
      ) // connection error
  });
}

async function getSiteName() {
  // call  /api/siteName
  return getJson(fetch(URL + '/siteName'))
    .then((siteName) => siteName)
}

async function editSiteName(siteName) {
  // call  POST /api/siteName
  return getJson(
    fetch(URL + '/siteName', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({name: siteName}),
    })
  );
}

async function getImages() {
  // call  /api/images
  return getJson(fetch(URL + '/images', {credentials: 'include'}))
    .then((images) => images)
}

async function getAuthors() {
  // call  /api/authors
  return getJson(fetch(URL+`/authors`, {credentials: 'include'}))
    .then((authors) => authors)
}

async function getPublishedPages() {
  // call  /api/pages/published
  return getJson(fetch(URL + '/pages/published'))
    .then((pages) => 
      pages.map((p) => (
      {
        id: p.id, 
        title: p.title, 
        author_id: p.author_id, 
        creation_date: p.creation_date, 
        publication_date: p.publication_date,
        author_name: p.author_name,
        author_surname: p.author_surname,
        contents: p.contents
      }
    )))
}

async function getAllPages() {
  // call  /api/pages
  return getJson(fetch(URL + '/pages', {credentials: 'include'}))
    .then((pages) => 
      pages.map((p) => (
      {
        id: p.id, 
        title: p.title, 
        author_id: p.author_id, 
        creation_date: p.creation_date, 
        publication_date: p.publication_date,
        author_name: p.author_name,
        author_surname: p.author_surname,
        contents: p.contents
      }
    )))
}

function addPage(page) {
  // call  POST /api/pages
  return getJson(
    fetch(URL+`/pages`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(page),
    })
  );
}

function editPage(page) {
  // call  PUT /api/page/${page.id}
  return getJson(
    fetch(URL+`/pages/${page.id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(page),
    })
  );
}

function deletePage(id) {
  // call  DELETE /api/pages/<id>
  return getJson( 
    fetch(URL+`/pages/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
  );
}

async function logIn(credentials) {
  return getJson(
    fetch(URL + '/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',  // this parameter specifies that authentication cookie must be forwarded
      body: JSON.stringify(credentials),
    })
  );
}

async function logOut() {
  return getJson( 
    fetch(URL + '/sessions/current', {
      method: 'DELETE',
      credentials: 'include'
    })
  );
}

async function getUserInfo() {
  return getJson(
    fetch(URL + '/sessions/current', {
      credentials: 'include'
    })
  );
}

const API = {
  getSiteName, editSiteName, getAuthors, getImages, addPage, editPage, deletePage, getAllPages, getPublishedPages, logIn, logOut, getUserInfo
};
export default API;