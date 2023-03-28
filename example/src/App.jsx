import { useMeshContext } from 'react-peer-mesh';

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
  const [ myState, leaderState, ] = useMeshContext();

  const onChange = () => window.setValue((draft) => { draft.number++ });

  return (
    <div className="App">
      <PeerState state={myState} />
      <PeerState state={leaderState} />
      <button onClick={onChange}>Change</button>
      <hr />
    </div>
  );
}
