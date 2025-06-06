import React from "react";
import ReactDOM from "react-dom/client";

function SimpleApp() {
  return (
    <div style={{ padding: '50px', backgroundColor: 'red', color: 'white', fontSize: '30px' }}>
      MINIMAL REACT TEST - If you see this, React works
    </div>
  );
}

const root = document.getElementById("root");
if (root) {
  ReactDOM.createRoot(root).render(<SimpleApp />);
} else {
  console.error("Root element not found");
}
