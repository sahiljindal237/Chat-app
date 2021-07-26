import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { Alert, Button } from 'rsuite';
import { auth, database, storage } from '../../../misc/firebase';
import { groupBy, transformToArrWithId } from '../../../misc/helpers';
import MessageItem from './MessageItem';

const MAX_PAGE_SIZE = 15;
const messageRef = database.ref('/messages');
const Messages = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState(null);
  const isChatEmpty = messages && messages.length === 0;
  const canShowMessages = messages && messages.length > 0;
  const [limit, setLimit] = useState(MAX_PAGE_SIZE);
  const selfRef = useRef();

  function shouldScrollToBottom(node, threshold = 30) {
    const percentage =
      (100 * node.scrollTop) / (node.scrollHeight - node.clientHeight) || 0;
    return percentage > threshold;
  }
  const loadMessages = useCallback(
    limitToLast => {
      const node = selfRef.current;
      messageRef.off();
      messageRef
        .orderByChild('/roomId')
        .equalTo(chatId)
        .limitToLast(limitToLast || MAX_PAGE_SIZE)
        .on('value', snap => {
          const msg = transformToArrWithId(snap.val());
          setMessages(msg);
          if (shouldScrollToBottom(node)) {
            node.scrollTop = node.scrollHeight;
          }
        });
      setLimit(p => p + 15);
    },
    [chatId]
  );

  const onLoadMore = useCallback(() => {
    const node = selfRef.current;
    const oldHeight = node.scrollHeight;

    loadMessages(limit);

    setTimeout(() => {
      const newHeight = node.scrollHeight;
      node.scrollTop = newHeight - oldHeight;
    }, 400);
  }, [loadMessages, limit]);

  useEffect(() => {
    const node = selfRef.current;

    loadMessages();

    setTimeout(() => {
      node.scrollTop = node.scrollHeight;
    }, 200);

    return () => {
      messageRef.off('value');
    };
  }, [loadMessages]);

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
    async (msgId, file) => {
      if (!window.confirm('Delete this message')) {
        return;
      }
      const isLast = messages[messages.length - 1].id === msgId;
      const updates = {};
      updates[`/messages/${msgId}`] = null;

      if (isLast && messages.length > 1) {
        updates[`/rooms/${chatId}/lastMessage`] = {
          ...messages[messages.length - 2],
          msgId: messages[messages.length - 2].id,
        };
      }

      if (isLast && messages.length === 1) {
        updates[`/rooms/${chatId}/lastMessage`] = null;
      }
      try {
        await database.ref().update(updates);
        Alert.info('Deleted', 1500);
      } catch (error) {
        return Alert.error(error.message, 4000);
      }

      if (file) {
        try {
          const fileRef = storage.refFromURL(file.url);
          await fileRef.delete();
        } catch (error) {
          Alert.error(error.message, 4000);
        }
      }
    },
    [messages, chatId]
  );

  const renderMessages = () => {
    const groups = groupBy(messages, item =>
      new Date(item.createdAt).toDateString()
    );

    const items = [];

    Object.keys(groups).forEach(date => {
      items.push(
        <li key={date} className="text-center mb-1 padded ">
          {date}
        </li>
      );

      const msgs = groups[date].map(msg => (
        <MessageItem
          key={msg.id}
          handleAdmin={handleAdmin}
          handleDelete={handleDelete}
          handleLike={handleLike}
          message={msg}
        />
      ));

      items.push(...msgs);
    });

    return items;
  };
  return (
    <ul ref={selfRef} className="msg-list custom-scroll">
      {messages && messages.length >= MAX_PAGE_SIZE && (
        <li className="text-center mt-2 mb-2">
          <Button onClick={onLoadMore} color="green">
            Load more
          </Button>
        </li>
      )}
      {isChatEmpty && <li>No messages yet...</li>}
      {canShowMessages && renderMessages()}
    </ul>
  );
};

export default Messages;
