document.addEventListener("DOMContentLoaded", () => {

    function formatNumberWithSpaces(number) {
        return new Intl.NumberFormat('sv-SE').format(number); // 'sv-SE' for Swedish locale (spaces as thousand separators)
    }

    function convertTextToNumber(text) {
        // Remove spaces and parse the resulting string as an integer
        return parseFloat(text.replace(/\s+/g, ''), 10);
    }

    // Get references to all input elements
    const lumpsumInput = document.getElementById('lumpsum');
    const lumpsumSlider = document.getElementById('lumpsum-slider');
    const interestRateInput = document.getElementById('interest-rate');
    const interestRateSlider = document.getElementById('interest-rate-slider');
    const yearsInput = document.getElementById('years');
    const yearsSlider = document.getElementById('years-slider');
    const monthlySavingsInput = document.getElementById('monthlySavings');
    const monthlySavingsSlider = document.getElementById('monthlySavings-slider');

    const resultCanvas = document.getElementById('resultCanvas');
    const resultContext = resultCanvas.getContext("2d");
    const finalValueText = document.getElementById('final-value-number');
    const interestResultCanvas = document.getElementById('interestResultCanvas');
    const interestResultContext = interestResultCanvas.getContext("2d");

    const shuffleIndexButton = document.getElementById('shuffleIndexButton');

    const yearLabel = document.getElementById('year-label');
    const monthLabel = document.getElementById('months-label');
    const monthlyAnnualToggle = document.getElementById('monthlyAnnualToggle');
    const fixedChangingToggle = document.getElementById('fixedChangingToggle');
    const rateIndexToggle = document.getElementById('rateIndexToggle');
    const yearsUnitLabel = document.getElementById('yearsUnitLabel');
    const fixedMonthlySavingsGroup = document.getElementById('fixedMonthlySavingsGroup');
    const changingMonthlySavingsGroup = document.getElementById('changingMonthlySavingsGroup');
    const fixedRateGroup = document.getElementById('fixedRateGroup');
    const indexRateGroup = document.getElementById('indexRateGroup');

    let monthlySavingsViewBoolean = true; // Controls wether user can input more detailed savings data
    let fixedViewBoolean = true; // Controls wether the input for monthly savings should be fixed or variable
    changingMonthlySavingsGroup.style.display = "none"; // Hide barGraph input (syncs with fixedViewBoolean)
    let rateIndexBoolean = false; 
    indexRateGroup.style.display = "none";

    // Function to update values when slider changes
    // Set up event listeners for the sliders and inputs
    lumpsumSlider.addEventListener('input', () => {
        lumpsumInput.value = formatNumberWithSpaces(lumpsumSlider.value);
        debouncedUpdateResults();
    });

    interestRateSlider.addEventListener('input', () => {
        interestRateInput.value = interestRateSlider.value;
        debouncedUpdateResults();
    });
    yearsSlider.addEventListener('input', () => {
        yearsInput.value = yearsSlider.value;
        drawMonthlySavingsInputChart();
        debouncedUpdateResults();
    });
    monthlySavingsSlider.addEventListener('input', () => {
        monthlySavingsInput.value = formatNumberWithSpaces(monthlySavingsSlider.value);
        drawMonthlySavingsInputChart();
        debouncedUpdateResults();
    });

    // Function to update values when text input changes
    lumpsumInput.addEventListener('input', () => {
        lumpsumSlider.value = convertTextToNumber(lumpsumInput.value);
        debouncedUpdateResults();
    });
    interestRateInput.addEventListener('input', () => {
        interestRateSlider.value = convertTextToNumber(interestRateInput.value);
        debouncedUpdateResults();
    });
    yearsInput.addEventListener('input', () => {
        yearsSlider.value = convertTextToNumber(yearsInput.value);
        drawMonthlySavingsInputChart();
        debouncedUpdateResults();
    });
    monthlySavingsInput.addEventListener('input', () => {
        monthlySavingsSlider.value = convertTextToNumber(monthlySavingsInput.value);
        drawMonthlySavingsInputChart();
        debouncedUpdateResults();
    });

    monthlyAnnualToggle.addEventListener('change', function () {
        if (monthlyAnnualToggle.checked) {
            monthlySavingsViewBoolean = false;
            yearsUnitLabel.textContent = "months";

        } else {
            monthlySavingsViewBoolean = true;
            yearsUnitLabel.textContent = "years";
        }
        console.log(`Pressed toggle! ${monthlySavingsViewBoolean}`);
        drawMonthlySavingsInputChart();
        debouncedUpdateResults();
    });

    fixedChangingToggle.addEventListener('change', function () {
        fixedViewBoolean = !fixedViewBoolean
        if (fixedViewBoolean) {
            changingMonthlySavingsGroup.style.display = "none";
            fixedMonthlySavingsGroup.style.display = "block";
        } else {
            changingMonthlySavingsGroup.style.display = "block"
            fixedMonthlySavingsGroup.style.display = "none";
        }
        drawMonthlySavingsInputChart();
        debouncedUpdateResults();
    });

    rateIndexToggle.addEventListener('change', function () {
        rateIndexBoolean = !rateIndexBoolean;
        if (rateIndexBoolean) {
            fixedRateGroup.style.display = "none";
            indexRateGroup.style.display = "block";
        } else {
            fixedRateGroup.style.display = "block"
            indexRateGroup.style.display = "none";
        }
        drawMonthlySavingsInputChart();
        debouncedUpdateResults();
    });

    function updateDates() {
        // Updates our global date variables
        startDate = new Date(maxEndDate);
        if (monthlyAnnualToggle) {
            startDate.setMonth(startDate.getMonth() - 12 * parseInt(yearsInput.value));
        } else {
            startDate.setMonth(startDate.getMonth() - parseInt(yearsInput.value));
        }
        endDate = new Date(maxEndDate);
    }

    // const index = omx30Data;
    const index = sp500Data;
    const maxEndDate = new Date(index[index.length - 1][0]);
    let startDate = new Date(maxEndDate);
    startDate.setMonth(startDate.getMonth() - 12 * parseInt(yearsInput.value));
    let endDate = new Date(maxEndDate);
    console.log("startDate: " + startDate);
    console.log("endDate: " + endDate);
    shuffleIndexButton.addEventListener('click', function () {
        // TODO shuffle end date while ensuring we have enough margin for both start and end date
        startDate = new Date(maxEndDate).getMonth() - 12 * parseInt(yearsInput.value) - Math.floor(Math.random()*100);
        debouncedUpdateResults();
    });

    const canvas = document.getElementById("barChartCanvas");
    const ctx = canvas.getContext("2d");

    // Sample data for bars (initial values that will be adjusted to the range of 0 to 30,000)
    // let barData = [0, 10000, 0, 5000, 6000]; // Heights of bars
    let barData = new Array(1000).fill(0);
    // Maximum possible height for a bar
    const MAX_BAR_HEIGHT = 15000;
    const BARCHART_FLOOR_Y = 50; // Lowest Y position for the bars
    const LABELFONT = "14px Arial";


    // Define the snap value (this can be easily adjusted in one place now)
    const SNAP_VALUE = 1000; // Snap to the closest multiple of 1000

    // Dynamically set canvas size based on parent container
    const updateCanvasSize = () => {
        canvas.width = canvas.offsetWidth; // Use actual canvas width
        canvas.height = canvas.offsetHeight; // Use actual canvas height
    };

    // Calculate bar width dynamically based on the canvas size
    const calculateBarWidth = (barCount) => {
        updateCanvasSize();  // Ensure the canvas size is updated first
        const canvasWidth = canvas.width;  // Get the current canvas width
        const barWidth = canvasWidth / barCount;  // Calculate the width of each bar
        return barWidth;
    };
    
    function drawCircle(ctx, x, y, radius, fill, stroke, strokeWidth) {
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
        if (fill) {
          ctx.fillStyle = fill
          ctx.fill()
        }
        if (stroke) {
          ctx.lineWidth = strokeWidth
          ctx.strokeStyle = stroke
          ctx.stroke()
        }
      }

    // Draw bars function
    const drawMonthlySavingsInputChart = () => {
        updateCanvasSize(); // Ensure canvas size is correct before rendering
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before each redraw
        let years = parseInt(yearsInput.value);

        const barWidth = calculateBarWidth(years); // Get dynamic bar width
        const maxBarHeight = canvas.height - BARCHART_FLOOR_Y; // Max height constraint for bars
        const maxValue = Math.max(...barData);
        const tempMaxValue = Math.max(MAX_BAR_HEIGHT, maxValue + 5000)
        const gap = barWidth * 0.9 // gap between bars

        // Draw horisontal ticks
        for (let i = 0; i < tempMaxValue; i += 5000) {
            const tickHeight = (canvas.height - BARCHART_FLOOR_Y) / (tempMaxValue);
            console.log(tickHeight)
            const y = canvas.height - BARCHART_FLOOR_Y - tickHeight * i;
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
        
            const barHeight = Math.min(maxBarHeight, (originalHeight / tempMaxValue) * (canvas.height - BARCHART_FLOOR_Y));
            const y = canvas.height - BARCHART_FLOOR_Y - barHeight; // Y position is calculated inversely from the bottom
        
            // ctx.fillRect(x + barWidth / 2 - gap / 2, y, gap, barHeight); // Draw the bar at calculated position
            ctx.beginPath();
            ctx.fillStyle = "skyblue";
            ctx.roundRect(x + barWidth / 2 - gap / 2, y, gap, barHeight, 8); // Draw the bar at calculated position
            ctx.stroke();
            ctx.fill();
            // drawCircle(ctx, x + barWidth / 2, y, gap / 2, 'skyblue', 'skyblue');
        
            if (originalHeight != 0) {
                ctx.save(); // Save the current canvas state
                ctx.translate(x + barWidth / 2, y - 10);
                ctx.rotate(3 * Math.PI / 2);
                ctx.fillStyle = "white";
                ctx.font = "bold 36px Arial"
                ctx.textAlign = "left";
                ctx.textBaseline = "middle"
                ctx.fillText(formatNumberWithSpaces(originalHeight), 0, 0); // Draw the text at the new origin
                ctx.restore(); // Restore the canvas state
            }


            // Add text for months
            ctx.font = LABELFONT;
            ctx.fillStyle = "white";
            ctx.textAlign = "center"; 
            ctx.fillText(i + 1, x + barWidth / 2, canvas.height - BARCHART_FLOOR_Y + 20);
        }

        // Draw label for x axis
        ctx.font = LABELFONT; 
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        const textString = monthlySavingsViewBoolean ? "Years" : "Months";
        ctx.fillText(textString, canvas.width / 2, canvas.height - 10);
                
        // Draw text
        /*
        for (let i = 5000; i < tempMaxValue; i += 5000) {
            const y = canvas.height - Math.min(maxBarHeight, (i / tempMaxValue) * canvas.height);

            ctx.font = "20px Arial";  // Set the font size to 20px (you can adjust this value)
            ctx.textAlign = "left";   // Align text to the left
            ctx.fillStyle = "white";
            ctx.fillText(formatNumberWithSpaces(i), 10, y);
        }
        */
    };

    // Initial scale and draw
    drawMonthlySavingsInputChart();

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

    resultCanvas.addEventListener("mousedown", (event) => {
        debouncedUpdateResults(event);
    });

    interestResultCanvas.addEventListener("mousedown", (event) => {
        debouncedUpdateResults(event);
    });

    function handleMouseEvent(event) {
        const mouseX = event.offsetX;
        const mouseY = event.offsetY;
        
        updateCanvasSize(); // Dynamically update canvas size on click

        let years = parseInt(convertTextToNumber(yearsInput.value));
        const barWidth = calculateBarWidth(years); // Get the updated bar width
        const maxValue = Math.max(...barData)
        const tempMaxValue = Math.max(MAX_BAR_HEIGHT, maxValue + 5000)
        const newCanvasHeight = canvas.height - BARCHART_FLOOR_Y;
        for (let i = 0; i < barData.length; i++) {
            const x = i * barWidth;

            if (mouseX >= x && mouseX <= x + barWidth) {
                const pixelHeight = Math.max(0, newCanvasHeight - mouseY);
                // Convert the pixel height to the corresponding bar value
                const newHeight = (pixelHeight / newCanvasHeight) * tempMaxValue;
                // Snap the new height to the nearest multiple of SNAP_VALUE
                const snappedHeight = Math.round(newHeight / SNAP_VALUE) * SNAP_VALUE;

                barData[i] = snappedHeight; // Update the bar data with the snapped value

                drawMonthlySavingsInputChart(); // Redraw the bars with the updated data
                break;
            }
        }

        debouncedUpdateResults(); // Update the results whenever the mouse is dragged over a bar
    }


    function calculateMonthlyCapital(lumpsum, savingsList, rate, monthlySavingsViewBoolean) {
        const rateFrac = 1 + rate;
        let capital = lumpsum;
        const capitalMonthlyHistory = [capital];
        
        if (monthlySavingsViewBoolean) {
            // savingsList is for each year
            savingsList.forEach(monthlySavings => {
                for (let i = 0; i < 12; i++) {
                    // Monthly compound
                    capital += monthlySavings;
                    capital = capital * Math.pow(rateFrac, 1 / 12);
                    capitalMonthlyHistory.push(capital);
                }
            });
        }
        else {
            // savingsList is based monthly
            savingsList.forEach(monthlySavings => {
                // Monthly compound
                capital += monthlySavings;
                capital = capital * Math.pow(rateFrac, 1 / 12);
                capitalMonthlyHistory.push(capital);
            });    
        }

        return capitalMonthlyHistory;
    }

    function calculateMonthlyCapitalWithIndex(lumpsum, savingsList, rate, monthlySavingsViewBoolean, index, startDate, endDate) {
        function getIndexValue(index, date) {
            // Subfunction that finds closest index date available
            for (let i = 0; i < index.length; i++) {
                const indexDate = new Date(index[i][0]);
                if (indexDate >= date) {
                    return index[i][1];
                }
            }
        }
        let capital = lumpsum;
        let currentDate = new Date(startDate);
        const capitalMonthlyHistory = [capital];
        const indexSharesHistory = [lumpsum / getIndexValue(index, currentDate)];
        let lastTotalShares = indexSharesHistory[0]
        if (monthlySavingsViewBoolean) {
            // savingsList is for each year
            // savingsList is based monthly
            savingsList.forEach(monthlySavings => {
                for (let i = 0; i < 12; i++) {
                    const indexValue = getIndexValue(index, currentDate);
                    const indexSharesBought = monthlySavings / indexValue;
                    const totalShares = lastTotalShares + indexSharesBought;
                    const portfolioValue = totalShares * indexValue;
                    capitalMonthlyHistory.push(portfolioValue);
                    currentDate.setMonth(currentDate.getMonth() + 1);
                    lastTotalShares = totalShares;
                }
            });    
            
        }
        else {
            // savingsList is based monthly
            savingsList.forEach(monthlySavings => {
                const indexValue = getIndexValue(index, currentDate);
                const indexSharesBought = monthlySavings / indexValue;
                const totalShares = lastTotalShares + indexSharesBought;
                const portfolioValue = totalShares * indexValue;
                capitalMonthlyHistory.push(portfolioValue);
                currentDate.setMonth(currentDate.getMonth() + 1);
                lastTotalShares = totalShares;
            });    
        }
        return capitalMonthlyHistory;
    }

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    const debouncedUpdateResults = debounce(updateResults, 10);

    function updateResults(event) {
        updateDates();
        const lumpsum = parseFloat(convertTextToNumber(lumpsumInput.value));
        const interestRate = parseFloat(interestRateInput.value) / 100;  // Converts rate as int. percentage to decimal
        const years = parseInt(yearsInput.value);

        // Example savings list for each year
        // const savingsList = new Array(years).fill(1000); // Each year deposits 1000
        let savingsList;
        if (fixedViewBoolean) {
            savingsList = new Array(years).fill(parseFloat(monthlySavingsSlider.value));
        } else {
            savingsList = barData.slice(0, years);
        }

        // Get the calculated capital history
        let capitalHistory = calculateMonthlyCapital(lumpsum, savingsList, interestRate, monthlySavingsViewBoolean, event);
        if (rateIndexBoolean) {
            // Overwrite capitalHistory with the index data
            capitalHistory = calculateMonthlyCapitalWithIndex(lumpsum, savingsList, interestRate, monthlySavingsViewBoolean, index, startDate, endDate);
        }

        // Draw the total amount result graph
        plotGraph(resultCanvas, resultContext, capitalHistory, event, "skyblue");
        // Draw the interest graph
        let interestHistory = [];
        capitalHistory.forEach((moneyValue) => {
            interestHistory.push(moneyValue * interestRate / 12)
        });
        plotGraph(interestResultCanvas, interestResultContext, interestHistory, event, "lightgreen");

        finalValueText.textContent = formatNumberWithSpaces(Math.max(...capitalHistory).toFixed(0));
        if (monthlySavingsViewBoolean) {
            yearLabel.textContent = years;
            monthLabel.textContent = years * 12;
        } else {
            yearLabel.textContent = Math.round(years/12);
            monthLabel.textContent = years;
        }
    }

    // Function to draw the capital history on the result canvas
    function plotGraph(canvas, ctx, capitalHistory, event, color) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const maxCapital = 1.1 * Math.max(...capitalHistory); // Maximum value of capital to scale bars

        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

        // Draw horisontal ticks
        const startX = 50;
        const startY = 30;
        let tickIncrement = 250000;
        if (maxCapital < 10000) {
            tickIncrement = 1000;
        }
        else if (maxCapital < 25000) {
            tickIncrement = 5000;
        }
        else if (maxCapital < 50000) {
            tickIncrement = 10000;
        }
        else if (maxCapital < 100000) {
            tickIncrement = 25000;
        }
        else if (maxCapital < 250000) {
            tickIncrement = 50000;
        }
        else if (maxCapital < 1000000) { // 1 million
            tickIncrement = 100000;
        }
        else if (maxCapital < 2500000) { // 2.5 million
            tickIncrement = 250000;
        }
        else if (maxCapital < 5000000) { // 5 million
            tickIncrement = 500000;
        }
        else if (maxCapital < 10000000) { // 10 million
            tickIncrement = 1000000;
        }
        else if (maxCapital < 25*Math.pow(10,6)) {
            tickIncrement = 2.5*Math.pow(10,6);
        }
        else if (maxCapital < 50*Math.pow(10,6)) {
            tickIncrement = 10*Math.pow(10,6);
        }
        else {
            tickIncrement = 50*Math.pow(10,6);
        }

        // Horisontal lines
        for (let i = tickIncrement; i < maxCapital; i += tickIncrement) {
            const y = canvas.height - (i / maxCapital) * (canvas.height - startY) - startY;

            ctx.beginPath();        // Start a new path
            ctx.moveTo(startX, y);       // Move to the starting point (left edge, at height y)
            ctx.lineTo(canvas.width, y);   // Draw to the right edge (same y-coordinate)
            ctx.strokeStyle = "gray";  // Set the line color
            ctx.lineWidth = 2;      // Set line width (optional)
            ctx.stroke();           // Render the line
        }

        // Loop through and plot each point
        for (let i = 0; i < capitalHistory.length; i++) {
            const x = (i / capitalHistory.length) * (canvas.width - startX) + startX;
            const y = canvas.height - (capitalHistory[i] / maxCapital) * (canvas.height - startY) - startY;  // Inverse so that higher values go up

            ctx.fillStyle = color;
            ctx.fillRect(x, y, (canvas.width - startX) / capitalHistory.length + 1, canvas.height - y - startY); // Draw the bars representing capital over time
        }
        
        // Draw text for y ticks
        for (let i = tickIncrement; i < maxCapital; i += tickIncrement) {
            const y = canvas.height - (i / maxCapital) * (canvas.height - startY) - startY;
            ctx.font = LABELFONT;
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            const numberText = formatNumberWithSpaces(i / 1000) + "k";
            ctx.fillText(numberText, startX / 2, y);
        }

        // Plot vertical ticks
        for (let i = 0; i < capitalHistory.length; i++) {
            const x = (i / capitalHistory.length) * (canvas.width - startX) + startX;
            const y = canvas.height - (capitalHistory[i] / maxCapital) * canvas.height;  // Inverse so that higher values go up

            if (i % 12 == 0) {
                ctx.beginPath();        // Start a new path
                ctx.moveTo(x, 0);       // Move to the starting point (left edge, at height y)
                ctx.lineTo(x, canvas.height);   // Draw to the right edge (same y-coordinate)
                ctx.strokeStyle = "gray";  // Set the line color
                ctx.lineWidth = 2;      // Set line width (optional)
                ctx.stroke();           // Render the line

                ctx.font = LABELFONT;  // Set the font size to 20px (you can adjust this value)
                ctx.fillStyle = "white";
                ctx.textAlign = "center"
                ctx.fillText(Math.round(i / 12), x, canvas.height);
            }
        }

        // Plot mouse hover
        if (event) {
            let mouseX = event.offsetX;
            let mouseY = event.offsetY;
            let barWidth = (canvas.width - startX) / capitalHistory.length + 1

            // Iterate through all bars to find correspond bar
            for (let i = 0; i < capitalHistory.length; i++) {
                const x = (i / capitalHistory.length) * (canvas.width - startX) + startX;
                const y = canvas.height - (capitalHistory[i] / maxCapital) * (canvas.height - startY) - startY;  // Inverse so that higher values go up
    
                if (mouseX > x && mouseX < x + barWidth) {
                    // Draw selected bar
                    let gradient = resultContext.createLinearGradient(x, y, x, canvas.height - startY);
                    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");  // Fully opaque white at the top
                    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");  // Fully transparent at the bottom
                
                    // Apply gradient
                    ctx.fillStyle = gradient;
                    ctx.fillRect(x, y, barWidth, canvas.height - y - startY);                
                    // Draw date
                    ctx.font = "bold 20px Arial";
                    ctx.fillStyle = "white";
                    ctx.textAlign = "center"
                    ctx.fillText(Math.floor(i / 12) + ' years ' + i % 12 + ' months', x + barWidth/2, canvas.height - startY - 20);

                    // Draw money amount
                    ctx.font = "bold 36px Arial"; 
                    ctx.fillStyle = "white";
                    ctx.textAlign = "center"
                    ctx.fillText(formatNumberWithSpaces(Math.round(capitalHistory[i])) + ' kr', x, y);
                    break;

                }
            }
        }
    }
    // Initially update the results when the page loads
    debouncedUpdateResults();

});