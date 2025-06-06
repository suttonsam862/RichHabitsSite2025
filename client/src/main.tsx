import React from "react";
import { createRoot } from "react-dom/client";

function MinimalApp() {
  return React.createElement("div", {
    style: {
      padding: "50px",
      backgroundColor: "#4CAF50",
      color: "white",
      fontSize: "24px",
      textAlign: "center"
    }
  }, "REACT IS WORKING - Vite Plugin Fixed");
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(React.createElement(MinimalApp));
}
