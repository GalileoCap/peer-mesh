import {
  findPeer, findPeerIdx,
  getPeers,
  LEADER_PEER,
} from './utils';

function handleGet(sender, data, store) {
  data.forEach((getQuery) => {
    switch (getQuery.key) {
    case 'update': { store.get().sendUpdate(); break; }
    case 'leader': {
      const leader = findPeer(store.get().peers, LEADER_PEER);
      store.get().sendMessage(sender, '_set', [{key: 'leader', value: leader._id}]);
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

    default: { console.error('Unhandled set (sender, setQuery):', sender, setQuery); }
    }
  });
}

export function onData(sender, data, store) {
  switch (data.type) {
  case '_get': handleGet(sender, data.data, store); break;
  case '_set': handleSet(sender, data.data, store); break;

  default: console.error('Unhandled message (sender, data):', sender, data);
  }
}
