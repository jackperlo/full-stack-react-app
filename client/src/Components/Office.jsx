import { Container, Spinner, Alert } from 'react-bootstrap';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomNavbar from './Navbar';
import Page from './Page';
import API from '.././API';

function Loading(props) {
  return (
    <Spinner className='m-2' animation="border" role="status" />
  )
}

function Office(props){   
  const navigate = useNavigate();
  const location = useLocation();

	let currentLocation = "";
	if (location.pathname === "/" || location.pathname === "/backOffice")
  currentLocation = location.pathname;

	useEffect(() => {
		props.setDirty(true);
	}, [currentLocation])

  useEffect(() => {
    if(props.dirty){
      if(!props.pageManaged){
        if(currentLocation === "/backOffice"){
          props.setInitialLoading(true);
          API.getSiteName()
            .then((site) => {props.setSiteName(site.name); props.setDirty(false);})
            .catch((err) => props.handleError(err));
          API.getAllPages()
            .then((pages) => {
              props.setDirty(false);
              props.setPages(pages);  
              props.setInitialLoading(false);  
            })
            .catch((err) => props.handleError(err));
        }else if(currentLocation === "/"){
          props.setInitialLoading(true);
          API.getSiteName()
            .then((site) => {props.setSiteName(site.name); props.setDirty(false);})
            .catch((err) => props.handleError(err));
          API.getPublishedPages()
            .then((pages) => {
              props.setDirty(false);
              props.setPages(pages);          
              props.setInitialLoading(false);
            })
            .catch((err) => props.handleError(err));
        }
      }
    }
    
  }, [props.dirty, currentLocation, props.pageManaged]);
  
  return(
    <>
      <CustomNavbar user={props.user} logout={props.logout} siteName={props.siteName}/>
      <Container fluid style={{margin: '2%', marginTop:'8%', height: '100%', width: '50%', marginLeft: '25%', backgroundColor: 'rgba(0,0,0,.03)', padding: '2%'}}>
        {currentLocation === '/' ? <h1>Front Office</h1> : <h1>Back Office</h1>}
        {props.errorMsg ? <Alert variant='danger' dismissible className='my-2' onClose={() => props.setErrorMsg('')}>{props.errorMsg}</Alert> : null}
        {props.initialLoading ? <Loading /> : 
          <div className="row justify-content-md-center">
              <ul className="list-group">
                {
                  currentLocation === "/backOffice" ?
                    props.pages.map((p) => <Page page={p} key={p.id} user={props.user} deletePage={() => props.deletePage(p.id)} editPage={() => navigate(`/editPage/${p.id}`)}/>)
                  : props.pages.map((p) => <Page page={p} key={p.id} user={props.user}/>)
                }
              </ul>
          </div>
        }
      </Container>
    </>
  );
}

export default Office