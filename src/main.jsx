import {
  createContext, useContext,
  useState, useEffect,
} from 'react';
import { useImmerReducer } from 'use-immer';
import Peer from 'peerjs';

import {
  findPeer,
  MY_PEER, LEADER_PEER, ALL_PEERS,
} from './utils.js';

const StatesContext = createContext(null);
const DispatchContext = createContext(null);

function handleInit({ defaultValues, dispatch, setDone }) {
  const peer = new Peer();
  peer.on('open', () => {
    dispatch({
      type: 'newPeer',
      newPeer: {
        _peer: peer,
        _id: peer.id,
        _mine: true,
        _leader: true,
      },
    });
    setDone(true);
  });
  peer.on('connection', (newConn) => {
    dispatch({
      type: 'newPeer',
      newPeer: {
        _conn: newConn,
        _id: newConn.peer,
        _mine: false,
        _leader: false,
      },
    });
  });
  //TODO: other peer.on
}

function handleNewPeer(draft, { newPeer }) {
  draft.push(newPeer);
}

function handleConnectTo(draft, { peerId, metadata, dispatch }) {
  const newConn = findPeer(draft, MY_PEER)._peer.connect(peerId); 
  newConn.on('open', () => {  
    dispatch({
      type: 'newPeer',
      newPeer: {
        _conn: newConn,
        _id: newConn.peer,
        _mine: false,
        _leader: false,
      },
    });
  });
}

function handleUpdate(draft, { cb }) {
  cb(findPeer(draft, MY_PEER));
  //TODO: Send update to peers
}

export function MeshProvider({ defaultValues, children }) {
  const [ done, setDone ] = useState(false);
  const [ states, dispatch ] = useImmerReducer(
    (draft, action) => {
      switch (action.type) {
      case 'init': handleInit(action); break;
      case 'newPeer': handleNewPeer(draft, action); break;
      case 'connectTo': handleConnectTo(draft, action); break;
      case 'update': handleUpdate(draft, action); break;
      default: console.log(action);
      }
    }, []
  );
  useEffect(() => {
    dispatch({ ...defaultValues, dispatch, setDone, type: 'init' });
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
