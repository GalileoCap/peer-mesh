import {
  useMeshContext,
  MY_PEER, LEADER_PEER, ALL_PEERS,
} from 'react-peer-mesh';

function PeerState({ state }) {
  return (
    <div className={'PeerState' + (state._mine ? ' mine' : '') + (state._leader ? ' leader' : '')}>
      <p>Id: {state._id}</p>
      <p>Mine: {state._mine ? 'true' : 'false'}</p>
      <p>Leader: {state._leader ? 'true' : 'false'}</p>
      <p>Number: {state.number}</p>
    </div>
  );
}

export default function App() {
  const myId = useMeshContext(MY_PEER, (peerState) => peerState._id);
  const myState = useMeshContext(MY_PEER)
  const leaderState = useMeshContext(LEADER_PEER);
  const allStates = useMeshContext(ALL_PEERS);

  const onChange = () => window.setValue((draft) => { draft.number++ });

  return (
    <div className="App">
      <p>My id: {myId}</p>
      <PeerState state={myState} />
      <PeerState state={leaderState} />
      <button onClick={onChange}>Change</button>
      <hr />
      { allStates.map((peerState, idx) => <PeerState state={peerState} key={idx} />) }
    </div>
  );
}
