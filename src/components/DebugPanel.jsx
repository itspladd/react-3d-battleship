import { useState, useEffect } from 'react';

export default function DebugPanel({
  gameStateRef,
  viewerData,
  messageDataRef,
  debugClick
}) {
  const [details, setDetails] = useState();

  // Create the updated game engine details when they change

  useEffect(() => {
    const makeDetails = (obj, recursive = false) => {
      let list = []
      for(const key in obj) {
        if(obj[key] instanceof Object || Array.isArray(obj[key])) {
          list.push(
            <details>
              <summary>{key}</summary>
              {recursive ? makeDetails(obj[key], recursive) : `${obj[key]}`}
            </details>
          )
        }
        else {
          list.unshift(<li>{key}: {obj[key]}</li>)
        }
      }
  
      return (<ul>{list}</ul>)
    }

    setDetails(makeDetails(gameStateRef.current, true));
  }, [gameStateRef.current])

  const makeString = (arr) => {
    if(!Array.isArray(arr)) {
      arr = Object.values(arr)
    }
    return arr.map(pos => Number.parseFloat(pos).toFixed(2)).join(', ');
  }

  const mouseData = viewerData.pointer.normalizedPosition;
  const cameraPos = viewerData.camera.position;
  const cameraRot = viewerData.camera.rotation;

  const mouseDataText = makeString(mouseData);
  const cameraPosText = makeString(cameraPos);
  const cameraRotText = makeString(cameraRot);

  let currentHoverInfo = [];
  for (let key in viewerData.currentHover) {
    currentHoverInfo.push(<li key={key}>{key}: {JSON.stringify(viewerData.currentHover[key])}</li>)
  }
  return (
    <div id="info">
    <h2>Debug panel</h2>
    <p>Board update: {` ${messageDataRef.current.update}, ${messageDataRef.current.timestamp}`}</p>
    <ul>
      <li>Mouse: {mouseDataText}</li>
      <li>Camera pos: {cameraPosText}</li>
      <li>Camera rot: {cameraRotText}</li>
    </ul>
    <details>
      <summary>Current hover info</summary>
      <ul>
        {currentHoverInfo}
      </ul>
    </details>
    <button 
      onClick={() => debugClick()}
      disabled={true}
    >
      Start the game
    </button>
    <details>
      <summary>Game engine state</summary>
      {details}
    </details>
    <details>
      <summary>Last move results:</summary>
      {/* {makeDetails(status.results, true)} */}
    </details>
    <details>
      <summary>Controls info</summary>
      {/* {makeDetails(viewerData.controls, false)} */}
    </details>
  </div>
  )
}