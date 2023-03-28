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
