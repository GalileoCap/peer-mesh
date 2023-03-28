import {
  createContext, useContext,
  useEffect,
} from 'react';
import { useImmerReducer } from 'use-immer';
import Peer from 'peerjs';

import {
  findPeer,
  MY_PEER, LEADER_PEER, ALL_PEERS,
} from './utils.js';

const StatesContext = createContext(null);
const DispatchContext = createContext(null);

function handleUpdate(draft, { cb }) {
  cb(findPeer(draft, MY_PEER));
  //TODO: Send update to peers
}

export function MeshProvider({ defaultValues, children }) {
  const [ states, dispatch ] = useImmerReducer(
    (draft, action) => {
      switch (action.type) {
      case 'update': handleUpdate(draft, action); break;
      default: console.log(action);
      }
    }, [
    {
      ...defaultValues,
      _id: 'myId',
      _mine: true,
      _leader: false,
    },
    {
      ...defaultValues,
      _id: 'leaderId',
      _mine: false,
      _leader: true,
    },
    {
      ...defaultValues,
      _id: 'randoId',
      _mine: false,
      _leader: false,
    },
  ]);
  useEffect(() => {
    //TODO: Create peer
  }, []);

  return (
    <StatesContext.Provider value={states}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StatesContext.Provider>
  );
}

export function useMeshContext(peerId, cb) {
  const peers = useContext(StatesContext);
  const res = findPeer(peers, peerId);

  if (cb) return cb(res);
  else return res;
}

function useDispatchContext() {
  return useContext(DispatchContext);
}

export function useDispatchUpdate() {
  const dispatch = useDispatchContext();
  return (cb) => dispatch({type: 'update', cb});
}
