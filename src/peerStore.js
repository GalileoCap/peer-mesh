import { create as createZustand } from 'zustand';
import Peer from 'peerjs';

import { onData, subscribeToMessage } from './messages';
import {
  findPeer, findPeerIdx, omitPrivate,
  getStore, getPeers, usePeer,
  MY_PEER, LEADER_PEER, ALL_PEERS,
} from './utils.js';

export function init(store, defaultValues = {}) {
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

export function sendUpdate(store, cb = () => {}) {
  const peers = getPeers(store);
  const myIdx = findPeerIdx(peers, MY_PEER);

  const newState = cb(peers[myIdx]);
  if (newState !== undefined)
    peers[myIdx] = {...peers[myIdx], ...newState};

  sendMessage(store, ALL_PEERS, '_set', [{key: 'update', state: omitPrivate(peers[myIdx]) }]);
  store.set({ peers });
}

export function connectTo(store, peerId, metadata = {}) {
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
    sendMessage(store, conn.peer, '_get', [{key: 'update'}, {key: 'leader'}, {key: 'peers'}]);
    sendMessage(store, ALL_PEERS, '_connectTo', {peerId, metadata}); // Tell my peers to connect too
  });
  conn.on('data', (data) => onData(peerId, data, store));
  //TODO: Other conn.on
}

export function sendMessage(store, peerId, type, data) {
  const msg = {type, data};

  const peers = getPeers(store);
  if (peerId === ALL_PEERS) {
    peers.forEach((peer) => {
      if (!peer._mine) peer._conn.send(msg);
    });
  } else findPeer(peers, peerId)._conn.send(msg);
}

export class PeerStore {
  constructor() {
    this.store = createZustand((set, get) => ({
      peers: [],
      defaultValues: undefined,
      subscribedMessages: {},
    }));
  }

  init(defaultValues) { return init(getStore(this.store), defaultValues); }
  getPeer(peerId) { return findPeer(this.store.getState().peers, peerId); }
  usePeer(peerId) { return usePeer(this.store, peerId); }
  sendUpdate(cb) { return sendUpdate(getStore(this.store), cb); }
  connectTo(peerId, metadata) { return connectTo(getStore(this.store), peerId, metadata); }
  sendMessage(peerId, type, data) { return sendMessage(getStore(this.store), peerId, type, data); }
  subscribeToMessage(type, cb) { return subscribeToMessage(getStore(this.store), type, cb); }
  unsubscribeFromMessage(type) { return subscribeToMessage(getStore(this.store), type, undefined); }
}
