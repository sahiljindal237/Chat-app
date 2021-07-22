import React, { Profiler } from 'react';
import { Drawer, Button, Divider, Alert } from 'rsuite';
import { database } from '../../misc/firebase';
import EditableInput from '../EditableInput';
import { useProfile } from './../../context/Profile.context';
import ProviderBlock from './ProviderBlock';
import AvatarUploadBtn from './AvatarUploadBtn';
import { getUserUpdates } from '../../misc/helpers';

const Dashboard = ({ onSignOut }) => {
  const { profile } = useProfile();
  const onSave = async newdata => {
    try {
      const updates = await getUserUpdates(
        profile.uid,
        'name',
        newdata,
        database
      );
      database.ref().update(updates);
    } catch (err) {
      Alert.error(err.message);
    }
  };
  return (
    <>
      <Drawer.Header>
        <Drawer.Title>Dashboard</Drawer.Title>
      </Drawer.Header>
      <Drawer.Body>
        <h3>hey, {profile.name}</h3>
        <ProviderBlock />
        <Divider />
        <EditableInput
          name="nickname"
          initialValue={profile.name}
          onSave={onSave}
          label={<h6 className="mb-2">Nickname</h6>}
        />
        <AvatarUploadBtn />
      </Drawer.Body>
      <Drawer.Footer>
        <Button block color="red" onClick={onSignOut}>
          Sign out
        </Button>
      </Drawer.Footer>
    </>
  );
};

export default Dashboard;
