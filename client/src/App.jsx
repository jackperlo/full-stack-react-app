import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Office from './Components/Office';
//import BackOffice from './Components/BackOffice';
import PageManagement from './Components/PageManagement';
import LoginForm from './Components/LoginForm';
import EditSiteName from './Components/EditSiteName';
import DefaultRoute from './Components/DefaultRoute';

import API from './API';
import dayjs from 'dayjs';

function App() {
  const [siteName, setSiteName] = useState('');

  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(undefined);

  const [initialLoading, setInitialLoading] = useState(true);
  const [pages, setPages] = useState([]);
  const [dirty, setDirty] = useState(true);
  const [pageManaged, setPageManaged] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const siteName = await API.getSiteName();
        setSiteName(siteName.name);
        const user = await API.getUserInfo();
        setUser(user);
        setLoggedIn(true);
        setDirty(true);
      } catch (err) { }
    };
    checkAuth();
  }, []);

  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser(undefined);
    setDirty(true);
  }

  const loginSuccessful = (user) => {
    setUser(user);
    setLoggedIn(true);
  }

  const handleError = (err) => {
    let msg = "";
    if (err.error) msg = err.error;
    else if (String(err) === "string") msg = String(err);
    else msg = "Unknown Error";
    setErrorMsg(msg);
  };

  const addPageToDB = (page) => {
    // Create a new temporary id, waiting for a truly unique id that can only be supplied by the server
    // This temporary id will be replaced when the server will provide its id.
    /* PAGE */
    const newTempPageId = Math.max(...pages.map((page) => page.id)) + 1;
    page.id = newTempPageId;
    page.status = 'added';    
    page.creation_date = dayjs().format('YYYY-MM-DD');
    if (user.role !== 'Admin') {
      page.author_name = user.name;
      page.author_surname = user.surname;
    }

    /* CONTENTS */
    let lastUsedContentID = 0;
    pages.forEach(page => {
      page.contents.forEach(content => {
        if (content.id > lastUsedContentID)
          lastUsedContentID = content.id;
      });
    });

    let atLeastAnImage = false;
    page.contents.forEach(content => {
      content.page_id = newTempPageId;
      content.id = lastUsedContentID + 1;
      lastUsedContentID++;

      if (content.image_type == 1)
        atLeastAnImage = true;
    });

    setPages((pages) => [page, ...pages]);
   

    setPageManaged(true);
    if (atLeastAnImage) {
      //making a deep copy. This is due to the fact that the "Preview" of the new page needs the url to the image,
      //while the page to send to the server needs the corresponding Id to add it in the DB
      let pageToSend = JSON.parse(JSON.stringify(page));
      API.getImages()
        .then(images => {
          pageToSend.contents.forEach(content => {
            if (content.image_type == 1)
              images.forEach(image => {
                if (image.name === content.image_content) {
                  content.image_content = image.id;
                  return;
                }
              })
          });
          API.addPage(pageToSend)
            .then(() => {
              setPageManaged(false);
              setDirty(true);
            })
            .catch((err) => handleError(err));
        })
        .catch((err) => handleError(err));
    } else {
      API.addPage(page)
        .then(() => {
          setPageManaged(false);
          setDirty(true);
        })
        .catch((err) => handleError(err));
    }
  }

  const deletePage = (pageID) => {
    setPages((pages) => pages.map(page => page.id !== pageID ? page : Object.assign({}, page, { status: 'deleted' })));
    setPageManaged(true);
    API.deletePage(pageID)
      .then(() => {
        setPageManaged(false);
        setDirty(true);
      })
      .catch((err) => handleError(err));
  }

  const editPage = (editedPage) => {
    // Create a new temporary id, waiting for a truly unique id that can only be supplied by the server
    // This temporary id will be replaced when the server will provide its id.
    /* PAGE */
    editedPage.status = 'updated';
    editedPage.creation_date = dayjs().format('YYYY-MM-DD');
    if (user.role !== 'Admin') {
      editedPage.author_name = user.name;
      editedPage.author_surname = user.surname;
    }

    /* CONTENTS: this is due to the fact that the user could have added/removed some contents*/
    let lastUsedContentID = 0;
    pages.forEach(page => {
      page.contents.forEach(content => {
        if (content.id > lastUsedContentID)
          lastUsedContentID = content.id;
      });
    });
    let atLeastAnImage = false;
    editedPage.contents.forEach(content => {
      content.page_id = editedPage.id;
      content.id = lastUsedContentID + 1;
      lastUsedContentID++;
      if (content.image_type == 1)
        atLeastAnImage = true;
    });

    setPages((pages) => [editedPage, ...pages.filter((page) => page.id != editedPage.id ? page : null)]); //remove edited page (old version) from list adding the new version

    setPageManaged(true);
    if (atLeastAnImage) {
      //making a deep copy. This is due to the fact that the "Preview" of the edited page needs the url to the image,
      //while the page to send to the server needs the corresponding Id to add it in the DB
      let pageToSend = JSON.parse(JSON.stringify(editedPage));
      API.getImages()
        .then(images => {
          pageToSend.contents.forEach(content => {
            if (content.image_type == 1)
              images.forEach(image => {
                if (image.name === content.image_content) {
                  content.image_content = image.id;
                  return;
                }
              })
          });
          API.editPage(pageToSend)
            .then(() => {
              setPageManaged(false);
              setDirty(true);
            })
            .catch((err) => handleError(err));
        })
        .catch((err) => handleError(err));
    } else {
      API.editPage(editedPage)
        .then(() => {
          setPageManaged(false);
          setDirty(true);
        })
        .catch((err) => handleError(err));
    }
  }

  const editSiteName = (value) => {
    API.editSiteName(value)
      .then(() => {
        API.getSiteName()
          .then((site) => setSiteName(site.name))
          .catch((err) => handleError(err));
      })
      .catch((err) => handleError(err));
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={
          <Office
            siteName={siteName}
            user={user} logout={doLogOut}
            initialLoading={initialLoading} setInitialLoading={(value) => setInitialLoading(value)}
            errorMsg={errorMsg} setErrorMsg={(value => setErrorMsg(value))} handleError={(err) => handleError(err)}
            pages={pages} setPages={(pages) => setPages(pages)}
            pageManaged={pageManaged} setPageManaged={(value) => setPageManaged(value)}
            dirty={dirty} setDirty={(value) => setDirty(value)}
            setSiteName={(value) => setSiteName(value)}
          />}
        />
        <Route path='/backOffice' element={
          loggedIn ?
            <Office
              siteName={siteName}
              user={user} logout={doLogOut}
              initialLoading={initialLoading} setInitialLoading={(value) => setInitialLoading(value)}
              errorMsg={errorMsg} setErrorMsg={(value => setErrorMsg(value))} handleError={(err) => handleError(err)}
              pages={pages} setPages={(pages) => setPages(pages)}
              pageManaged={pageManaged} setPageManaged={(value) => setPageManaged(value)}
              dirty={dirty} setDirty={(value) => setDirty(value)}
              setSiteName={(value) => setSiteName(value)}
              deletePage={(pageID) => deletePage(pageID)}
            />
            : <Navigate replace to='/' />}
        />
        <Route path='/addPage' element={
          loggedIn ?
            pageManaged ?
              <Navigate replace to='/backOffice' />
              :
              <PageManagement
                siteName={siteName}
                user={user} logout={doLogOut}
                initialLoading={initialLoading}
                addPageToDB={(page) => addPageToDB(page)}
              />
            : <Navigate replace to='/' />}
        />
        <Route path='/editPage/:pageId' element={
          loggedIn ?
            pageManaged ?
              <Navigate replace to='/backOffice' />
              :
              <PageManagement
                siteName={siteName}
                user={user} logout={doLogOut}
                initialLoading={initialLoading}
                pages={pages}
                editPage={(page) => editPage(page)}
              />
            : <Navigate replace to='/' />}
        />
        <Route path='/login' element={
          loggedIn ?
            <Navigate replace to='/' />
            : <LoginForm loginSuccessful={loginSuccessful} siteName={siteName} />
        }
        />
        <Route path='/editSiteName' element={
          loggedIn && user && user.role === 'Admin' ?
            <EditSiteName user={user} logout={doLogOut} siteName={siteName} setSiteName={(value) => editSiteName(value)} />
            : <Navigate replace to='/' />
        }
        />
        <Route path='/*' element={<DefaultRoute />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App