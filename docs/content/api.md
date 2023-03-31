---
weight: 1
title: "API"
---

# API

## Peers

### MY\_PEER
### LEADER\_PEER

## createPeerStore
```jsx
const <usePeerStore> = createPeerStore();
```
Creates a peer store to be used in the other methods.  
Can be used as any [Zustand](https://zustand-demo.pmnd.rs/) store, but that's not recommended.

## useInit
```jsx
useInit(<usePeerStore>);
```
Creates a peer store to be used in the other methods.  
Can be used as any [Zustand](https://zustand-demo.pmnd.rs/) store, but that's not recommended.

## usePeer
```jsx
const <peer> = usePeer(<peerId>, <usePeerStore>);
```
Returns the peer with the specified id. See [Peers](#peers) to see what you can do with them.  
You can also use the constants `MY_PEER`, `LEADER_PEER`, or `ALL_PEERS` to get those peers.

## useSendUpdate
```jsx
const sendUpdate = useSendUpdate(<usePeerStore>);
```
Returns the peer with the specified id. See [Peers](#peers) to see what you can do with them.  
You can also use the constants `MY_PEER`, `LEADER_PEER`, or `ALL_PEERS` to get those peers.

## useConnectTo
```jsx
const <peer> = usePeer(<peerId>, <usePeerStore>);
```
Returns the peer with the specified id. See [Peers](#peers) to see what you can do with them.  
You can also use the constants `MY_PEER`, `LEADER_PEER`, or `ALL_PEERS` to get those peers.

## useSendMessage
```jsx
const <peer> = usePeer(<peerId>, <usePeerStore>);
```
Returns the peer with the specified id. See [Peers](#peers) to see what you can do with them.  
You can also use the constants `MY_PEER`, `LEADER_PEER`, or `ALL_PEERS` to get those peers.

## useSubscribeToMessage
```jsx
const <peer> = usePeer(<peerId>, <usePeerStore>);
```
Returns the peer with the specified id. See [Peers](#peers) to see what you can do with them.  
You can also use the constants `MY_PEER`, `LEADER_PEER`, or `ALL_PEERS` to get those peers.

## useUnsubscribeFromMessage
```jsx
const <peer> = usePeer(<peerId>, <usePeerStore>);
```
Returns the peer with the specified id. See [Peers](#peers) to see what you can do with them.  
You can also use the constants `MY_PEER`, `LEADER_PEER`, or `ALL_PEERS` to get those peers.

