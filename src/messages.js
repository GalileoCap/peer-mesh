import { sendUpdate, connectTo, sendMessage } from './peerStore';
import {
  findPeer, findPeerIdx,
  getPeers, getSubscribedMessages,
  LEADER_PEER,
} from './utils';

function handleGet(sender, data, store) {
  data.forEach((getQuery) => {
    switch (getQuery.key) {
    case 'update': { sendUpdate(store); break; }
    case 'leader': {
      const leader = findPeer(store.get().peers, LEADER_PEER);
      sendMessage(store, sender, '_set', [{key: 'leader', value: leader._id}]);
      break;
    }
    case 'peers': {
      const peers = getPeers(store);
      sendMessage(store, sender, '_set', [{
        key: 'peers',
        peers: peers.filter((peer) => !peer._mine).map((peerState, idx) => peerState._id),
      }]);
      break;
    }

    default: { console.error('Unhandled get (sender, getQuery):', sender, getQuery); }
    }
  });
}

function handleSet(sender, data, store) {
  data.forEach((setQuery) => {
    switch (setQuery.key) {
    case 'leader': {
      const peers = getPeers(store);
      const oldLeaderIdx = findPeerIdx(peers, LEADER_PEER);
      const newLeaderIdx = findPeerIdx(peers, setQuery.value);

      peers[oldLeaderIdx] = {...peers[oldLeaderIdx], _leader: false};
      peers[newLeaderIdx] = {...peers[newLeaderIdx], _leader: true};

      store.set({ peers });
      break;
    }

    case 'update': {
      const peers = getPeers(store);
      const senderIdx = findPeerIdx(peers, sender);

      peers[senderIdx] = {...peers[senderIdx], ...setQuery.state};

      store.set({ peers });
      break;
    }

    case 'peers': { setQuery.peers.forEach((peerId) => connectTo(store, peerId)); break; }

    default: { console.error('Unhandled set (sender, setQuery):', sender, setQuery); }
    }
  });
}

export function subscribeToMessage(store, type, cb) {
  const subscribedMessages = getSubscribedMessages(store);

  if (cb) subscribedMessages[type] = cb;
  else delete subscribedMessages[type];

  store.set({ subscribedMessages });
}

export function onData(sender, data, store) {
  switch (data.type) {
  case '_get': handleGet(sender, data.data, store); break;
  case '_set': handleSet(sender, data.data, store); break;
  case '_connectTo': connectTo(store, data.data.peerId, data.data.metadata); break;

  default: {
    const cb = getSubscribedMessages(store)[data.type];
    if (cb) cb(data.type, data.data, store);
    else console.error('Unhandled message (sender, data):', sender, data);
  }
  }
}
