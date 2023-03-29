import { useImmerReducer } from 'use-immer';
import Peer from 'peerjs';

import {
  findPeer,
  MY_PEER, LEADER_PEER, ALL_PEERS,
} from './utils.js';

let DefaultValues = {};

function handleInit({ dispatch, setDone }) {
  const peer = new Peer();
  peer.on('open', () => {
    dispatch({
      type: 'newPeer',
      newPeer: {
        ...DefaultValues,
        _peer: peer,
        _id: peer.id,
        _mine: true,
        _leader: true,
      },
    });
    setDone(true);
  });
  peer.on('connection', (newConn) => {
    dispatch({
      type: 'newPeer',
      newPeer: {
        //TODO: metadata.defaultValues such as number
        _conn: newConn,
        _id: newConn.peer,
        _mine: false,
        _leader: false,
      },
    });
  });
  //TODO: other peer.on
}

function handleNewPeer(draft, { newPeer }) {
  draft.push(newPeer);
}

function handleConnectTo(draft, { peerId, metadata, dispatch }) {
  const newConn = findPeer(draft, MY_PEER)._peer.connect(peerId); 
  newConn.on('open', () => {  
    dispatch({
      type: 'newPeer',
      newPeer: {
        //TODO: metadata.defaultValues such as number
        _conn: newConn,
        _id: newConn.peer,
        _mine: false,
        _leader: false,
      },
    });
  });
  //TODO: other newConn.on
}

function handleUpdate(draft, { cb }) {
  cb(findPeer(draft, MY_PEER));
  //TODO: Send update to peers
}

export function useReducer(dflt) {
  return useImmerReducer(
    (draft, action) => {
      switch (action.type) {
        case 'init':
          DefaultValues = action.defaultValues;
          handleInit(action);
          break;
        case 'newPeer': handleNewPeer(draft, action); break;
        case 'connectTo': handleConnectTo(draft, action); break;
        case 'update': handleUpdate(draft, action); break;
        default: console.log('Unhandeled action', action);
      }
    }, dflt
  );
}
