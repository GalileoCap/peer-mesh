import { useState } from 'react';
import { usePeerStore } from './store';
import { ALL_PEERS } from '@galileocap/peer-mesh';

function Peer({ peer }) {
  return <p>id: {peer._id}, number: {peer.number}</p>;
}

function Connect({ }) {
  const [ peerId, setPeerId ] = useState('');

  return (
    <div>
      <input onChange={(event) => setPeerId(event.target.value)} value={peerId} />
      <button onClick={() => usePeerStore.connectTo(peerId)}>Connect</button>
    </div>
  );
}


export default function App() {
  const allPeers = usePeerStore.usePeer(ALL_PEERS);
  const onIncrementMyNumber = () => {
		usePeerStore.sendUpdate((myPeer) => { myPeer.number++ });
	}

  const sharedNumber = usePeerStore.useShared().number;
  const onIncrementSharedNumber = () => {
		usePeerStore.sharedUpdate((sharedState) => { sharedState.number++; });
	}

  return (
    <div id='App'>
      <Connect />
			<button onClick={onIncrementMyNumber}>Increment your number</button>
      <button onClick={onIncrementSharedNumber}>Increment shared number</button>
      <p>Shared number: {sharedNumber}</p>
      {allPeers.map((peer, idx) => <Peer peer={peer} key={idx} />)}
    </div>
  );
}

