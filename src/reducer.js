import { useImmerReducer } from 'use-immer';
import Peer from 'peerjs';

import {
  findPeer,
  MY_PEER, LEADER_PEER, ALL_PEERS,
} from './utils.js';

let DefaultValues = {};

function dispatchNewPeer({ dispatch, newConn }) {
  const values = (newConn.metadata.values !== undefined ? newConn.metadata.values : DefaultValues);

  const newPeer = {
    ...values, //TODO: Replace values with theirs when I'm the one connecting 
    _conn: newConn,
    _id: newConn.peer,
    _mine: false,
    _leader: false, //TODO: Get from metadata
  };
  dispatch({ type: 'newPeer', newPeer });
}

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
  peer.on('connection', (newConn) => dispatchNewPeer({ dispatch, newConn }));
  //TODO: other peer.on
}

function handleNewPeer(draft, { newPeer }) {
  draft.push(newPeer);
}

function handleConnectTo(draft, { peerId, metadata, dispatch }) {
  const me = findPeer(draft, MY_PEER);
  const newConn = me._peer.connect(peerId, {
    metadata: {
      ...metadata,
      values: {
        number: me.number, //TODO: Filter private keys
      },
    },
  }); 
  newConn.on('open', () => dispatchNewPeer({ dispatch, newConn }));
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
