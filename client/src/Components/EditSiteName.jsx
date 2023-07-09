import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomNavbar from './Navbar';
import API from '../API';

function EditSiteName(props) {
  const [siteName, setSiteName] = useState(props.siteName);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage('');

    let valid = true;
    if (siteName === ''){
      setErrorMessage('Site Name cannot be empty')
      valid = false;
    }

    if (valid) {
      API.editSiteName(siteName)
      .then(() => {setErrorMessage(''); navigate('/backOffice');})
      .catch(err => setErrorMessage(err))
    }
  };

  return (
    <>
      <CustomNavbar siteName={props.siteName} user={props.user} logout={props.logout}/>
      <div className='card' style={{ marginTop: '8%', height: '100%', width: '50%', marginLeft: '25%', backgroundColor: 'rgba(0,0,0,.03)', padding: '2%'}}>
        <Container>
          <Row>
            <Col xs={3}></Col>
            <Col xs={6}>
              <h2>Login</h2>
              <Form onSubmit={handleSubmit}>
                {errorMessage ? <Alert variant='danger' dismissible onClick={() => setErrorMessage('')}>{errorMessage}</Alert> : ''}
                <Form.Group controlId='siteName'>
                  <Form.Label>Edit Site Name</Form.Label>
                  <Form.Control type='text' value={siteName} onChange={ev => setSiteName(ev.target.value)} />
                </Form.Group>
                <Button className='my-2' type='submit'>Edit Site Name</Button>
                <Button className='my-2 mx-2' variant='btn btn-outline-dark' onClick={() => navigate('/')}>Cancel</Button>
              </Form>
            </Col>
            <Col xs={3}></Col>
          </Row>
        </Container>
      </div>
    </>
  )
}

export default EditSiteName