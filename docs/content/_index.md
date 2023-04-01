---
title: Introduction
type: docs
---

# Peer Mesh

A wrapper for [PeerJS](https://peerjs.com/) that makes reactive peer-to-peer connections easy using [Zustand](https://zustand-demo.pmnd.rs/).

<!--TODO: Live demo like this https://codesandbox.io/s/github/pmndrs/zustand/tree/main/examples/demo-->

## Installation
```bash
npm install @galileocap/peer-mesh
```


## [**Quick Start**]({{< relref "/quick-start" >}})
### Basic use
```jsx
import { PeerStore } from '@galileocap/peer-mesh';
const usePeerStore = new PeerStore();
```

## [**API**]({{< relref "/api" >}})
* [PeerStore]({{< relref "/api#peerstore" >}})
* [init]({{< relref "/api#init" >}})
* [getPeer]({{< relref "/api#getpeer" >}})
* [usePeer]({{< relref "/api#usepeer" >}})
* [sendUpdate]({{< relref "/api#sendupdate" >}})
* [connectTo]({{< relref "/api#connectto" >}})
* [sendMessage]({{< relref "/api#sendmessage" >}})
* [subscribeToMessage]({{< relref "/api#subscribetomessage" >}})
* [unsubscribeFromMessage]({{< relref "/api#unsubscribefrommessage" >}})
* [Peers]({{< relref "/api#peers" >}})
