import { useState } from 'react';
import {
  useMeshContext,
  useDispatchUpdate, useDispatchConnectTo,
  MY_PEER, LEADER_PEER, ALL_PEERS,
} from 'react-peer-mesh';

function PeerState({ state }) {
  const onCopyId = () => navigator.clipboard.writeText(state._id);

  return (
    <div className={'PeerState' + (state._mine ? ' mine' : '') + (state._leader ? ' leader' : '')}>
      <p onClick={onCopyId}>Id: {state._id}</p>
      <p>Mine: {state._mine ? 'true' : 'false'}</p>
      <p>Leader: {state._leader ? 'true' : 'false'}</p>
      <p>Number: {state.number}</p>
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
  const myState = useMeshContext(MY_PEER)
  const leaderState = useMeshContext(LEADER_PEER);
  const allStates = useMeshContext(ALL_PEERS);

  const dispatchUpdate = useDispatchUpdate();
  const onIncNumber = () => dispatchUpdate((draft) => draft.number++);

  const [ peerId, setPeerId ] = useState('');
  const onChange = (event) => setPeerId(event.target.value);
  const dispatchConnectTo = useDispatchConnectTo();
  const onConnect = () => dispatchConnectTo(peerId);

  return (
    <div className="App">
      {
        myState === undefined
        ? <Loading />
        : <>
          <PeerState state={myState} />
          <PeerState state={leaderState} />
          <div>
            <button onClick={onIncNumber}>IncNumber</button>
            <input type='text' onChange={onChange} value={peerId} />
            <button onClick={onConnect}>Connect</button>
          </div>
          <hr />
          { allStates.map((peerState, idx) => <PeerState state={peerState} key={idx} />) }
        </>
      }
    </div>
  );
}
