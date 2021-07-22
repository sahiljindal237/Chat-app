import React, { useState, useRef } from 'react';
import { Alert, Button, Modal } from 'rsuite';
import { useModalState } from '../../misc/custom-hooks';
import AvatarEditor from 'react-avatar-editor';
import { database, storage } from '../../misc/firebase';
import { useProfile } from '../../context/Profile.context';
import ProfileAvatar from './ProfileAvatar';
import { getUserUpdates } from '../../misc/helpers';

const fileInputTypes = '.png,.jpg,.jpeg';
const AvatarUploadBtn = () => {
  const { isOpen, open, close } = useModalState();
  const [img, setImg] = useState(null);
  const acceptedfiles = ['image/png', 'image/jpeg', 'image/pjpeg'];
  const isValidFile = file => acceptedfiles.includes(file.type);
  const avatarEditorRef = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useProfile();

  const getBlob = canvas => {
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('File process error'));
        }
      });
    });
  };

  const onFileInputChange = ev => {
    const currentfiles = ev.target.files;
    const file = currentfiles[0];
    if (isValidFile(file)) {
      setImg(file);
      open();
    } else {
      Alert.warning(`Wrong file type ${file.type}`, 4000);
    }
  };

  const onUploadClick = async () => {
    const canvas = avatarEditorRef.current.getImageScaledToCanvas();
    setIsLoading(true);
    try {
      const avatarFileRef = storage
        .ref(`/profiles/${profile.uid}`)
        .child('avatar');
      const blob = await getBlob(canvas);
      const uploadAvatarResult = await avatarFileRef.put(blob, {
        cacheControl: `public, max-age=${3600 * 24 * 3}`,
      });
      const downloadUrl = await uploadAvatarResult.ref.getDownloadURL();

      const updates = await getUserUpdates(
        profile.uid,
        'avatar',
        downloadUrl,
        database
      );
      database.ref().update(updates);
      setIsLoading(false);
      Alert.info('Avatar has been uploaded', 4000);
    } catch (err) {
      setIsLoading(false);
      Alert.error(err.message, 4000);
    }
  };

  return (
    <div className="text-center mt-3">
      <div>
        <ProfileAvatar
          src={profile.avatar}
          name={profile.name}
          className="width-200 height-200 img-fullsize font-huge"
        />
        <label htmlFor="AvatarUpload" className="d-block cursor-pointer padded">
          Select new Avatar
          <input
            id="AvatarUpload"
            className="d-none"
            type="file"
            accept={fileInputTypes}
            onChange={onFileInputChange}
          />
        </label>
        <Modal show={isOpen} onHide={close}>
          <Modal.Header>
            <Modal.Title>Adjust Upload new Avatar</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="d-flex justify-content-center align-items-center h-100">
              <AvatarEditor
                ref={avatarEditorRef}
                image={img}
                width={200}
                height={200}
                border={10}
                borderRadius={100}
                rotate={0}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button block appearance="ghost" onClick={onUploadClick}>
              Upload new Avatar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default AvatarUploadBtn;
