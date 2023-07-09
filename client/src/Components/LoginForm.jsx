import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomNavbar from './Navbar';
import API from '../API';

function LoginForm(props) {
  const [username, setUsername] = useState('author1@mail.com');
  const [password, setPassword] = useState('pwd');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const doLogIn = (credentials) => {
    API.logIn(credentials)
      .then(user => {
        setErrorMessage('');
        props.loginSuccessful(user);
      })
      .catch(err => {
        setErrorMessage(err.message);
      })
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage('');
    const credentials = { username, password };

    let valid = true;
    if (username === ''){
      setErrorMessage('User field cannot be empty')
      valid = false;
    }
    else if (password === ''){
      setErrorMessage('Password field cannot be empty')
      valid = false;
    }

    if (valid) {
      doLogIn(credentials);
    }
  };

  return (
    <>
      <CustomNavbar isLoginPage={true} siteName={props.siteName}/>
      <div className='card' style={{ marginTop: '8%', height: '100%', width: '50%', marginLeft: '25%', backgroundColor: 'rgba(0,0,0,.03)', padding: '2%'}}>
        <Container>
          <Row>
            <Col xs={3}></Col>
            <Col xs={6}>
              <h2>Login</h2>
              <Form onSubmit={handleSubmit}>
                {errorMessage ? <Alert variant='danger' dismissible onClick={() => setErrorMessage('')}>{errorMessage}</Alert> : ''}
                <Form.Group controlId='username'>
                  <Form.Label>Email</Form.Label>
                  <Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value)} />
                </Form.Group>
                <Form.Group controlId='password'>
                  <Form.Label>Password</Form.Label>
                  <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
                </Form.Group>
                <Button className='my-2' type='submit'>Login</Button>
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

export default LoginForm