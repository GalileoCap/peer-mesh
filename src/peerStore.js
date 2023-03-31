import { create as createZustand } from 'zustand';
import Peer from 'peerjs';
//import _ from 'lodash';

import {
  findPeer, findPeerIdx,
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
  //TODO: other peer.on
}

function connectTo(peerId, metadata = {}, store) {
  return;
}

function sendUpdate(cb, store) {
  const peers = getPeers(store);
  const myIdx = findPeerIdx(peers, MY_PEER);

  const newState = cb(peers[myIdx]);
  if (newState !== undefined)
    peers[myIdx] = {...peers[myIdx], ...newState};

  peers.forEach((peer) => {
    if (!peer._mine)
      peer._conn.send({
        type: 'update',
        newState: peers[myIdx],
      });
  });
  store.set({ peers });
}

export function createPeerStore(defaultValues) {
  return createZustand((set, get) => ({
    peers: [],

    defaultValues: undefined,

    init: (defaultValues) => init(defaultValues, { set, get }),
    connectTo: (peerId, metadata) => connectTo(peerId, metadata, { set, get }),
    sendUpdate: (cb) => sendUpdate(cb, { set, get }),

    //case 'newPeer': handleNewPeer(draft, action); break;
    //case 'onData': handleOnData(draft, action); break;
  }));
}
