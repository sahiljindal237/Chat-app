import React, { useState } from 'react';
import { Icon, Button, Tag, Alert } from 'rsuite';
import { auth } from '../../misc/firebase';
import firebase from 'firebase/app';

const ProviderBlock = () => {
  const [isConnected, setIsConnected] = useState({
    'google.com': auth.currentUser.providerData.some(
      data => data.providerId === 'google.com'
    ),
    'facebook.com': auth.currentUser.providerData.some(
      data => data.providerId === 'facebook.com'
    ),
  });
  const updateIsConnected = (provider, value) => {
    setIsConnected(p => {
      return {
        ...p,
        [provider]: value,
      };
    });
  };
  const unlink = async providerid => {
    try {
      if (auth.currentUser.providerData.length === 1) {
        throw new Error(`You can not disconnect from ${providerid}`);
      }
      await auth.currentUser.unlink(providerid);
      updateIsConnected(providerid, false);
      Alert.success(`Disconnected from ${providerid}`, 4000);
    } catch (err) {
      Alert.error(err.message, 4000);
    }
  };
  const unlinkFacebook = () => {
    unlink('facebook.com');
  };
  const unlinkGoogle = () => {
    unlink('google.com');
  };
  const link = async provider => {
    try {
      await auth.currentUser.linkWithPopup(provider);
      Alert.info(`Linked to ${provider.providerId}`);
      updateIsConnected(provider.providerId, true);
    } catch (err) {
      Alert.error(err.message, 4000);
    }
  };
  const linkGoogle = () => {
    link(new firebase.auth.GoogleAuthProvider());
  };
  const linkFacebook = () => {
    link(new firebase.auth.FacebookAuthProvider());
  };

  return (
    <div>
      {isConnected['google.com'] && (
        <Tag color="green" closable onClose={unlinkGoogle}>
          <Icon icon="google" /> Connected
        </Tag>
      )}
      {isConnected['facebook.com'] && (
        <Tag color="blue" closable onClose={unlinkFacebook}>
          <Icon icon="facebook" /> Connected
        </Tag>
      )}
      <div className="mt-2">
        {!isConnected['google.com'] && (
          <Button color="green" block onClick={linkGoogle}>
            <Icon icon="google" /> Link to Google
          </Button>
        )}
        {!isConnected['facebook.com'] && (
          <Button color="blue" block onClick={linkFacebook}>
            <Icon icon="facebook" /> Link to facebook
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProviderBlock;
