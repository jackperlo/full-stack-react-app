import 'bootstrap-icons/font/bootstrap-icons.css';
import { Form, Button, Alert, Container, Row, Col, Spinner } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import dayjs from "dayjs";
import CustomNavbar from './Navbar';
import API from '../API';

/* ======================= HEADER FORM COMPONENT ========================= */
function HeaderContent(props) {
  const [errorMessage, setErrorMessage] = useState('');
  return (
    <div className="card" style={{ margin: "0.5%", marginTop: "5%" }}>
      {errorMessage ? <Alert variant='danger' dismissible onClick={() => setErrorMessage('')}>{errorMessage}</Alert> : ''}
      <div className='row'>
        <div className='col-9'>
          <div className="card-body">
            <Form.Group controlId='content'>
              <Form.Label>Header Content</Form.Label>
              <Form.Control as='textarea' type='text' value={props.content.content} onChange={ev => props.updateHeaderContent(ev.target.value)} />
            </Form.Group>
            <Button className='my-2 mx-1' variant='btn btn-outline-dark' disabled={props.isCancelButtonDisabled} onClick={() => props.deleteHeader()}>Cancel Header</Button>
          </div>
        </div>
        <div className='col-3'>
          <Button variant="btn btn-outline-dark" onClick={() => props.changePosition(-1)} style={{ marginTop: '20%', marginBottom: '10%' }} disabled={props.content.upButtonDisabled}><i className='bi bi-arrow-up-circle' /></Button>
          <hr />
          <Button variant="btn btn-outline-dark" onClick={() => props.changePosition(1)} style={{ marginTop: '10%', marginBottom: '20%' }} disabled={props.content.downButtonDisabled}><i className='bi bi-arrow-down-circle' /></Button>
        </div>
      </div>
    </div>
  );
} //TODO: mettere i pulsanti anche per gli altri component poi scrivere il metodo per muovere gli oggetti up and down scambiando gli id;
//a quel punto scrivere le API

/* ======================= PARAGRAPH FORM COMPONENT ========================= */
function ParagraphContent(props) {
  const [errorMessage, setErrorMessage] = useState('');
  return (
    <div className="card" style={{ margin: "0.5%", marginTop: "5%" }}>
      {errorMessage ? <Alert variant='danger' dismissible onClick={() => setErrorMessage('')}>{errorMessage}</Alert> : ''}
      <div className='row'>
        <div className='col-9'>
          <div className="card-body">
            <Form.Group controlId='content'>
              <Form.Label>Paragraph Content</Form.Label>
              <Form.Control as='textarea' type='text' value={props.content.content} onChange={ev => props.updateParagraphContent(ev.target.value)} />
            </Form.Group>
            <Button className='my-2 mx-1' variant='btn btn-outline-dark' disabled={props.isCancelButtonDisabled} onClick={() => props.deleteParagraph()}>Cancel Paragraph</Button>
          </div>
        </div>
        <div className='col-3'>
          <Button variant="btn btn-outline-dark" onClick={() => props.changePosition(-1)} style={{ marginTop: '20%', marginBottom: '10%' }} disabled={props.content.upButtonDisabled}><i className='bi bi-arrow-up-circle' /></Button>
          <hr />
          <Button variant="btn btn-outline-dark" onClick={() => props.changePosition(1)} style={{ marginTop: '10%', marginBottom: '20%' }} disabled={props.content.downButtonDisabled}><i className='bi bi-arrow-down-circle' /></Button>
        </div>
      </div>
    </div>
  );
}

/* ======================= IMAGE FORM COMPONENT ========================= */
function ImageContent(props) {
  const [errorMessage, setErrorMessage] = useState('');
  return (
    <div className="card" style={{ margin: "0.5%", marginTop: "5%" }}>
      {errorMessage ? <Alert variant='danger' dismissible onClick={() => setErrorMessage('')}>{errorMessage}</Alert> : ''}
      <div className='row'>
        <div className='col-9'>
          <div className="card-body">
            <Form.Group controlId="content">
              <Form.Label>Select Image</Form.Label>
              <Form.Control
                as="select"
                value={props.content.content}
                onChange={ev => props.updateImageContent(ev.target.value)}
              >
                {
                  props.images.map((img) => <option value={img.name} key={img.name}>{img.name.split('/').pop()}</option>)
                }
              </Form.Control>
            </Form.Group>
            <Button className='my-2 mx-1' variant='btn btn-outline-dark' disabled={props.isCancelButtonDisabled} onClick={() => props.deleteImage()}>Cancel Image</Button>
          </div>
        </div>
        <div className='col-3'>
          <Button variant="btn btn-outline-dark" onClick={() => props.changePosition(-1)} style={{ marginTop: '20%', marginBottom: '10%' }} disabled={props.content.upButtonDisabled}><i className='bi bi-arrow-up-circle' /></Button>
          <hr />
          <Button variant="btn btn-outline-dark" onClick={() => props.changePosition(1)} style={{ marginTop: '10%', marginBottom: '20%' }} disabled={props.content.downButtonDisabled}><i className='bi bi-arrow-down-circle' /></Button>
        </div>
      </div>
    </div>
  );
}

/* ======================= ADD/EDIT PAGE FORM COMPONENT ========================= */

function PageManagement(props) {
  const { pageId } = useParams();
  const pageToEdit = pageId && props.pages.find(p => p.id === parseInt(pageId));
  const contentsToEdit = pageToEdit && pageToEdit.contents
    .sort((a, b) => a.position - b.position)
    .map((content, index) => {
      let retContent = {};
      retContent.id = content.id;
      retContent.upButtonDisabled = false;
      retContent.downButtonDisabled = false;
      if (content.header_type) {
        retContent.type = 'header';
        retContent.content = content.header_content;
      }
      if (content.image_type) {
        retContent.type = 'image';
        retContent.content = content.image_content;
      }
      if (content.paragraph_type) {
        retContent.type = 'paragraph';
        retContent.content = content.paragraph_content;
      }
      if (index == 0)
        retContent.upButtonDisabled = true;
      if (index == pageToEdit.contents.length - 1)
        retContent.downButtonDisabled = true;

      return retContent;
    });

  const [initialLoading, setInitialLoading] = useState(true);
  const [title, setTitle] = useState(pageToEdit ? pageToEdit.title : '');
  const [publicationDate, setPublicationDate] = useState(pageToEdit ? dayjs(pageToEdit.publication_date).format('YYYY-MM-DD') : '');
  const [authors, setAuthors] = useState([]);
  const [author, setAuthor] = useState(-1);
  const [contents, setContents] = useState(pageToEdit ? contentsToEdit : [{ id: 1, type: 'header', content: 'Write here your header... :)', upButtonDisabled: true, downButtonDisabled: true }]);
  const [errorMessage, setErrorMessage] = useState('');
  const [images, setImages] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    API.getImages()
    .then(images => {
      setErrorMessage('');
      setImages(images.map(image => ({name: image.name})));
      if (props.user.role === 'Admin') {
        API.getAuthors()
          .then(authors => {
            setErrorMessage('');
            setAuthors(authors);
            if (pageToEdit) {
              let index = 0, found=false;
              authors.forEach(author => {
                if (author.id === pageToEdit.author_id) {
                  found = true;
                }
                if(!found)
                  index++;
              });
              setAuthor(authors[index].id);
            } else
              setAuthor(authors[0].id);

            setInitialLoading(false);
          })
          .catch(err => {
            setErrorMessage(err);
          })
      } else {
        setInitialLoading(false);
      }
    })
    .catch(err => {
      setErrorMessage(err);
    })
  }, []);

  const getNewContentID = () => {
    let newID = -1;
    contents.forEach(content => {
      if (content.id + 1 > newID)
        newID = content.id + 1;
    });
    return newID;
  }

  const addNewContent = (type, contentValue) => {
    contents[contents.length - 1].downButtonDisabled = false;
    let newContents = [...contents, { id: getNewContentID(), type: type, content: contentValue, upButtonDisabled: false, downButtonDisabled: true }];
    setContents(newContents);
  }

  const deleteContent = (id) => {
    let i = 0;
    while (i < contents.length) {
      if (contents[i].id == id)
        break;
      i++;
    }
    if (i > -1) {
      let newContents = [...contents];
      newContents.splice(i, 1);
      setContents(newContents);
    }

  }

  const updateContent = (contentID, contentValue) => {
    setContents(
      contents.map((content) => {
        if (content.id == contentID) content.content = contentValue
        return content;
      })
    );
  }

  const changePosition = (newPosition, contentID) => {
    let index = 0;
    while (index < contents.length) {
      if (contents[index].id == contentID)
        break;
      index++;
    }

    if (newPosition == -1) {
      const aus = contents[index];
      contents[index] = contents[index - 1];
      contents[index - 1] = aus;
      contents[index - 1].downButtonDisabled = false;
      index - 1 == 0 ? contents[index - 1].upButtonDisabled = true : contents[index - 1].upButtonDisabled = false
      contents[index].upButtonDisabled = false;
      index == contents.length - 1 ? contents[index].downButtonDisabled = true : contents[index].downButtonDisabled = false
    }
    else {
      const aus = contents[index];
      contents[index] = contents[index + 1];
      contents[index + 1] = aus;
      contents[index + 1].upButtonDisabled = false;
      index + 1 == contents.length - 1 ? contents[index + 1].downButtonDisabled = true : contents[index + 1].downButtonDisabled = false
      contents[index].downButtonDisabled = false;
      index == 0 ? contents[index].upButtonDisabled = true : contents[index].upButtonDisabled = false
    }

    setContents([...contents]);
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage('');

    let newContents = [];
    contents.forEach((c, index) => {
      let { downButtonDisabled, upButtonDisabled, type, content, ...newContent } = c; //deleting the two properties down/upButtonDisabled, type and content from content
      switch (c.type) {
        case 'header':
          newContent.header_type = 1;
          newContent.header_content = c.content;
          newContent.image_type = 0;
          newContent.image_content = '';
          newContent.paragraph_type = 0;
          newContent.paragraph_content = '';
          break;
        case 'paragraph':
          newContent.header_type = 0;
          newContent.header_content = '';
          newContent.image_type = 0;
          newContent.image_content = '';
          newContent.paragraph_type = 1;
          newContent.paragraph_content = c.content;
          break;
        case 'image':
          newContent.header_type = 0;
          newContent.header_content = '';
          newContent.image_type = 1;
          newContent.image_content = c.content;
          newContent.paragraph_type = 0;
          newContent.paragraph_content = '';
          break;
        default:
          break;
      }
      newContent.position = index;
      newContents[index] = newContent;
    });
    const page = { title: title, publication_date: publicationDate, contents: newContents };
    if (props.user.role === 'Admin') {
      page.author_id = author;
      authors.forEach((a) => {
        if (a.id == author) {
          page.author_name = a.name;
          page.author_surname = a.surname;
        }
      });
    }

    // SOME VALIDATION
    let valid = true;
    if (title === '') {
      setErrorMessage('Page Title field cannot be empty')
      valid = false;
    }
    if (publicationDate !== '' && dayjs(publicationDate).diff(dayjs()) < 0) {
      if (dayjs(publicationDate).date() != dayjs().date() && dayjs(publicationDate).month() != dayjs().month() && dayjs(publicationDate).year() != dayjs().year()) {
        //without this control, the today date would trigger the < 0 condition too, this is because dayjs() returns today at 00:00:00
        setErrorMessage('Pubblication Date field cannot be set before creation date (today)')
        valid = false;
      }
    }

    if (valid) {
      let n_headers = 0, n_other = 0;
      contents.forEach(element => {
        if (element.type == 'header') n_headers++;
        else if (element.type == 'paragraph' || element.type == 'image') n_other++;
      });
      if (n_headers > 0 && n_other > 0) {
        let n_empty = 0;
        contents.forEach(element => {
          if (element.type == 'header' || element.type == 'paragraph')
            if (element.content == '')
              n_empty++;
        });
        if (n_empty == 0) {
          if (pageToEdit) {
            page.id = pageToEdit.id;
            props.editPage(page);
          }

          else
            props.addPageToDB(page);
        }

        else
          setErrorMessage('Each Header and Paragraph cannot be empty. Please fill or delete empty contents.')
      }
      else
        setErrorMessage('A new page must, at least, contain an header and another content')
    }
  };

  return (
    <>
      <CustomNavbar siteName={props.siteName} user={props.user} logout={props.logout} />
      {initialLoading ? <Spinner className='m-2' animation="border" role="status" /> :
        <div className='card' style={{ marginTop: '8%', marginBottom: '5%', height: '100%', width: '80%', marginLeft: '10%', backgroundColor: 'rgba(0,0,0,.03)', padding: '1%' }}>
          <Container>
            <Row>
              <Col xs={3}></Col>
              <Col xs={6}>
                <h2>Add Page</h2>
                <Form onSubmit={handleSubmit}>
                  {errorMessage ? <Alert variant='danger' dismissible onClick={() => setErrorMessage('')}>{errorMessage}</Alert> : ''}
                  <Form.Group controlId='title'>
                    <Form.Label>Page Title</Form.Label>
                    <Form.Control type='text' value={title} onChange={ev => setTitle(ev.target.value)} />
                  </Form.Group>
                  <Form.Group controlId='publicationDate'>
                    <Form.Label>Publication Date</Form.Label>
                    <Form.Control type="date" name="publicationDate" value={publicationDate} onChange={ev => setPublicationDate(ev.target.value)} />
                  </Form.Group>
                  {props.user.role === 'Admin' ?
                    <Form.Group controlId="author">
                      <Form.Label>Select Author</Form.Label>
                      <Form.Control
                        as="select"
                        value={author}
                        onChange={ev => setAuthor(ev.target.value)}
                      >
                        {
                          authors.map((author) => 
                            author.surname === props.user.surname && author.name === props.user.name ?
                            <option value={author.id} key={author.id}>{author.surname} {author.name} (me)</option>
                            :
                            <option value={author.id} key={author.id}>{author.surname} {author.name}</option>
                          )
                        }
                      </Form.Control>
                    </Form.Group>
                    : null
                  }
                  {
                    contents.map((c) => {
                      switch (c.type) {
                        case 'header':
                          return <HeaderContent content={c} key={c.id} isCancelButtonDisabled={contents.length <= 1}
                            deleteHeader={() => deleteContent(c.id)} updateHeaderContent={(contentValue) => updateContent(c.id, contentValue)}
                            changePosition={(newPosition) => changePosition(newPosition, c.id)}
                          />
                        case 'paragraph':
                          return <ParagraphContent content={c} key={c.id} isCancelButtonDisabled={contents.length <= 1}
                            deleteParagraph={() => deleteContent(c.id)} updateParagraphContent={(contentValue) => updateContent(c.id, contentValue)}
                            changePosition={(newPosition) => changePosition(newPosition, c.id)}
                          />
                        case 'image':
                          return <ImageContent content={c} key={c.id} isCancelButtonDisabled={contents.length <= 1}
                            deleteImage={() => deleteContent(c.id)} updateImageContent={(contentValue) => updateContent(c.id, contentValue)}
                            changePosition={(newPosition) => changePosition(newPosition, c.id)} images={images}
                          />
                        default:
                          console.log("component not recognized")
                          break;
                      }
                    })
                  }
                  <Button className='my-3 mx-5' variant='btn btn-warning' onClick={() => addNewContent('header', 'Write your header here... :)')}>Add Header</Button>
                  <Button className='my-3 mx-5' variant='btn btn-warning' onClick={() => addNewContent('paragraph', 'Write your paragraph here... :P')}>Add Paragraph</Button>
                  <Button className='my-3 mx-5' variant='btn btn-warning' onClick={() => addNewContent('image', images[0].name)}>Add Image</Button>

                  {pageToEdit ?
                    <Button className='my-5 mx-2' type='submit'>Edit Page</Button>
                    :
                    <Button className='my-5 mx-2' type='submit'>Add Page</Button>}
                  <Button className='my-5 mx-2' variant='btn btn-outline-dark' onClick={() => navigate('/backOffice')}>Cancel</Button>
                </Form>
              </Col>
              <Col xs={3}></Col>
            </Row>
          </Container>
        </div>
      }
    </>
  )
}

export default PageManagement