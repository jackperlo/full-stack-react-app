import API from '../API';

function Content(props){
  return(
    <>
    { props.content.header_type ?
      <div className="card" style={{margin: "0.5%"}}>
        <div className="card-body">
          <h5 className="card-title">Header</h5>
          <p className="card-text">{props.content.header_content}</p>
        </div>
      </div> : null
    }
    { props.content.paragraph_type ?
      <div className="card" style={{margin: "0.5%"}}>
        <div className="card-body">
          <h5 className="card-title">Paragraph</h5>
          <p className="card-text">{props.content.paragraph_content}</p>
        </div>
      </div> : null
    }
    { props.content.image_type ?
      <div className="card" style={{margin: "0.5%"}}>
        <div className="card-body">
          <h5 className="card-title">Image</h5>
          <img src={props.content.image_content} alt="Immagine 1" className="img-fluid" style={{display: "block", marginLeft: "auto", marginRight: "auto", width: "50%"}}/>
        </div>
      </div> : null
    }
    </>
  );
}

export default Content;
