import { useState } from "react";
import Playlist from "./Playlist";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
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
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const access_token = useAppSelector((state) => state.user?.data?.access_token);

  const toggle = (id: string) => {
    open === id ? setOpen("") : setOpen(id);
  };

  const deleteComboPlaylist = (id: string) => {
    if (confirm("Are you sure you want to delete?")) {
      setIsLoading(true);
      dispatch(deleteCombinedPlaylist({ id, access_token }))
    }
  };

  return (
    // @ts-ignore
    // https://github.com/reactstrap/reactstrap/issues/2165
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
