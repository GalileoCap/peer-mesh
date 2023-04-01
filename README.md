# Peer Mesh

A wrapper for [PeerJS](https://peerjs.com/) that makes reactive peer-to-peer connections easy using [Zustand](https://zustand-demo.pmnd.rs/).

<!--TODO: Live demo like this https://codesandbox.io/s/github/pmndrs/zustand/tree/main/examples/demo-->

```bash
npm install @galileocap/peer-mesh
```

## [Documentation](https://dev.galileocap.me/peermesh)

## Quick Start

### Create and initialize a store
In `peerStore.js`
```js
import { PeerStore } from '@galileocap/peer-mesh';

export default const usePeerStore = new PeerStore();
usePeerStore.init({ number: 0 });
```

### Use your data
```jsx
import { usePeerStore } from './store';
import { MY_PEER } from '@galileocap/peer-mesh';

function Peer({ peer }) {
  return <p>id: {peer._id}, number: {peer.number}</p>;
}

export default function App() {
  const myPeer = usePeerStore.usePeer(MY_PEER);

  return (
    <div id='App'>
      { myPeer
        ? <Peer peer={myPeer} />
        : <p>Loading...</p>
      }
    </div>
  );
}
```

### Connect to other peers
**NOTE:** You can use multiple tabs to test the perspective of multiple peers at the same time.
```jsx
import { useState } from 'react';
import { usePeerStore } from './store';
import { ALL_PEERS } from '@galileocap/peer-mesh';

function Peer({ peer }) {
  return <p>id: {peer._id}, number: {peer.number}</p>;
}

function Connect({ }) {
  const [ peerId, setPeerId ] = useState('');
  const onChangePeerId = (event) => setPeerId(event.target.value);
  const onConnect = () => usePeerStore.connectTo(peerId);

  return (
    <div>
      <input onChange={onChangePeerId} value={peerId} />
      <button onClick={onConnect}>Connect</button>
    </div>
  );
}


export default function App() {
  const allPeers = usePeerStore.usePeer(ALL_PEERS);

  return (
    <div id='App'>
      <Connect />
      {allPeers.map((peer, idx) => <Peer peer={peer} key={idx} />)}
    </div>
  );
}
```

### Update you own peer's data
And see it update in everyone's screen.
```jsx
import { useState } from 'react';
import { usePeerStore } from './store';
import { ALL_PEERS } from '@galileocap/peer-mesh';

function Peer({ peer }) {
  return <p>id: {peer._id}, number: {peer.number}</p>;
}

function Connect({ }) {
  const [ peerId, setPeerId ] = useState('');
  const onChangePeerId = (event) => setPeerId(event.target.value);
  const onConnect = () => usePeerStore.connectTo(peerId);

  return (
    <div>
      <input onChange={onChangePeerId} value={peerId} />
      <button onClick={onConnect}>Connect</button>
    </div>
  );
}

export default function App() {
  const allPeers = usePeerStore.usePeer(ALL_PEERS);
  const onIncrementMyNumber = () => {
    usePeerStore.sendUpdate((myPeer) => { myPeer.number++ });
  }

  return (
    <div id='App'>
      <Connect />
      <button onClick={onIncrementMyNumber}>Increment your number</button>
      {allPeers.map((peer, idx) => <Peer peer={peer} key={idx} />)}
    </div>
  );
}
```
