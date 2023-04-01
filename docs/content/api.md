---
weight: 1
title: "PeerStore API"
---

# API

## PeerStore
```jsx
import { PeerStore } from '@galileocap/peer-mesh';
const usePeerStore = new PeerStore();
```
Used in all other methods.
**NOTE:** You can use `usePeerStore.store` as a [Zustand](https://zustand-demo.pmnd.rs/) store, but this is not advised.

### init
```jsx
usePeerStore.init(defaultValues = {});
```
Initializes the store and gets you a peer.  
The default values will be used when constructing a peer (yours and when connecting to others).

### getPeer
```jsx
usePeerStore.getPeer(peerId = '<peerId>' | MY_PEER | LEADER_PEER | ALL_PEERS);
```
Returns the peer with matching id (see: [Peers](#peers)).  
**WARNING:** On React use [`usePeer`](#usepeer).

### usePeer
```jsx
usePeerStore.usePeer(peerId = '<peerId>' | MY_PEER | LEADER_PEER | ALL_PEERS);
```
Returns the peer with matching id for React (see: [Peers](#peers)).

### sendUpdate
```jsx
usePeerStore.sendUpdate(cb = (peer) => {});
```
Uses the callback function to update your peer's state and sends that update to the other peers.  
The callback function may update the peer's state or return the new value.  
**WARNING:** Keys starting with `'_'` will be ignored when sending updates.

### connectTo
```jsx
usePeerStore.connectTo(peerId = '<peerId>', metadata = {});
```
Connects to another peer.  
The metadata is ignored for now.  

### sendMessage
```jsx
usePeerStore.sendMessage(
  peerId = '<peerId>' | LEADER_PEER | ALL_PEERS,
  type = '<type>',
  data
);
```
Sends a message of a type to another peer (see [`subscribeToMessage`](#subscribetomessage)).  
**WARNING:** Don't send updates this way, it's better to have a private property and use [`sendUpdate`](#sendupdate).  
**NOTE:** Don't use the message types `'_get', '_set', '_connectTo'`.

### subscribeToMessage
```jsx
usePeerStore.subscribeToMessage(type = '<type>', cb = () => {});
```
When a message of this type is received the callback function will get fired.  
**NOTE:** Don't use the message types `'_get', '_set', '_connectTo'`.  

### unsubscribeFromMessage
```jsx
usePeerStore.unsubscribeFromMessage(type = '<type>');
```
Undoes [`subscribeToMessage`](#subscribetomessage) 

## Peers
```jsx
{
  ...defaultValues, // From init()
  _peer, _conn, // PeerJS peer/connection, for private use only
  _id, // This peer's unique id
  _mine, // True if this is your peer
  _leader // True if this is the leader
}
```
All values set with [`sendUpdate`](#sendupdate) will appear here.  
**WARNING:** Keys starting with `'_'` will be ignored when sending updates.

## Utils

### Special id's
```jsx
import { MY_PEER, LEADER_PEER, ALL_PEERS } from '@galileocap/peer-mesh';
```

There's a few special peer id's, these let you get:
* MY\_PEER, returns your peer, beings as `undefined` until you [initialize](#init) the store.
* LEADER\_PEER, returns the peer that's the leader.
* ALL\_PEERS, returns an array of peers instead.

