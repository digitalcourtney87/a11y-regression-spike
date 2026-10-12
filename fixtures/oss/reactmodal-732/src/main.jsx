import React from "react";
import ReactDOM from "react-dom";
import Modal from "react-modal";
const h = React.createElement;
Modal.setAppElement("#root");
class App extends React.Component {
  state = { open: false };
  render() {
    return h("main", null,
      h("h1", null, "Dialog tab boundary"),
      h("button", { onClick: () => this.setState({ open: true }) }, "Open dialog"),
      h("button", null, "Outside"),
      h(Modal, { isOpen: this.state.open, onRequestClose: () => this.setState({ open: false }), contentLabel: "Details", role: "dialog" },
        h("button", { style: { display: "none" } }, "Hidden first"),
        h("button", null, "First action"),
        h("button", null, "Last action"),
        h("button", { style: { display: "none" } }, "Hidden last")
      )
    );
  }
}
ReactDOM.render(h(App), document.getElementById("root"));
