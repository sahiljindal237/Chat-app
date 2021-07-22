import { createContext, useContext, useEffect, useState } from 'react';
import { database } from '../misc/firebase';
import { transformToArrWithId } from '../misc/helpers';

const RoomsContext = createContext();

export const RoomsProvider = ({ children }) => {
  const [rooms, setRooms] = useState(null);
  useEffect(() => {
    const roomlistRef = database.ref('rooms');
    roomlistRef.on('value', snap => {
      const data = transformToArrWithId(snap.val());
      setRooms(data);
    });
    return () => {
      roomlistRef.off();
    };
  }, [rooms]);
  return (
    <RoomsContext.Provider value={rooms}>{children}</RoomsContext.Provider>
  );
};

export const useRooms = () => useContext(RoomsContext);
