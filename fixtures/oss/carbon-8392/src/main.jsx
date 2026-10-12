import React, { useState } from "react";
import ReactDOM from "react-dom";
import { ToastNotification } from "carbon-components-react";
import "carbon-components/css/carbon-components.css";
import "./local.css";
function App() {
  const [shown, setShown] = useState(false);
  return <main><h1>Saved notification</h1><button onClick={() => setShown(true)}>Save changes</button>{shown && <ToastNotification kind="success" title="Saved" subtitle="Changes stored" timeout={10000} />}</main>;
}
ReactDOM.render(<App />, document.getElementById("root"));
