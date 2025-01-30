document.addEventListener("DOMContentLoaded", () => {

    function formatNumberWithSpaces(number) {
        return new Intl.NumberFormat('sv-SE').format(number); // 'sv-SE' for Swedish locale (spaces as thousand separators)
    }
    
    // Get references to all input elements
    const lumpsumInput = document.getElementById('lumpsum');
    const lumpsumSlider = document.getElementById('lumpsum-slider');
    const interestRateInput = document.getElementById('interest-rate');
    const interestRateSlider = document.getElementById('interest-rate-slider');
    const yearsInput = document.getElementById('years');
    const yearsSlider = document.getElementById('years-slider');
    const resultCanvas = document.getElementById('resultCanvas');
    const resultContext = resultCanvas.getContext("2d");
    const finalValueText = document.getElementById('final-value-number');
    const yearLabel = document.getElementById('year-label');

    // Function to update values when slider changes
    // Set up event listeners for the sliders and inputs
    lumpsumSlider.addEventListener('input', () => {
        lumpsumInput.value = lumpsumSlider.value;
        updateResults();
    });

    interestRateSlider.addEventListener('input', () => {
        interestRateInput.value = interestRateSlider.value;
        updateResults();
    });
    yearsSlider.addEventListener('input', () => {
        yearsInput.value = yearsSlider.value;
        drawBars();
        updateResults();
    });

    // Function to update values when text input changes
    lumpsumInput.addEventListener('input', () => {
        lumpsumSlider.value = lumpsumInput.value;
        updateResults();
    });
    interestRateInput.addEventListener('input', () => {
        interestRateSlider.value = interestRateInput.value;
        updateResults();
    });
    yearsInput.addEventListener('input', () => {
        yearsSlider.value = yearsInput.value;
        drawBars();
        updateResults();
    });

    const canvas = document.getElementById("barChartCanvas");
    const ctx = canvas.getContext("2d");

    // Sample data for bars (initial values that will be adjusted to the range of 0 to 30,000)
    // let barData = [0, 10000, 0, 5000, 6000]; // Heights of bars
    let barData = new Array(50).fill(1000);
    // Maximum possible height for a bar
    const MAX_BAR_HEIGHT = 15000;

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
        const years = parseInt(yearsInput.value);
        const barCount = years;
        const barWidth = canvasWidth / barCount;
        return barWidth;
    };

    // Draw bars function
    const drawBars = () => {
        updateCanvasSize(); // Ensure canvas size is correct before rendering
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before each redraw

        const barWidth = calculateBarWidth(); // Get dynamic bar width
        const maxBarHeight = canvas.height; // Max height constraint for bars
        const years = parseInt(yearsInput.value);
        const maxValue = Math.max(...barData);
        const tempMaxValue = Math.max(MAX_BAR_HEIGHT, maxValue + 5000)
        const gap = 20

        // Draw horisontal ticks
        for (let i = 0; i < tempMaxValue; i += 5000) {
            const y = canvas.height - Math.min(maxBarHeight, (i / tempMaxValue) * canvas.height);
        
            ctx.beginPath();        // Start a new path
            ctx.moveTo(0, y);       // Move to the starting point (left edge, at height y)
            ctx.lineTo(canvas.width, y);   // Draw to the right edge (same y-coordinate)
            ctx.strokeStyle = "gray";  // Set the line color
            ctx.lineWidth = 2;      // Set line width (optional)
            ctx.stroke();           // Render the line
        }
        
        // Loop through the bar data and draw the bars
        for (let i = 0; i < years; i++) {
            const x = i * barWidth; // X position for each bar, no spacing
            const originalHeight = barData[i]; // Original height based on barData

            const barHeight = Math.min(maxBarHeight, (originalHeight / tempMaxValue) * canvas.height);
            const y = canvas.height - barHeight; // Y position is calculated inversely from the bottom

            ctx.fillStyle = "skyblue";
            ctx.fillRect(x + gap/2, y, barWidth - gap, barHeight); // Draw the bar at calculated position

            ctx.fillStyle = "white";
            ctx.font = "12px Arial";  // Set the font size to 20px (you can adjust this value)
            ctx.textAlign = "center";
            ctx.fillText(formatNumberWithSpaces(originalHeight), x + barWidth / 2 , y - 10); // Show the original value (from barData)
        }

        // Draw text
        for (let i = 5000; i < tempMaxValue; i += 5000) {
            const y = canvas.height - Math.min(maxBarHeight, (i / tempMaxValue) * canvas.height);
        
            ctx.font = "20px Arial";  // Set the font size to 20px (you can adjust this value)
            ctx.textAlign = "left";   // Align text to the left
            ctx.fillStyle = "white";
            ctx.fillText(formatNumberWithSpaces(i), 10, y);    
        }
        
    };

    // Initial scale and draw
    drawBars();

    let isMousePressed = false; // To track if the mouse is pressed

    canvas.addEventListener("mousedown", (event) => {
        isMousePressed = true; // Mouse button is pressed
        handleMouseEvent(event); // Handle the current mouse click
    });

    canvas.addEventListener("mouseup", () => {
        isMousePressed = false; // Mouse button is released
    });

    canvas.addEventListener("mousemove", (event) => {
        if (isMousePressed) {
            handleMouseEvent(event); // Update the bar while the mouse is moving and pressed
        }
    });

    function handleMouseEvent(event) {
        const mouseX = event.offsetX;
        const mouseY = event.offsetY;

        updateCanvasSize(); // Dynamically update canvas size on click

        const barWidth = calculateBarWidth(); // Get the updated bar width
        const maxValue = Math.max(...barData)
        const tempMaxValue = Math.max(MAX_BAR_HEIGHT, maxValue + 5000)

        for (let i = 0; i < barData.length; i++) {
            const x = i * barWidth;

            if (mouseX >= x && mouseX <= x + barWidth) {
                const pixelHeight = Math.max(0, canvas.height - mouseY);
                // Convert the pixel height to the corresponding bar value
                const newHeight = (pixelHeight / canvas.height) * tempMaxValue;
                // Snap the new height to the nearest multiple of SNAP_VALUE
                const snappedHeight = Math.round(newHeight / SNAP_VALUE) * SNAP_VALUE;

                barData[i] = snappedHeight; // Update the bar data with the snapped value

                drawBars(); // Redraw the bars with the updated data
                break;
            }
        }

        updateResults(); // Update the results whenever the mouse is dragged over a bar
    }


    function calculateMonthlyCapital(lumpsum, savingsList, rate) {
        const rateFrac = 1 + rate;
        let capital = lumpsum;
        const capitalMonthlyHistory = [capital];

        savingsList.forEach(monthlySavings => {
            for (let i = 0; i < 12; i++) {
                // Monthly compound
                capital += monthlySavings;
                capital = capital * Math.pow(rateFrac, 1 / 12);
                capitalMonthlyHistory.push(capital);
            }
        });

        return capitalMonthlyHistory;
    }

    function updateResults() {
        const lumpsum = parseFloat(lumpsumInput.value);
        const interestRate = parseFloat(interestRateInput.value) / 100;  // Convert percentage to decimal
        const years = parseInt(yearsInput.value);

        // Example savings list for each year
        // const savingsList = new Array(years).fill(1000); // Each year deposits 1000

        const savingsList = barData.slice(0, years);

        // Get the calculated capital history
        const capitalHistory = calculateMonthlyCapital(lumpsum, savingsList, interestRate);

        // Draw the result graph
        drawGraph(capitalHistory);

        finalValueText.textContent = formatNumberWithSpaces(Math.max(...capitalHistory).toFixed(0));
        yearLabel.textContent = years;
    }

    // Function to draw the capital history on the result canvas
    function drawGraph(capitalHistory) {
        resultCanvas.width  = resultCanvas.offsetWidth;
        resultCanvas.height = resultCanvas.offsetHeight;

        const maxCapital = Math.max(...capitalHistory); // Maximum value of capital to scale bars

        resultContext.clearRect(0, 0, resultCanvas.width, resultCanvas.height); // Clear canvas
        
        // Draw horisontal ticks
        for (let i = 0; i < maxCapital; i += 250000) {
            const y = resultCanvas.height - (i / maxCapital) * resultCanvas.height;
        
            resultContext.beginPath();        // Start a new path
            resultContext.moveTo(0, y);       // Move to the starting point (left edge, at height y)
            resultContext.lineTo(resultCanvas.width, y);   // Draw to the right edge (same y-coordinate)
            resultContext.strokeStyle = "gray";  // Set the line color
            resultContext.lineWidth = 2;      // Set line width (optional)
            resultContext.stroke();           // Render the line
        }
        

        // Loop through and plot each point
        for (let i = 0; i < capitalHistory.length; i++) {
            const x = (i / capitalHistory.length) * resultCanvas.width;
            const y = resultCanvas.height - (capitalHistory[i] / maxCapital) * resultCanvas.height;  // Inverse so that higher values go up

            resultContext.fillStyle = "skyblue";
            resultContext.fillRect(x, y, resultCanvas.width / capitalHistory.length + 1, resultCanvas.height - y); // Draw the bars representing capital over time
        }

        // Draw text
        for (let i = 0; i < maxCapital; i += 250000) {
            const y = resultCanvas.height - (i / maxCapital) * resultCanvas.height;

            if (i > Math.min(...capitalHistory)) {
                resultContext.font = "20px Arial";  // Set the font size to 20px (you can adjust this value)
                resultContext.fillStyle = "white";
                resultContext.fillText(formatNumberWithSpaces(i), 0, y);    
            }
        }


        for (let i = 0; i < capitalHistory.length; i++) {
            const x = (i / capitalHistory.length) * resultCanvas.width;
            const y = resultCanvas.height - (capitalHistory[i] / maxCapital) * resultCanvas.height;  // Inverse so that higher values go up

            if (i % 24 == 0) {
                resultContext.beginPath();        // Start a new path
                resultContext.moveTo(x, 0);       // Move to the starting point (left edge, at height y)
                resultContext.lineTo(x, resultCanvas.height);   // Draw to the right edge (same y-coordinate)
                resultContext.strokeStyle = "gray";  // Set the line color
                resultContext.lineWidth = 2;      // Set line width (optional)
                resultContext.stroke();           // Render the line
                
                resultContext.font = "20px Arial";  // Set the font size to 20px (you can adjust this value)
                resultContext.fillStyle = "white";
                resultContext.textAlign = "center"
                resultContext.fillText(Math.round(i/12), x, resultCanvas.height);    

            }

        }
        // // Draw vertical ticks TODO fix not working currently
        // for (let i = 0; i < maxCapital.length; i += 12) {
        //     const x = i * (i / capitalHistory.length) * resultCanvas.width;
        // 
        //     resultContext.beginPath();        // Start a new path
        //     resultContext.moveTo(x, 0);       // Move to the starting point (left edge, at height y)
        //     resultContext.lineTo(x, resultCanvas.height);   // Draw to the right edge (same y-coordinate)
        //     resultContext.strokeStyle = "gray";  // Set the line color
        //     resultContext.lineWidth = 2;      // Set line width (optional)
        //     resultContext.stroke();           // Render the line
        // }
    }
    // Initially update the results when the page loads
    updateResults();

});