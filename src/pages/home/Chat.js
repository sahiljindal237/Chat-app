import React from 'react';
import ChatTop from '../../components/chatwindow/top';
import ChatBottom from '../../components/chatwindow/bottom';
import Messages from '../../components/chatwindow/messages';
import { useParams } from 'react-router';
import { useRooms } from '../../context/rooms.context';
import { Loader } from 'rsuite';
import { CurrentRoomProvider } from '../../misc/current-room.context';
import { transformToArr } from '../../misc/helpers';
import { auth } from '../../misc/firebase';

const Chat = () => {
  const { chatId } = useParams();
  const rooms = useRooms();

  if (!rooms) {
    return <Loader center vertical size="md" content="Loading" speed="slow" />;
  }

  const current = rooms.find(room => room.id === chatId);
  if (!current) {
    return <h6 className="text-center mt-page">Chat {chatId} not found</h6>;
  }
  const { name, description } = current;
  const admins = transformToArr(current.admins);
  const isAdmin = admins.includes(auth.currentUser.uid);

  const currentRoomdata = {
    name,
    description,
    admins,
    isAdmin,
  };
  return (
    <CurrentRoomProvider data={currentRoomdata}>
      <div className="chat-top">
        <ChatTop />
      </div>
      <div className="chat-middle">
        <Messages />
      </div>
      <div className="chat-bottom">
        <ChatBottom />
      </div>
    </CurrentRoomProvider>
  );
};
export default Chat;
