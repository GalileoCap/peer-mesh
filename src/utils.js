import _ from 'lodash';

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

export function omitPrivate(peer) {
  return _.omitBy(peer, (value, key) => key.startsWith('_'));
}

export function getStore(useStore) {
  return { set: useStore.setState, get: useStore.getState };
}

export function getPeers(store) {
  return [...store.get().peers];
}

export function getSubscribedMessages(store) {
  return {...store.get().subscribedMessages};
}

export function usePeer(peerId, usePeerStore) {
  return usePeerStore((state) => findPeer(state.peers, peerId));
}

export function useSendUpdate(usePeerStore) {
  return usePeerStore((state) => state.sendUpdate);
}

export function useConnectTo(usePeerStore) {
  return usePeerStore((state) => state.connectTo);
}

export function useSendMessage(usePeerStore) {
  return usePeerStore((state) => state.sendMessage);
}

export function useSubscribeToMessage(usePeerStore) {
  return usePeerStore((state) => state.subscribeToMessage);
}

export function useUnsubscribeFromMessage(usePeerStore) {
  return usePeerStore((state) => state.unsubscribeFromMessage);
}
