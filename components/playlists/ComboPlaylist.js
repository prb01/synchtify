import { useState } from "react";
import Playlist from "./Playlist";
import { useDispatch, useSelector } from "react-redux";
import { deleteCombinedPlaylist } from "../../redux/combinedPlaylist";
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Button,
  Row,
  Col,
  Spinner,
} from "reactstrap";

const ComboPlaylist = ({ combinedPlaylist, idx }) => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const access_token = useSelector((state) => state.user?.data?.access_token);

  const toggle = (id) => {
    open === id ? setOpen("") : setOpen(id);
  };

  const deleteComboPlaylist = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      setIsLoading(true);
      dispatch(deleteCombinedPlaylist({ id, access_token }))
    }
  };

  return (
    <Accordion flush toggle={toggle} open={open} className="position-relative">
      <AccordionItem className="bg-secondary">
        <AccordionHeader targetId={idx}>
          <h5>{combinedPlaylist.name}</h5>
        </AccordionHeader>
        <AccordionBody accordionId={idx}>
          <Row className="gy-4">
            <Col sm={10}>
              {combinedPlaylist.playlists.map((playlist, playlistIdx) => (
                <Playlist key={playlist.id} playlist={playlist} idx={playlistIdx} />
              ))}
            </Col>
            <Col sm={2}>
              <Button
                color="accent"
                onClick={() => deleteComboPlaylist(idx)}
                disabled={isLoading}
              >
                Delete
              </Button>
            </Col>
          </Row>
        </AccordionBody>
      </AccordionItem>
      {isLoading && (
        <Spinner color="danger" className="position-absolute top-50 start-50">
          Loading...
        </Spinner>
      )}
    </Accordion>
  );
};

export default ComboPlaylist;
