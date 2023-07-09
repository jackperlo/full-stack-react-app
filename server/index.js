'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const { check, validationResult } = require('express-validator'); // validation middleware
const dao = require('./dao'); // module for accessing the DB
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions
const userDao = require('./user-dao'); // module for accessing the user info in the DB
const cors = require('cors');
const path = require('path'); //module for accessing public images stored on server
const fs = require('fs'); //module to list the public folder content
const dayjs = require("dayjs");

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function (username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username and/or password.' });

      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});

// init express
const app = express();
const port = 3001;

// set-up the middlewares

app.use(morgan('dev'));
app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions)); // NB: Usare solo per sviluppo e per l'esame! Altrimenti indicare dominio e porta corretti
app.use('/public/images', express.static(path.join(__dirname, 'public/images')))

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated())
    return next();

  return res.status(401).json({ error: 'Not authenticated' });
}

// set up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: 'wge8d239bwd93rkskb',   //personalize this random string, should be a secret value
  resave: false,
  saveUninitialized: false
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());

/*** Utility Functions ***/

// This function is used to format express-validator errors as strings
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};

/*** APIs ***/

// GET /api/siteName
app.get('/api/siteName', async (req, res) => {
  try {
    const siteName = await dao.getSiteName();
    res.json(siteName);  // NB: list of contents can also be an empty array
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

// PUT /api/siteName
app.put('/api/siteName', isLoggedIn, [ 
  check('name').isLength({min: 1}) 
], async (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter); // format error message
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
  }
  if (req.user.role !== 'Admin') {
    return res.status(422).json({errors: 'Permession Denied'});
  }

  dao.editSiteName(req.body.name)
    .then(() => res.json({}))
    .catch((err) => {
      console.log(err);
      res.status(503).json({ error: `Database error during the updating of the site name.`});
    });  
});

// GET /api/images
app.get('/api/images', isLoggedIn, async (req, res) => {
  try {
    const images = await dao.getImages();
    res.status(201).json(images);  // NB: list of authors can also be an empty array
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

// GET /api/authors
app.get('/api/authors', isLoggedIn, async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(422).json({errors: 'Permession Denied'});
  }

  try {
    const authors = await dao.getAuthors();
    console.log(authors);
    res.status(200).json(authors);  // NB: list of authors can also be an empty array
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

// GET /api/pages/published
app.get('/api/pages/published', async (req, res) => {
  dao.getPublishedPages()
    .then(pages => {
      let vecPromise = [];
      pages.map((page) => vecPromise.push(dao.getPageContents(page.id)));
      Promise.all(vecPromise)
        .then((contents) => {
          pages.map((page, i) => {
            page.contents = contents[i];
          });
          res.json(pages);
        })
        .catch((err) => {
          console.log(err);
          res.status(503).json({ error: `Database error while retreiving of published pages.`});
        });
    })
    .catch((err) => { 
      console.log(err);
      res.status(500).end();
    });
});

// GET /api/pages
app.get('/api/pages', isLoggedIn, async (req, res) => {
  dao.getAllPages()
    .then(pages => {
      let vecPromise = [];
      pages.map((page) => vecPromise.push(dao.getPageContents(page.id)));
      Promise.all(vecPromise)
        .then((c) => {
          pages.map((p, i) => p.contents = c[i]);
          res.json(pages);
        })
        .catch((err) => {
          console.log(err);
          res.status(503).json({ error: `Database error while retreiving of all pages.`});
        });
    })
    .catch((err) => { 
      console.log(err);
      res.status(500).end();
    });
});

async function validateContents(page){
  let validContents = true;
  let nHeaders = 0, nParagraphs = 0, nImages = 0;
  let positionArray = Array(page.contents.length).fill(0);

  //check validity of each content
  const images = await dao.getImages();
  page.contents.forEach(content => {
    if(content.header_type === 1){
      nHeaders++;
      if(content.header_content === "")
        validContents = false;
    }else if(content.paragraph_type === 1){
      nParagraphs++;
      if(content.paragraph_content === "")
        validContents = false;
    }else if(content.image_type === 1){
      nImages++;
      validContents = validContents && images.some((image) => image.id === content.image_content)
    }

    if(!isNaN(parseInt(content.position)))
      positionArray[content.position] = 1;
    else
      validContents = false;
  });
  
  //check minimum contents block constraints
  if(nHeaders < 1 || (nParagraphs+nImages < 1))
    validContents = false;
  //check that the page author(and so the contents author) exists and is provided by the client
  if(isNaN(parseInt(page.author_id)))
    validContents = false;
  else {
    const authors = await dao.getAuthors();
    validContents = validContents && authors.some((author) => author.id == page.author_id);
  }
  
  //check positions 
  let sum = 0;
  for(let i=0; i<positionArray.length; i++)
    sum+=positionArray[i];
  if (sum !== page.contents.length)
    validContents = false;
   
  return validContents;
}

// POST /api/pages
app.post('/api/pages', isLoggedIn, 
[ 
  check('title').isLength({min: 1}),
  check('contents').isArray(),
  check('publication_date').exists().isString({format: 'YYYY-MM-DD', strictMode: true})
], async (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter); // format error message
  if (!errors.isEmpty()) 
    return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
  
  let page = req.body;
  if(req.user.role !== 'Admin')
    page.author_id = req.user.id;
  page.creation_date = dayjs().format('YYYY-MM-DD');

  let validationRes = await validateContents(page);
  if(!validationRes)
    return res.status(422).json({ error: "invalid page content" });

  dao.createPage(page)
    .then(pageId => {
      let vecPromise = [];
      page.contents.map((content) => {vecPromise.push(dao.createContent(content, pageId, page.author_id))});
      Promise.all(vecPromise)
        .then((c) => {
          res.status(201).json(pageId);
          //delayed version: setTimeout(()=>res.json(pageId), answerDelay);
        })
        .catch((err) => {
          console.log(err);
          res.status(503).json({ error: `Database error during the creation of content of page ${page.title} by ${req.user.surname} ${req.user.name}.`});
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(503).json({ error: `Database error during the creation of page ${page.title} by ${req.user.surname} ${req.user.name}.`});
    });
});

// PUT /api/pages/:id
app.put('/api/pages/:id', isLoggedIn, [
  check('title').isLength({min: 1}),
  check('contents').isArray(),
  check('creation_date').exists().isString({format: 'YYYY-MM-DD', strictMode: true}),
  check('publication_date').exists().isString({format: 'YYYY-MM-DD', strictMode: true})
], async (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter); // format error message
  if (!errors.isEmpty()) 
    return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together

  let page = req.body;
  page.id = req.params.id;
  if(req.user.role !== 'Admin')
    page.author_id = req.user.id;
  page.creation_date = dayjs().format('YYYY-MM-DD');

  console.log(page);
  let validationRes = await validateContents(page);
  if(!validationRes)
    return res.status(422).json({ error: "invalid page content" });

  if(req.user.role === 'Admin'){ //no double check over the user who made the request
    dao.deleteContentForAdmin(req.params.id)
      .then(nChanged => {
        dao.deletePageForAdmin(req.params.id)
          .then(nChanged => {
            dao.createPage(page)
              .then(pageId => {
                let vecPromise = [];
                page.contents.map((content) => {vecPromise.push(dao.createContent(content, pageId, page.author_id))});
                Promise.all(vecPromise)
                  .then((c) => {
                    res.status(201).json(pageId);
                    //delayed version: setTimeout(()=>res.json(pageId), answerDelay);
                  })
                  .catch((err) => {
                    console.log(err);
                    res.status(503).json({ error: `Database error during the creation of content of page ${page.title} by ${req.user.surname} ${req.user.name}.`});
                  });
              })
              .catch((err) => {
                console.log(err);
                res.status(503).json({ error: `Database error during the creation of page ${page.title} by ${req.user.surname} ${req.user.name}.`});
              });
          })
          .catch((err) => {
            console.log(err);
            res.status(503).json({ error: `Database error during the deletion of page ${req.params.id} content.`});
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(503).json({ error: `Database error during the deletion of page ${req.params.id}.`});
      });
  }else{
    dao.deleteContent(req.params.id, req.user.id)
      .then(nChanged => {
        dao.deletePage(req.params.id, req.user.id)
          .then(nChanged => {
            dao.createPage(page)
              .then(pageId => {
                let vecPromise = [];
                page.contents.map((content) => {vecPromise.push(dao.createContent(content, pageId, page.author_id))});
                Promise.all(vecPromise)
                  .then((c) => {
                    res.json(pageId);
                    //delayed version: setTimeout(()=>res.json(pageId), answerDelay);
                  })
                  .catch((err) => {
                    console.log(err);
                    res.status(503).json({ error: `Database error during the creation of content of page ${page.title} by ${req.user.surname} ${req.user.name}.`});
                  });
              })
              .catch((err) => {
                console.log(err);
                res.status(503).json({ error: `Database error during the creation of page ${page.title} by ${req.user.surname} ${req.user.name}.`});
              });
          })
          .catch((err) => {
            console.log(err);
            res.status(503).json({ error: `Database error during the deletion of page ${req.params.id} content.`});
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(503).json({ error: `Database error during the deletion of page ${req.params.id}.`});
      });
  }
});

// DELETE /api/pages/<id>
app.delete('/api/pages/:id', isLoggedIn, async (req, res) => {
  if(req.user.role === 'Admin'){ //no double check over the user who made the request
    dao.deleteContentForAdmin(req.params.id) //delete which does not double check the author of the content
    .then(nContentChanged => {
      dao.deletePageForAdmin(req.params.id) //delete which does not double check the author of the page
      .then(nPagesChanged => {
        res.status(200).json(nPagesChanged+nContentChanged);
        //delayed version: setTimeout(()=>res.json(nChanged), answerDelay);
      })
      .catch((err) => {
        console.log(err);
        res.status(503).json({ error: `Database error during the deletion of content of page ${req.params.id}.`});
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(503).json({ error: `Database error during the deletion of page ${req.params.id}.`});
    });
  }else{
    dao.deleteContent(req.params.id, req.user.id)
    .then(nContentChanged => {
      dao.deletePage(req.params.id, req.user.id)
      .then(nPagesChanged => {
        res.status(200).json(nPagesChanged+nContentChanged);
        //delayed version: setTimeout(()=>res.json(nChanged), answerDelay);
      })
      .catch((err) => {
        console.log(err);
        res.status(503).json({ error: `Database error during the deletion of content of page ${req.params.id}.`});
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(503).json({ error: `Database error during the deletion of page ${req.params.id}.`});
    });
  }
});

/*** Users APIs ***/

// POST /sessions 
// login
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err)
        return next(err);

      // req.user contains the authenticated user, we send all the user info back
      // this is coming from userDao.getUser()
      return res.json(req.user);
    });
  })(req, res, next);
});

// DELETE /sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(201).json(req.user);
  }
  else
    res.status(401).json({ error: 'Unauthenticated user!' });
});

/*** Other express-related instructions ***/

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
