import 'bootstrap-icons/font/bootstrap-icons.css';
import { Button } from 'react-bootstrap';
import dayjs from "dayjs";
import { useLocation } from 'react-router-dom';
import Content from './Content';

function Page(props) {
  const location = useLocation();
  const sortedContents = [...props.page.contents].sort((a,b) => a.position - b.position);  // make a shallow copy

  let statusClass = null;
  switch(props.page.status) {
    case 'added':
      statusClass = {
        margin: "2%",
        backgroundColor: "#d4edda"
      };
      break;
    case 'deleted':
      statusClass = {
        margin: "2%",
        backgroundColor: "#f8d7da"
      };
      break;
    case 'updated':
      statusClass = {
        margin: "2%",
        backgroundColor: "#fff3cd"
      };
      break;
    default:
      statusClass = {margin: "2%"};
      break;
  }

  return (
    <>
      <li className="list-group-item" style={statusClass}>
        <h3 className="mb-1">{props.page.title}</h3>
        <p className="text-muted">Author: {props.page.author_surname} {props.page.author_name}</p>
        <p>Pubblication Date: 
        {
        location.pathname === '/backOffice' ?
          !dayjs(props.page.publication_date).isValid() ? <span><i style={{color:'#f57242'}}> (Draft)</i></span> 
            : dayjs(props.page.publication_date).diff(dayjs()) > 0 ?
              <span> {props.page.publication_date} <i style={{color:'red'}}>(Programmed)</i></span>
              : <span> {props.page.publication_date} <i style={{color:'green'}}>(Published)</i></span>
        : <span> {props.page.publication_date}</span>
        }</p>
        <p>Creation Date: {props.page.creation_date}</p>

        <div className="card-deck">
          {
            sortedContents.map((c) => <Content content={c} key={c.id} />)
          }
        </div>
        {
        location.pathname === '/backOffice' ?
          props.page.status ? 
          <>
            <Button variant="btn btn-warning" onClick={()=>props.editPage()} style={{margin: '5%'}} disabled={true}><i className='bi bi-pencil-square' /> Edit</Button>
            <Button variant="btn btn-danger" onClick={()=>props.deletePage()} style={{margin: '5%'}} disabled={true}><i className='bi bi-trash' /> Delete</Button>
          </>
          :
            props.user.role !== 'Admin' ?
              props.page.author_id === props.user.id ?
              <>
                <Button variant="btn btn-warning" onClick={()=>props.editPage()} style={{margin: '5%'}}><i className='bi bi-pencil-square' /> Edit</Button>
                <Button variant="btn btn-danger" onClick={()=>props.deletePage()} style={{margin: '5%'}}><i className='bi bi-trash' /> Delete</Button>
              </>
              : null
            :  
              <>
                <Button variant="btn btn-warning" onClick={()=>props.editPage()} style={{margin: '5%'}}><i className='bi bi-pencil-square' /> Edit</Button>
                <Button variant="btn btn-danger" onClick={()=>props.deletePage()} style={{margin: '5%'}}><i className='bi bi-trash' /> Delete</Button>
              </>
        : null}
      </li>
      <hr/>
    </>
  )
}

export default Page