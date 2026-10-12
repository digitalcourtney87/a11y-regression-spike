import React from "react";
import ReactDOM from "react-dom";
import Modal from "react-modal";
Modal.setAppElement("#root");
class App extends React.Component {
  state = { open: false };
  render() {
    return <main>
      <h1>Dialog tab boundary</h1>
      <button onClick={() => this.setState({ open: true })}>Open dialog</button>
      <button>Outside</button>
      <Modal isOpen={this.state.open} onRequestClose={() => this.setState({ open: false })} contentLabel="Details">
        <button style={{ display: "none" }}>Hidden first</button>
        <button>First action</button>
        <button>Last action</button>
        <button style={{ display: "none" }}>Hidden last</button>
      </Modal>
    </main>;
  }
}
ReactDOM.render(<App />, document.getElementById("root"));
