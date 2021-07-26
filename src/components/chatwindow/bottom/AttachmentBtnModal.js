import React, { useState } from 'react';
import { useParams } from 'react-router';
import {
  Alert,
  Button,
  Icon,
  Input,
  InputGroup,
  Modal,
  Uploader,
} from 'rsuite';
import { useModalState } from '../../../misc/custom-hooks';
import { storage } from '../../../misc/firebase';

const MAX_FILE_SIZE = 1000 * 1024 * 5;
const AttachmentBtnModal = ({ afterUpload }) => {
  const { chatId } = useParams();
  const { isOpen, open, close } = useModalState();
  const [fileList, setFileList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const onChange = fileArr => {
    const filtered = fileArr
      .filter(el => el.blobFile.size <= MAX_FILE_SIZE)
      .slice(0, 5);
    setFileList(filtered);
  };

  const onUpload = async () => {
    try {
      const uploadPromises = fileList.map(f => {
        return storage
          .ref(`/chat/${chatId}`)
          .child(Date.now() + f.name)
          .put(f.blobFile, {
            cacheControl: `public , max-age = ${3600 * 24 * 3}`,
          });
      });
      const uploadSnapshots = await Promise.all(uploadPromises);

      const shapePromises = uploadSnapshots.map(async snap => {
        return {
          contentType: snap.metadata.contentType,
          name: snap.metadata.name,
          url: await snap.ref.getDownloadURL(),
        };
      });
      const files = await Promise.all(shapePromises);
      await afterUpload(files);
      setIsLoading(false);
      close();
    } catch (err) {
      setIsLoading(false);
      Alert.error(err.message, 4000);
    }
  };
  return (
    <>
      <InputGroup.Button onClick={open}>
        <Icon icon="attachment" />
      </InputGroup.Button>
      <Modal show={isOpen} onHide={close}>
        <Modal.Header>
          <Modal.Title>Upload your files</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Uploader
            autoUpload={false}
            action=""
            fileList={fileList}
            onChange={onChange}
            multiple
            disabled={isLoading}
            listType="picture-text"
            className="w-100"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button disabled={isLoading} block onClick={onUpload}>
            Send to chat
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AttachmentBtnModal;
