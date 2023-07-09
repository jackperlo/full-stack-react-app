import { Navbar, Container, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";

function CustomNavbar(props) {
  const location = useLocation();
  const navigate = useNavigate();
  const name = props.user && props.user.name;

  return (
    <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
      <Container fluid>
        <Navbar.Brand className='fs-2'>{props.siteName}</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            {name ? <>
                <Navbar.Text className='fs-5'>
                  {"Welcome back, " + name + " " + props.user.surname + " (" + props.user.role + ") "}
                </Navbar.Text>
                {
                props.user.role === 'Admin' && location.pathname !== '/editSiteName' ?
                <Button className='mx-2' variant='btn btn-outline-light' onClick={() => navigate('/editSiteName')}>Edit Site Name</Button>
                  : null
                }
                {
                location.pathname == "/" ? 
                  <Button className='mx-2' variant='btn btn-outline-light' onClick={() => navigate('/backOffice')}>Back Office</Button>
                  : location.pathname == "/backOffice" ?
                    <>
                      <Button className='mx-2' variant='btn btn-outline-light' onClick={() => navigate('/')}>Front Office</Button>
                      <Button className='mx-2' variant='btn btn-outline-light' onClick={() => navigate('/addPage')}>Add Page</Button>
                    </> 
                    : location.pathname == "/addPage" ?
                      <>
                        <Button className='mx-2' variant='btn btn-outline-light' onClick={() => navigate('/')}>Front Office</Button>
                        <Button className='mx-2' variant='btn btn-outline-light' onClick={() => navigate('/backOffice')}>Back Office</Button>
                      </>
                      : location.pathname == "/editSiteName" || location.pathname.split('/')[1] == 'editPage' ?
                        <>
                          <Button className='mx-2' variant='btn btn-outline-light' onClick={() => navigate('/')}>Front Office</Button>
                          <Button className='mx-2' variant='btn btn-outline-light' onClick={() => navigate('/backOffice')}>Back Office</Button>
                        </>
                          : null               
                }
                <Button className='mx-2' variant='btn btn-outline-danger' onClick={props.logout}>Logout</Button>
              </> 
              : location.pathname != "/login" ? 
                  <Button className='mx-2' variant='btn btn-outline-light' onClick={() => navigate('/login')}>Login</Button>
                  : <Button className='mx-2' variant='btn btn-outline-light' onClick={() => navigate('/')}>Home</Button> }
          </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default CustomNavbar;