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
      type: 'onData', dispatch,
      senderId: newConn.peer, data,
    }));
  });
  //TODO: other peer.on
}

function handleNewPeer(draft, { newPeer }) {
  draft.push(newPeer);
}

function handleConnectTo(draft, { peerId, metadata, dispatch }) {
  //TODO: Fix trying to connect twice to the same person

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
    type: 'onData', dispatch,
    senderId: newConn.peer, data,
  }));
  //TODO: other newConn.on
}

function handleOnData(draft, { senderId, data, dispatch }) {
  const peer = findPeer(draft, senderId);
  switch (data.type) {
  case 'askValues':
    const me = findPeer(draft, MY_PEER);
    peer._conn.send({
      type: 'update',
      values: _.omitBy(me, (value, key) => key.startsWith('_')),
    });

    const peers = findPeer(draft, ALL_PEERS);
    peer._conn.send({
      type: 'peersUpdate',
      peers: peers.map((peerState, idx) => _.pick(peerState, ['_id', '_leader'])),
    })
    break;

  case 'update':
    const peerIdx = findPeerIdx(draft, senderId);
    draft[peerIdx] = {...draft[peerIdx], ...data.values};
    break;

  case 'peersUpdate':
    data.peers.forEach(({ _id, _leader }) => {
      const peerIdx = findPeerIdx(draft, _id);
      if (peerIdx === -1) {
        dispatch({
          type: 'connectTo', dispatch: dispatch,
          peerId: _id,
        });
      } else if (_leader) {
        const currLeaderIdx = findPeerIdx(draft, LEADER_PEER);
        draft[currLeaderIdx] = {...draft[currLeaderIdx], _leader: false};
        draft[peerIdx] = {...draft[peerIdx], _leader: true};
      }
    });

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
