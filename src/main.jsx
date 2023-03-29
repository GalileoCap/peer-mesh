import {
  createContext, useContext,
  useState, useEffect,
} from 'react';

import { useReducer } from './reducer';
import {
  findPeer,
  MY_PEER, LEADER_PEER, ALL_PEERS,
} from './utils.js';

const StatesContext = createContext(null);
const DispatchContext = createContext(null);

export function MeshProvider({ defaultValues, children }) {
  const [ done, setDone ] = useState(false);
  const [ states, dispatch ] = useReducer([]);
  useEffect(() => {
    dispatch({
      type: 'init', dispatch, setDone,
      defaultValues,
    });
  }, []);

  return (
    <StatesContext.Provider value={states}>
      <DispatchContext.Provider value={dispatch}>
        { children }
      </DispatchContext.Provider>
    </StatesContext.Provider>
  );
}

export function useMeshContext(peerId, cb) {
  const peers = useContext(StatesContext);
  const res = findPeer(peers, peerId);

  if (cb) return cb(res);
  else return res;
}

function useDispatchContext() {
  return useContext(DispatchContext);
}

export function useDispatchUpdate() {
  const dispatch = useDispatchContext();
  return (cb) => dispatch({type: 'update', cb});
}

export function useDispatchConnectTo() {
  const dispatch = useDispatchContext();
  return (peerId, metadata) => dispatch({
    type: 'connectTo', dispatch,
    peerId, metadata,
  });
}
