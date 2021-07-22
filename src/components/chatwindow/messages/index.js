import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Alert } from 'rsuite';
import { auth, database } from '../../../misc/firebase';
import { transformToArrWithId } from '../../../misc/helpers';
import MessageItem from './MessageItem';

const Messages = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState(null);
  const isChatEmpty = messages && messages.length === 0;
  const canShowMessages = messages && messages.length > 0;

  useEffect(() => {
    const messageRef = database.ref('/messages');
    messageRef
      .orderByChild('/roomId')
      .equalTo(chatId)
      .on('value', snap => {
        const msg = transformToArrWithId(snap.val());
        setMessages(msg);
      });
    return () => {
      messageRef.off('value');
    };
  }, [chatId]);

  const handleAdmin = useCallback(
    async uid => {
      let Alertmsg;
      const adminRef = database.ref(`/rooms/${chatId}/admins`);
      await adminRef.transaction(admin => {
        if (admin) {
          if (admin[uid]) {
            admin[uid] = null;
            Alertmsg = 'Admin permission removed';
          } else {
            admin[uid] = true;
            Alertmsg = 'Admin permission granted';
          }
        }
        return admin;
      });
      Alert.info(Alertmsg, 4000);
    },
    [chatId]
  );

  const handleLike = useCallback(async msgId => {
    const msgRef = database.ref(`/messages/${msgId}`);
    const { uid } = auth.currentUser;
    await msgRef.transaction(msg => {
      let Alertlike;
      if (msg) {
        if (msg.likes && msg.likes[uid]) {
          msg.likeCount -= 1;
          msg.likes[uid] = null;
          Alertlike = 'Like removed';
        } else {
          msg.likeCount += 1;
          if (!msg.likes) {
            msg.likes = {};
          }
          msg.likes[uid] = true;
          Alertlike = 'Liked';
        }
      }
      Alert.info(Alertlike, 1000);
      return msg;
    });
  }, []);

  const handleDelete = useCallback(
    async msgId => {
      if (!window.confirm('Delete this message')) {
        return;
      }
      const isLast = messages[messages.length - 1].id === msgId;
      const updates = {};
      updates[`/messages/${msgId}`] = null;
      if (isLast && messages[messages.length] > 1) {
        updates[`/rooms/${chatId}/lastMessage`] = {
          ...messages[messages.length - 2],
          msgId: messages[messages.length - 2].id,
        };
      }
      if (isLast && messages[messages.length] === 1) {
        updates[`/rooms/${chatId}/lastMessage`] = null;
      }

      try {
        await database.ref().update(updates);
        Alert.info('Deleted', 1500);
      } catch (error) {
        Alert.error(error.message, 4000);
      }
    },
    [messages, chatId]
  );
  return (
    <ul className="msg-list custom-scroll">
      {isChatEmpty && <li>No messages yet...</li>}
      {canShowMessages &&
        messages.map(msg => (
          <MessageItem
            key={msg.id}
            message={msg}
            handleAdmin={handleAdmin}
            handleLike={handleLike}
            handleDelete={handleDelete}
          />
        ))}
    </ul>
  );
};

export default Messages;
