import React, { useContext } from 'react';

import { SocketContext } from './socket-context.js';

function Test() {
  const socket = useContext(SocketContext);
  console.log(socket);


  return (
	<div>{socket}</div>
  )

}

export default Test;