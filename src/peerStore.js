import { create as createZustand } from 'zustand';
import Peer from 'peerjs';

import { onData } from './messages';
import {
  findPeer, findPeerIdx, omitPrivate,
  getPeers,
  MY_PEER, LEADER_PEER, ALL_PEERS,
} from './utils.js';

function init(defaultValues = {}, store) {
  //TODO: Reset store

  const peer = new Peer();
  peer.on('open', () => store.set({
    defaultValues,
    peers: [{
      ...defaultValues,
      _peer: peer,
      _id: peer.id,
      _mine: true,
      _leader: true,
    }],
  }));
  peer.on('connection', (conn) => {
    const peers = getPeers(store);

    if (findPeer(peers, conn.peer) !== undefined) return; // Reject repeated peers

    peers.push({
      ...defaultValues,
      ...conn.metadata.state,
      _conn: conn,
      _id: conn.peer,
      _mine: false,
      _leader: false,
    });

    conn.on('data', (data) => onData(conn.peer, data, store));

    store.set({ peers });
  });
  //TODO: other peer.on
}

function sendUpdate(cb = () => {}, store) {
  const peers = getPeers(store);
  const myIdx = findPeerIdx(peers, MY_PEER);

  const newState = cb(peers[myIdx]);
  if (newState !== undefined)
    peers[myIdx] = {...peers[myIdx], ...newState};

  store.get().sendMessage(ALL_PEERS, '_set', [{key: 'update', state: omitPrivate(peers[myIdx]) }]);
  store.set({ peers });
}

function connectTo(peerId, metadata = {}, store) {
  const peers = getPeers(store);
  const myPeer = findPeer(peers, MY_PEER);

  if (findPeer(peers, peerId) !== undefined) return; // Skip reconnecting to peers and myself

  const conn = myPeer._peer.connect(peerId, {
    metadata: {
      ...metadata,
      state: omitPrivate(myPeer),
      peers: peers.filter((peer) => peer !== myPeer).map((peerState, idx) => peerState._id), //TODO: Also share their state
    },
  });
  conn.on('open', () => {
    const peers = getPeers(store);

    peers.push({
      ...store.get().defaultValues,
      _conn: conn,
      _id: conn.peer,
      _mine: false,
      _leader: false,
    });

    store.set({ peers });
    store.get().sendMessage(conn.peer, '_get', [{key: 'update'}, {key: 'leader'}, {key: 'peers'}]);
    store.get().sendMessage(ALL_PEERS, '_connectTo', {peerId, metadata}); // Tell my peers to connect too
  });
  conn.on('data', (data) => onData(peerId, data, store));
  //TODO: Other conn.on
}

function sendMessage(peerId, data, store) {
  const peers = getPeers(store);
  if (peerId === ALL_PEERS) {
    peers.forEach((peer) => {
      if (!peer._mine) peer._conn.send(data);
    });
  } else findPeer(peers, peerId)._conn.send(data);
}

export function createPeerStore() {
  return createZustand((set, get) => ({
    peers: [],

    defaultValues: undefined,

    init: (defaultValues) => init(defaultValues, { set, get }),
    sendUpdate: (cb) => sendUpdate(cb, { set, get }),
    connectTo: (peerId, metadata) => connectTo(peerId, metadata, { set, get }),
    sendMessage: (peerId, type, data) => sendMessage(peerId, {type, data}, { set, get }),
  }));
}
