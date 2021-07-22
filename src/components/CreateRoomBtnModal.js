import React, { useRef, useState, useCallback } from 'react';
import {
  Button,
  Form,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  Modal,
  Schema,
  Alert,
} from 'rsuite';
import { useModalState } from '../misc/custom-hooks';
import { auth, database } from '../misc/firebase';
import firebase from 'firebase/app';

const { StringType } = Schema.Types;

const model = Schema.Model({
  name: StringType().isRequired('Chat name is required'),
  description: StringType().isRequired('description is required'),
});
const INITIAL_FORM = {
  name: '',
  description: '',
};

const CreateRoomBtnModal = () => {
  const formRef = useRef();
  const { isOpen, open, close } = useModalState();
  const [formValue, setFormValue] = useState(INITIAL_FORM);
  const [isLoading, setIsLoading] = useState(false);

  const onFormChange = useCallback(value => {
    setFormValue(value);
  }, []);

  const onSubmit = async () => {
    if (!formRef.current.check()) {
      return;
    }
    setIsLoading(true);

    const newRoomdata = {
      ...formValue,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      admins: {
        [auth.currentUser.uid]: true,
      },
    };
    try {
      await database.ref('rooms').push(newRoomdata);
      Alert.info('chat room has been created', 4000);
      close();
      setIsLoading(false);
      setFormValue(INITIAL_FORM);
    } catch (err) {
      setIsLoading(false);
      Alert.error(err.message, 4000);
    }
  };

  return (
    <div className="mt-1">
      <Button block color="green" onClick={open}>
        <Icon icon="creative" />
        Create New Chat Room
      </Button>
      <Modal show={isOpen} onHide={close}>
        <Modal.Header>
          <Modal.Title>New chat Room</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            ref={formRef}
            fluid
            onChange={onFormChange}
            formValue={formValue}
            model={model}
          >
            <FormGroup>
              <ControlLabel>Room name</ControlLabel>
              <FormControl name="name" placeholder="Enter room name.." />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl
                componentClass="textarea"
                name="description"
                rows={5}
                placeholder="Enter room description"
              />
            </FormGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            block
            appearance="primary"
            disabled={isLoading}
            onClick={onSubmit}
          >
            Create new chat room
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CreateRoomBtnModal;
