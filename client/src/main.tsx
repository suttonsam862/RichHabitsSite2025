console.log("main.tsx loaded");

try {
  console.log("About to create root element");
  const root = document.getElementById("root");
  console.log("Root element:", root);
  
  if (root) {
    console.log("Creating React root and rendering");
    root.innerHTML = '<div style="padding: 50px; background: red; color: white; font-size: 30px;">DIRECT DOM TEST - No React</div>';
  } else {
    console.error("Root element not found");
    document.body.innerHTML = '<div style="padding: 50px; background: blue; color: white; font-size: 30px;">NO ROOT ELEMENT FOUND</div>';
  }
} catch (error) {
  console.error("Error in main.tsx:", error);
  document.body.innerHTML = '<div style="padding: 50px; background: orange; color: white; font-size: 30px;">JAVASCRIPT ERROR: ' + error.message + '</div>';
}
