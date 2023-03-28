import {
  createContext, useContext,
} from 'react';
import { useImmer } from 'use-immer';

export const MY_PEER = 0;
export const LEADER_PEER = 1;
export const ALL_PEERS = 2;

const MeshContext = createContext(null);

export function MeshProvider({ defaultValues, children }) {
  const [ value, setValue ] = useImmer([
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
  window.setValue = (cb) => setValue((draft) => {
    const res = cb(draft[0]);
    if (res !== undefined) draft[0] = res;
  });

  return (
    <MeshContext.Provider value={value}>
      {children}
    </MeshContext.Provider>
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
  const peers = useContext(MeshContext)
  const res = findPeer(peers, peerId);

  if (cb) return cb(res);
  else return res;
}
