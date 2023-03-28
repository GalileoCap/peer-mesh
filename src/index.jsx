import {
  createContext, useContext,
} from 'react';
import { useImmerReducer } from 'use-immer';

export const MY_PEER = 0;
export const LEADER_PEER = 1;
export const ALL_PEERS = 2;

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

  return (
    <StatesContext.Provider value={states}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StatesContext.Provider>
  );
}

function findPeer(peers, peerId) {
  switch (peerId) {
  case MY_PEER: return peers.find(peerState => peerState._mine);
  case LEADER_PEER: return peers.find(peerState => peerState._leader);
  case ALL_PEERS: return peers;
  default: return peers.find(peerState => peerState._id === peerId);
  }
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
