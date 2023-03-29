import { useImmerReducer } from 'use-immer';
import Peer from 'peerjs';
import _ from 'lodash';

import {
  findPeer, findPeerIdx,
  MY_PEER, LEADER_PEER, ALL_PEERS,
} from './utils.js';

let DefaultValues = {};

function dispatchNewPeer({ dispatch, newConn, values }) {
  const newPeer = {
    ...values,
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
  peer.on('connection', (newConn) => {
    dispatchNewPeer({
      dispatch,
      newConn, values: newConn.metadata.values,
    });
    newConn.on('data', (data) => dispatch({
      type: 'onData',
      senderId: newConn.peer, data,
    }));
  });
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
      values: _.omitBy(me, (value, key) => key.startsWith('_')),
    },
  }); 
  newConn.on('open', () => {
    dispatchNewPeer({
      dispatch,
      newConn, values: DefaultValues,
    });
    newConn.send({type: 'askValues'});
  });
  newConn.on('data', (data) => dispatch({
    type: 'onData',
    senderId: newConn.peer, data,
  }));
  //TODO: other newConn.on
}

function handleOnData(draft, { senderId, data }) {
  const peer = findPeer(draft, senderId);
  switch (data.type) {
  case 'askValues':
    const me = findPeer(draft, MY_PEER);
    peer._conn.send({
      type: 'update',
      values: _.omitBy(me, (value, key) => key.startsWith('_')),
    });
    break;

  case 'update':
    const peerIdx = findPeerIdx(draft, senderId);
    draft[peerIdx] = {...draft[peerIdx], ...data.values};
    break;

  default:
    console.log('Unhandled message (senderId, data):', senderId, data);
  }
}

function handleUpdate(draft, { cb }) {
  const me = findPeer(draft, MY_PEER);
  cb(me);
  draft.forEach((peer) => {
    if (!peer._mine) peer._conn.send({
      type: 'update',
      values: _.omitBy(me, (value, key) => key.startsWith('_')),
    });
  });
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
        case 'onData': handleOnData(draft, action); break;
        case 'update': handleUpdate(draft, action); break;
        default: console.log('Unhandeled action', action);
      }
    }, dflt
  );
}
