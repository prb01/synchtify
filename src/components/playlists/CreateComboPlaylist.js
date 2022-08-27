import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faMinusCircle } from "@fortawesome/free-solid-svg-icons";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Button, Col, Row, Form, FormGroup, Input, Label } from "reactstrap";
import {
  createCombinedPlaylist,
  fetchCombinedPlaylistsByUid,
} from "redux/combinedPlaylist";
import { cloudService } from "services/cloudService";
import { useEffect } from "react";

const CreateComboPlaylist = (props) => {
  const dispatch = useDispatch();
  const { user, spotifyUser, playlist } = useSelector((state) => state);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "playlists",
  });

  const msgIfEmpty = (name = "") => `${name} cannot be empty`;

  const { ref: nameRef, ...nameRest } = register("name", {
    required: msgIfEmpty("Name"),
  });

  // Limit # of playlists
  useEffect(() => {
    if (fields.length < 2) append("");
    if (fields.length > 5) remove(fields.length - 1);
  }, [fields]);

  const onSubmit = async (data) => {
    if (Object.keys(errors).length) {
      alert("Error saving product: " + JSON.stringify(errors));
    } else {
      try {
        const playlists = data.playlists.map((playlist) =>
          JSON.parse(playlist.playlist)
        );

        const { id } = await cloudService.createPlaylist(
          spotifyUser.data.id,
          user.data.access_token,
          data.name
        );

        const comboData = {
          id,
          uid: user.data.uid,
          name: data.name,
          playlists,
        };

        dispatch(createCombinedPlaylist({ ...comboData }));

        await cloudService.refreshNewCombinedPlaylist(comboData);

        reset();
        console.log("added to Spotify & DB");
      } catch (error) {}
    }
  };

  return (
    <>
      <Form
        onSubmit={handleSubmit(onSubmit)}
        className="p-3 my-3 border border-secondary form-rounded text-text"
      >
        <h2 className="text-center mb-4">Create new combined playlist</h2>
        <FormGroup row>
          <Label for="name" sm={2}>
            Name<span className="text-danger">*</span>
          </Label>
          <Col sm={8}>
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
                <Label for="playlist" sm={2}>
                  Playlist<span className="text-danger">*</span>
                </Label>
                <Col xs={10} sm={8}>
                  <Controller
                    name={`playlists.${idx}.playlist`}
                    control={control}
                    render={({ field }) => (
                      <Input id="playlist" type="select" {...field}>
                        <option value="" hidden></option>
                        {playlist.isLoaded &&
                          playlist.data.map((playlist) => (
                            <option
                              key={playlist.id}
                              value={JSON.stringify({
                                name: playlist.name,
                                id: playlist.id,
                                snapshotId: playlist.snapshot_id,
                              })}
                            >
                              {playlist.name}
                            </option>
                          ))}
                      </Input>
                    )}
                  />
                </Col>
                <Col
                  xs={2}
                  sm={2}
                  className="d-flex align-items-center justify-content-start"
                >
                  <Button
                    outline
                    color="accent"
                    onClick={() => remove(idx)}
                    className="rounded-circle fs-6"
                  >
                    <FontAwesomeIcon icon={faMinusCircle} />
                  </Button>
                </Col>
              </FormGroup>
            </li>
          ))}
        </ul>
        <Row>
          <Col xs={10}></Col>
          <Col xs={2} className="d-flex align-items-center justify-content-start">
            <Button
              outline
              onClick={() => append("")}
              className="rounded-circle fs-6"
            >
              <FontAwesomeIcon icon={faPlusCircle} />
            </Button>
          </Col>
        </Row>

        <div className="d-flex justify-content-center">
          <Button type="submit" color="secondary" className="text-primary">
            Save New Playlist
          </Button>
        </div>
      </Form>
    </>
  );
};

export default CreateComboPlaylist;
