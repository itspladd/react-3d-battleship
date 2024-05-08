import { useState } from 'react';

export default function ControlsPanel() {

  const [showControls, setShowControls] = useState(true)

  const showControlsButton = <button onClick={() => setShowControls(!showControls)}>{showControls ? 'Hide' : 'Show'} controls window</button>

  return (
    <div id="controls">

      <div id="control-columns">
        <div class="control-col">
          <h3>Camera controls:</h3>
          <ul>
            <li>Hold left click to pan camera</li>
            <li>Hold right click to rotate camera</li>
            <li>Scroll to zoom</li>
          </ul>
        </div>
        <div class="control-col">
          <h3>Ship placement:</h3>
          <ul>
            <li>Left-click a ship to pick it up</li>
            <li>Scroll to rotate a ship while it's being held</li>
            <li>While holding a ship, click a valid tile to place the ship</li>
            <li>The ship must fit inside the light blue squares on your board without overlapping other ships!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}