import { useState, useEffect } from 'react';
import { MY_PEER, LEADER_PEER, ALL_PEERS } from '@galileocap/peer-mesh';

import { PeerState, Loading } from './components';
import { usePeerStore } from './peerStore';

function Actions() {
  const onIncNumberA = () => usePeerStore.sendUpdate((myState) => {
    myState.prevNumber = myState.number;
    myState.number++;
  });
  const onIncNumberB = () => usePeerStore.sendUpdate((myState) => ({
    prevNumber: myState.number,
    number: myState.number + 1,
  }));

  const [ peerId, setPeerId ] = useState('');
  const onChangePeerId = (event) => setPeerId(event.target.value);
  const onConnect = () => usePeerStore.connectTo(peerId, {}).then(() => console.log('Connect!'));

  const onMessage = () => usePeerStore.sendMessage(ALL_PEERS, 'example', 'This is an example message');

  return (
    <div id='Actions'>
      <input type='text' onChange={onChangePeerId} value={peerId} />
      <button onClick={onConnect}>Connect</button>
      <button onClick={onIncNumberA}>IncNumberA</button>
      <button onClick={onIncNumberB}>IncNumberB</button>
      <button onClick={onMessage}>Send message</button>
    </div>
  );
}

export default function App() {
  const myPeer = usePeerStore.usePeer(MY_PEER);
  const leaderPeer = usePeerStore.usePeer(LEADER_PEER);
  const allPeers = usePeerStore.usePeer(ALL_PEERS);

  useEffect(() => {
    usePeerStore.subscribeToMessage('example', console.log);
  }, []);

  return (
    <div className="App">
      {
        myPeer === undefined
        ? <Loading />
        : <>
          <PeerState state={myPeer} />
          <PeerState state={leaderPeer} />
          <Actions />
          <hr />
          { allPeers.map((peerState, idx) => <PeerState state={peerState} key={idx} />) }
        </>
      }
    </div>
  );
}
