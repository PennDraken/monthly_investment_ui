document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("barChartCanvas");
    const ctx = canvas.getContext("2d");
  
    // Sample data for bars (initial y-values will be adjusted based on user clicks)
    let barData = [50, 100, 150, 200, 250]; // Heights of bars
    
    // Dynamically set canvas size based on parent container
    const updateCanvasSize = () => {
      // Update the canvas width and height based on the canvas's actual element dimensions
      canvas.width = canvas.offsetWidth; // This uses the computed width (not just the parent width)
      canvas.height = canvas.offsetHeight; // Similarly for height
    };
  
    // Calculate bar width dynamically based on the canvas size
    const calculateBarWidth = () => {
      updateCanvasSize(); // Ensure the canvas size is up to date before calculations
  
      const canvasWidth = canvas.width; // Canvas width after being set
      const barCount = barData.length; // Number of bars
      const barWidth = canvasWidth / barCount; // Calculate the width per bar, no spacing between bars
  
      return barWidth;
    };
  
    // Draw bars function
    const drawBars = () => {
      updateCanvasSize(); // Ensure canvas size is correct before rendering
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before each redraw
  
      const barWidth = calculateBarWidth(); // Get dynamic bar width
      const maxBarHeight = canvas.height - 50; // To prevent bars from exceeding canvas height
  
      // Loop through the bar data and draw the bars
      for (let i = 0; i < barData.length; i++) {
        const x = i * barWidth; // X position for each bar, no spacing
        const y = canvas.height - barData[i]; // Y position is calculated inversely from the bottom
        const height = barData[i]; // Bar height is based on the data
  
        ctx.fillStyle = "skyblue";
        ctx.fillRect(x, y, barWidth, height); // Draw the bar at calculated position
  
        ctx.fillStyle = "black";
        ctx.fillText(barData[i], x + barWidth / 2 - 10, y - 10); // Show the bar's value above it
      }
    };
  
    // Initial draw
    drawBars();
  
    // Handle the click event on the canvas
    canvas.addEventListener("click", (event) => {
      // Get mouse position relative to canvas
      const mouseX = event.offsetX;
      const mouseY = event.offsetY;
  
      // Dynamically update canvas size on every click (to be accurate)
      updateCanvasSize();
  
      // Calculate new dynamic bar width
      const barWidth = calculateBarWidth();
  
      // Check if clicked within the bar section (ignore clicks on empty spaces)
      for (let i = 0; i < barData.length; i++) {
        const x = i * barWidth;
  
        // If the click was within the x-range of the bar
        if (mouseX >= x && mouseX <= x + barWidth) {
          // Snap bar's y position based on mouse y click (invert the mouse y to match canvas coords)
          const newHeight = Math.max(0, canvas.height - mouseY); // Prevent bar height from becoming negative
  
          // Update the bar data (new y = max height - clicked position)
          barData[i] = newHeight;
  
          // Redraw the canvas with updated data
          drawBars();
          break; // Exit loop once the corresponding bar is found and updated
        }
      }
    });
  });
  