export function getNameInitials(name) {
  const splitNames = name.toUpperCase().split(' ');
  if (splitNames.length > 1) {
    return splitNames[0][0] + splitNames[1][0];
  }
  return splitNames[0][0];
}

export function transformToArr(snapVal) {
  return snapVal ? Object.keys(snapVal) : [];
}
export function transformToArrWithId(snapVal) {
  return snapVal
    ? Object.keys(snapVal).map(roomId => {
        return { ...snapVal[roomId], id: roomId };
      })
    : [];
}

export async function getUserUpdates(userId, keytoUpdate, value, db) {
  const updates = {};
  updates[`profiles/${userId}/${keytoUpdate}`] = value;
  const getMsgs = db
    .ref('/messages')
    .orderByChild('author/uid')
    .equalTo(userId)
    .once('value');
  const getRms = db
    .ref('/rooms')
    .orderByChild('lastMessage/author/uid')
    .equalTo(userId)
    .once('value');

  const [mSnap, rSnap] = await Promise.all([getMsgs, getRms]);
  mSnap.forEach(msgSnap => {
    updates[`/messages/${msgSnap.key}/author/${keytoUpdate}`] = value;
  });
  rSnap.forEach(roomSnap => {
    updates[`/rooms/${roomSnap.key}/lastMessage/author/${keytoUpdate}`] = value;
  });

  return updates;
}

export function groupBy(array, groupingKeyFn) {
  return array.reduce((result, item) => {
    const groupingKey = groupingKeyFn(item);
    if (!result[groupingKey]) {
      result[groupingKey] = [];
    }

    result[groupingKey].push(item);
    return result;
  }, {});
}
