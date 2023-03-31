import { useState, useEffect } from 'react';
import {
  createPeerStore,
  usePeer, useInit, useSendUpdate, useConnectTo, useSendMessage,
  useSubscribeToMessage, useUnsubscribeFromMessage,
  MY_PEER, LEADER_PEER, ALL_PEERS,
} from 'react-peer-mesh';

const usePeerStore = createPeerStore();

function PeerState({ state }) {
  const onCopyId = () => navigator.clipboard.writeText(state._id);

  return (
    <div className={'PeerState' + (state._mine ? ' mine' : '') + (state._leader ? ' leader' : '')}>
      <p onClick={onCopyId}>Id: {state._id}</p>
      <p>Mine: {state._mine ? 'true' : 'false'}</p>
      <p>Leader: {state._leader ? 'true' : 'false'}</p>
      <p>Number: {state.number}</p>
      <p>PrevNumber: {state.prevNumber}</p>
    </div>
  );
}

function Loading() {
  return (
    <div id='Loading'>
      Loading...
    </div>
  );
}

export default function App() {
  const init = useInit(usePeerStore);
  const sendUpdate = useSendUpdate(usePeerStore);
  const connectTo = useConnectTo(usePeerStore);
  const sendMessage = useSendMessage(usePeerStore);
  const subscribeToMessage = useSubscribeToMessage(usePeerStore);

  const myPeer = usePeer(MY_PEER, usePeerStore);
  const leaderPeer = usePeer(LEADER_PEER, usePeerStore);
  const allPeers = usePeer(ALL_PEERS, usePeerStore);

  useEffect(() => {
    if (myPeer === undefined)
      init({number: 0});
  }, [myPeer]);

  const onIncNumberA = () => sendUpdate((myState) => {
    myState.prevNumber = myState.number;
    myState.number++;
  });
  const onIncNumberB = () => sendUpdate((myState) => ({
    prevNumber: myState.number,
    number: myState.number + 1,
  }));

  const [ peerId, setPeerId ] = useState('');
  const onChangePeerId = (event) => setPeerId(event.target.value);
  const onConnect = () => connectTo(peerId);

  const onMessage = () => sendMessage(ALL_PEERS, 'example', 'This is an example message');
  useEffect(() => {
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
          <div>
            <input type='text' onChange={onChangePeerId} value={peerId} />
            <button onClick={onConnect}>Connect</button>
            <button onClick={onIncNumberA}>IncNumberA</button>
            <button onClick={onIncNumberB}>IncNumberB</button>
            <button onClick={onMessage}>Send message</button>
          </div>
          <hr />
          { allPeers.map((peerState, idx) => <PeerState state={peerState} key={idx} />) }
        </>
      }
    </div>
  );
}
