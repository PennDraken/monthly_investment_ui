document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("barChartCanvas");
    const ctx = canvas.getContext("2d");
  
    // Sample data for bars (initial values that will be adjusted to the range of 0 to 30,000)
    let barData = [0, 10000, 0, 5000, 6000]; // Heights of bars
  
    // Maximum possible height for a bar
    const MAX_BAR_HEIGHT = 30000; // This corresponds to 30,000 in scale.
  
    // Define the snap value (this can be easily adjusted in one place now)
    const SNAP_VALUE = 1000; // Snap to the closest multiple of 1000
    
    // Dynamically set canvas size based on parent container
    const updateCanvasSize = () => {
      canvas.width = canvas.offsetWidth; // Use actual canvas width
      canvas.height = canvas.offsetHeight; // Use actual canvas height
    };
  
    // Calculate bar width dynamically based on the canvas size
    const calculateBarWidth = () => {
      updateCanvasSize();
      const canvasWidth = canvas.width;
      const barCount = barData.length;
      const barWidth = canvasWidth / barCount;
      return barWidth;
    };
  
    // Draw bars function
    const drawBars = () => {
        updateCanvasSize(); // Ensure canvas size is correct before rendering
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before each redraw
      
        const barWidth = calculateBarWidth(); // Get dynamic bar width
        const maxBarHeight = canvas.height; // Max height constraint for bars
        
        // Loop through the bar data and draw the bars
        for (let i = 0; i < barData.length; i++) {
          const x = i * barWidth; // X position for each bar, no spacing
          const originalHeight = barData[i]; // Original height based on barData
          
          const height = Math.min(maxBarHeight, (originalHeight / MAX_BAR_HEIGHT) * canvas.height);
          const y = canvas.height - height; // Y position is calculated inversely from the bottom
      
          ctx.fillStyle = "skyblue";
          ctx.fillRect(x, y, barWidth, height); // Draw the bar at calculated position
      
          ctx.fillStyle = "white";
          ctx.fillText(originalHeight, x + barWidth / 2 - 10, y - 10); // Show the original value (from barData)
        }
      };
      
      
  
    // Initial scale and draw
    drawBars();
  
    // Handle the click event on the canvas
    canvas.addEventListener("click", (event) => {
      const mouseX = event.offsetX;
      const mouseY = event.offsetY;
  
      updateCanvasSize(); // Dynamically update canvas size on click
  
      const barWidth = calculateBarWidth(); // Get the updated bar width
  
      for (let i = 0; i < barData.length; i++) {
        const x = i * barWidth;
  
        if (mouseX >= x && mouseX <= x + barWidth) {
            const pixelHeight = Math.max(0, canvas.height - mouseY);
            // Turn to value in bar graph
            const newHeight = (pixelHeight / canvas.height) * MAX_BAR_HEIGHT;
            // Snap the new height to the nearest multiple of SNAP_VALUE
            const snappedHeight = Math.round(newHeight / SNAP_VALUE) * SNAP_VALUE;
            
            barData[i] = snappedHeight; // Update the bar data with the snapped value
    
            drawBars(); // Redraw the bars with the updated data
            break;
        }
      }
    });
  });
  