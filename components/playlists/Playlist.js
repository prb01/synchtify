import { Col, Row } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { faSpotify } from "@fortawesome/free-brands-svg-icons";

const Playlist = ({ playlist, idx }) => {
  return (
    <Row className="d-flex align-items-center text-primary mb-2">
      <Col xs={1}>{idx + 1}</Col>
      <Col xs={2}>
        <div className="shadow" style={{ width: "40px", height: "40px" }}>
          <img height="40px" src={playlist.cover} />
        </div>
      </Col>
      <Col xs={9}>
        <FontAwesomeIcon icon={faSpotify} />
        <span className="fw-bold ms-1 me-2">{playlist.name}</span>
        <a href={playlist.url} target="_blank">
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} color="gray" />
        </a>
        <br />
        <span className="text-gray fst-italic">by {playlist.owner ? playlist.owner : 'owner'}</span>
      </Col>
    </Row>
  );
};

export default Playlist;
