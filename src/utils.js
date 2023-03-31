export const MY_PEER = 0;
export const LEADER_PEER = 1;
export const ALL_PEERS = 2;

export function findPeer(peers, peerId) {
  switch (peerId) {
  case MY_PEER: return peers.find(peerState => peerState._mine);
  case LEADER_PEER: return peers.find(peerState => peerState._leader);
  case ALL_PEERS: return peers;
  default: return peers.find(peerState => peerState._id === peerId);
  }
}

export function findPeerIdx(peers, peerId) {
  //TODO: Merge with findPeer
  switch (peerId) {
  case MY_PEER: return peers.findIndex(peerState => peerState._mine);
  case LEADER_PEER: return peers.findIndex(peerState => peerState._leader);
  default: return peers.findIndex(peerState => peerState._id === peerId);
  }
}

export function getPeers(store) {
  return [...store.get().peers];
}

export function usePeer(peerId, usePeerStore) {
  return usePeerStore((state) => findPeer(state.peers, peerId));
}

export function useInit(usePeerStore) {
  return usePeerStore((state) => state.init);
}

export function useSendUpdate(usePeerStore) {
  return usePeerStore((state) => state.sendUpdate);
}
