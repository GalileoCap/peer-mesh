import { useState, useEffect } from 'react';
import {
  useInit, usePeer,
  useSendUpdate, useConnectTo, useSendMessage,
  useSubscribeToMessage,
  MY_PEER, LEADER_PEER, ALL_PEERS,
} from '@galileocap/peer-mesh';

import { PeerState, Loading } from './components';
import { usePeerStore } from './peerStore';

function Actions() {
  const sendUpdate = useSendUpdate(usePeerStore.store);
  const onIncNumberA = () => sendUpdate((myState) => {
    myState.prevNumber = myState.number;
    myState.number++;
  });
  const onIncNumberB = () => sendUpdate((myState) => ({
    prevNumber: myState.number,
    number: myState.number + 1,
  }));

  const [ peerId, setPeerId ] = useState('');
  const connectTo = useConnectTo(usePeerStore.store);
  const onChangePeerId = (event) => setPeerId(event.target.value);
  const onConnect = () => connectTo(peerId);

  const sendMessage = useSendMessage(usePeerStore.store);
  const onMessage = () => sendMessage(ALL_PEERS, 'example', 'This is an example message');

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
  const subscribeToMessage = useSubscribeToMessage(usePeerStore.store);

  const myPeer = usePeer(MY_PEER, usePeerStore.store);
  const leaderPeer = usePeer(LEADER_PEER, usePeerStore.store);
  const allPeers = usePeer(ALL_PEERS, usePeerStore.store);

  useEffect(() => {
    usePeerStore.init({number: 0});
    subscribeToMessage('example', console.log);
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
