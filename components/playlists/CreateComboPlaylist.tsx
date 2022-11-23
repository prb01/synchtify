import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faMinusCircle } from "@fortawesome/free-solid-svg-icons";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  Button,
  Col,
  Row,
  Form,
  FormGroup,
  Input,
  Label,
  Spinner,
  Container,
} from "reactstrap";
import { createCombinedPlaylist } from "../../redux/combinedPlaylist";
import { cloudService } from "../../services/cloudService";
import { useEffect, useState } from "react";

const CreateComboPlaylist = (props) => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const { user, spotifyUser, playlist } = useAppSelector((state) => state);

  type FormValues = {
    name: string;
    playlists: { value: string }[];
  };

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray<FormValues>({
    control,
    name: "playlists",
  });

  const msgIfEmpty = (name = "") => `${name} cannot be empty`;

  const { ref: nameRef, ...nameRest } = register("name", {
    required: msgIfEmpty("Name"),
  });

  // Limit # of playlists
  useEffect(() => {
    if (fields.length < 2) append({ value: "" });
    if (fields.length > 5) remove(fields.length - 1);
  }, [fields]);

  const onSubmit = async ({ name, playlists }) => {
    if (Object.keys(errors).length) {
      alert("Error saving product: " + JSON.stringify(errors));
    } else {
      try {
        setIsLoading(true);
        const parsedPlaylists = playlists.map((playlist: string) =>
          JSON.parse(playlist)
        );

        const {
          id,
          external_urls: { spotify: url },
        } = await cloudService.createPlaylist(
          spotifyUser.data.id,
          user.data.access_token,
          name
        );

        const comboData = {
          id,
          url,
          uid: user.data.uid,
          name,
          playlists: parsedPlaylists,
        };

        await dispatch(createCombinedPlaylist({ ...comboData }));

        await cloudService.refreshNewCombinedPlaylist(comboData);

        reset();
        setIsLoading(false);
        console.log("added to Spotify & DB");
      } catch (error) {
        setIsLoading(false);
      }
    }
  };

  return (
    <Container className="position-relative px-3 py-5 my-3 border border-secondary form-rounded text-text">
      <Form onSubmit={handleSubmit(onSubmit)}>
        <h2 className="text-center mb-5">Create new combined playlist</h2>
        <FormGroup row>
          <Label for="name" sm={2} className="text-sm-end">
            Name<span className="text-danger">*</span>
          </Label>
          <Col xs={10} sm={8}>
            <Input
              id="name"
              type="text"
              placeholder="Combined playlist Name"
              {...nameRest}
              innerRef={nameRef}
              invalid={errors.name ? true : false}
            />
          </Col>
        </FormGroup>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {fields.map((item, idx) => (
            <li key={item.id}>
              <FormGroup row>
                <Label for="playlist" sm={2} className="text-sm-end">
                  Playlist<span className="text-danger">*</span>
                </Label>
                <Col xs={10} sm={8}>
                  <Controller
                    name={`playlists.${idx}`}
                    control={control}
                    render={({ field }) => {
                      return (
                        <Input type="select" id="playlist" onChange={field.onChange}>
                          <option value="" hidden></option>
                          {playlist.isLoaded &&
                            playlist.data.map((playlist) => (
                              <option
                                key={playlist.id}
                                value={JSON.stringify({
                                  name: playlist.name,
                                  url: playlist.external_urls.spotify,
                                  id: playlist.id,
                                  owner: playlist.owner.display_name,
                                  snapshotId: playlist.snapshot_id,
                                  cover:
                                    playlist.images.length > 0
                                      ? playlist.images[0].url
                                      : "",
                                })}
                              >
                                {playlist.name}
                              </option>
                            ))}
                        </Input>
                      );
                    }}
                  />
                </Col>
                <Col
                  xs={2}
                  sm={2}
                  className="d-flex align-items-center justify-content-start"
                >
                  {idx === fields.length - 1 && (
                    <Button
                      outline
                      color="btn-grey"
                      type="button"
                      onClick={() => remove(idx)}
                      className="d-flex align-items-center justify-content-center rounded-circle fs-6"
                      style={{ width: "35px", height: "35px" }}
                    >
                      <FontAwesomeIcon icon={faMinusCircle} />
                    </Button>
                  )}
                </Col>
              </FormGroup>
            </li>
          ))}
        </ul>
        <Row>
          <Col xs={10}></Col>
          <Col xs={2} className="d-flex align-items-center justify-content-start">
            <Button
              onClick={() => append({ value: "" })}
              className="d-flex align-items-center justify-content-center rounded-circle fs-6"
              style={{ width: "35px", height: "35px" }}
            >
              <FontAwesomeIcon icon={faPlusCircle} />
            </Button>
          </Col>
        </Row>

        <div className="d-flex justify-content-center">
          <Button
            type="submit"
            color="secondary"
            className="text-primary"
            disabled={isLoading}
          >
            {isLoading && (
              <Spinner
                color="danger"
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              >
                ...
              </Spinner>
            )}
            Save New Playlist
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default CreateComboPlaylist;
