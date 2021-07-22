import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, database } from './../misc/firebase';
import firebase from 'firebase/app';

const ProfileContext = createContext();
export const isOfflineForDatabase = {
  state: 'offline',
  last_changed: firebase.database.ServerValue.TIMESTAMP,
};

const isOnlineForDatabase = {
  state: 'online',
  last_changed: firebase.database.ServerValue.TIMESTAMP,
};

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let userRef;
    let userStatusRef;
    const authUnsub = auth.onAuthStateChanged(authobj => {
      if (authobj) {
        userStatusRef = database.ref(`/status/${authobj.uid}`);
        userRef = database.ref(`/profiles/${authobj.uid}`);

        userRef.on('value', snap => {
          const { name, createdAt, avatar } = snap.val();
          const data = {
            name,
            createdAt,
            avatar,
            uid: authobj.uid,
            email: authobj.email,
          };
          setProfile(data);
          setIsLoading(false);
        });

        database.ref('.info/connected').on('value', snapshot => {
          if (!!snapshot.val() === false) {
            return;
          }
          userStatusRef
            .onDisconnect()
            .set(isOfflineForDatabase)
            .then(() => {
              userStatusRef.set(isOnlineForDatabase);
            });
        });
      } else {
        setProfile(null);
        setIsLoading(false);
        database.ref('.info/connected').off();
        if (userRef) {
          userRef.off();
        }
        if (userStatusRef) {
          userStatusRef.off();
        }
      }
    });
    return () => {
      authUnsub();
      database.ref('.info/connected').off();
      if (userRef) {
        userRef.off();
      }
      if (userStatusRef) {
        userStatusRef.off();
      }
    };
  }, []);
  return (
    <ProfileContext.Provider value={{ isLoading, profile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
