let processCounter = 1;
let simulationData = null;
let currentStep = 0;
let animationInterval = null;

async function startSimulation() {
    const timeQuantum = document.getElementById('timeQuantum').value;
    const formData = new FormData();
    formData.append('timeQuantum', timeQuantum);
    const response = await fetch('/simulate', {
        method: 'POST',
        body: formData
    });
    simulationData = await response.json();
    currentStep = 0;

    // Clear any existing animation
    if (animationInterval) {
        clearInterval(animationInterval);
    }

    // Start animation
    animationInterval = setInterval(updateVisualization, 1000);
}

function updateVisualization() {
    if (!simulationData || currentStep >= simulationData.history.length) {
        clearInterval(animationInterval);
        displayStatistics();
        return;
    }
    const step = simulationData.history[currentStep];
    document.getElementById('time-indicator').textContent = `Time: ${step.time}`;

    // Update SVG
    const svg = document.querySelector('#visualization svg');

    // Clear previous processes
    const processes = svg.querySelectorAll('.process');
    processes.forEach(p => p.remove());

    // Draw running process
    if (step.running) {
        const runningProcess = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        runningProcess.setAttribute("cx", "400");
        runningProcess.setAttribute("cy", "200");
        runningProcess.setAttribute("r", "20");
        runningProcess.setAttribute("fill", step.running.color);
        runningProcess.setAttribute("class", "process");
        svg.appendChild(runningProcess);

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", "400");
        text.setAttribute("y", "200");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("fill", "white");
        text.textContent = `P${step.running.pid}`;
        svg.appendChild(text);
    }

    // Draw queue
    step.queue.forEach((process, index) => {
        const queueProcess = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        queueProcess.setAttribute("cx", String(100 + index * 50));
        queueProcess.setAttribute("cy", "200");
        queueProcess.setAttribute("r", "20");
        queueProcess.setAttribute("fill", process.color);
        queueProcess.setAttribute("class", "process");
        svg.appendChild(queueProcess);

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", String(100 + index * 50));
        text.setAttribute("y", "200");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("fill", "white");
        text.textContent = `P${process.pid}`;
        svg.appendChild(text);
    });

    updateTimeline();
    currentStep++;
}

function updateTimeline() {
    const svg = document.querySelector('#timeline svg');
    svg.innerHTML = '';

    // Draw timeline
    const timelineY = 100;
    const timelineStart = 50;
    const timelineWidth = 700;

    // Base timeline
    const timeline = document.createElementNS("http://www.w3.org/2000/svg", "line");
    timeline.setAttribute("x1", String(timelineStart));
    timeline.setAttribute("y1", String(timelineY));
    timeline.setAttribute("x2", String(timelineStart + timelineWidth));
    timeline.setAttribute("y2", String(timelineY));
    timeline.setAttribute("stroke", "black");
    svg.appendChild(timeline);

    // Draw process executions
    const timeUnit = timelineWidth / simulationData.history.length;
    for (let i = 0; i <= currentStep; i++) {
        const step = simulationData.history[i];
        if (step.running) {
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", String(timelineStart + i * timeUnit));
            rect.setAttribute("y", String(timelineY - 20));
            rect.setAttribute("width", String(timeUnit));
            rect.setAttribute("height", "40");
            rect.setAttribute("fill", step.running.color);
            svg.appendChild(rect);

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", String(timelineStart + i * timeUnit + timeUnit/2));
            text.setAttribute("y", String(timelineY));
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("dominant-baseline", "middle");
            text.setAttribute("fill", "white");
            text.textContent = `P${step.running.pid}`;
            svg.appendChild(text);
        }
    }
}
 function displayStatistics() {
    const stats = simulationData.statistics;
    const statsDiv = document.getElementById('statistics');
    let tableHTML = `
        <h2>Statistics</h2>
         <p>Average Waiting Time: ${stats.average_waiting_time}</p>
         <p>Average Turnaround Time: ${stats.average_turnaround_time}</p>
         <p>Completion Order: ${stats.completion_order.map(pid => 'P'+pid).join(' → ')}</p>
        <table>
            <thead>
                <tr>
                    <th>Process ID</th>
                    <th>Waiting Time</th>
                    <th>Turnaround Time</th>
                     <th>Completion Time</th>
                </tr>
            </thead>
            <tbody>
    `;

    stats.process_details.forEach(process => {
      tableHTML += `
            <tr>
                <td>P${process.pid}</td>
                <td>${process.waiting_time}</td>
                <td>${process.turnaround_time}</td>
                 <td>${process.completion_time}</td>
            </tr>
       `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;
    statsDiv.innerHTML = tableHTML;
  }

// SJF Logic

let sjfSimulationData = null;
let sjfCurrentStep = 0;
let sjfAnimationInterval = null;

function addSJFProcess() {
    const processList = document.getElementById('sjf-process-list');
    const processItem = document.createElement('div');
    processItem.className = 'process-item';
    processItem.innerHTML = `
        <span>Process ${processCounter}</span>
        <label>Burst Time: </label>
        <input type="number" class="burst-time" min="1" value="1">
         <label>Arrival Time: </label>
        <input type="number" class="arrival-time" min="0" value="0">
         <button onclick="this.parentElement.remove()">Remove</button>
    `;
    processList.appendChild(processItem);
    processCounter++;
}


async function startSJFSimulation() {
    const processItems = document.querySelectorAll('#sjf-process-list .process-item');
    const processes = [];
    processItems.forEach((item, index) => {
        processes.push({
            id: index + 1,
            burst_time: parseInt(item.querySelector('.burst-time').value),
            arrival_time: parseInt(item.querySelector('.arrival-time').value)
        });
    });

    const response = await fetch('/sjf_simulate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            processes: processes,
        }),
    });

    sjfSimulationData = await response.json();
    sjfCurrentStep = 0;

    if (sjfAnimationInterval) {
        clearInterval(sjfAnimationInterval);
    }
     sjfAnimationInterval = setInterval(updateSJFVisualization, 1000);
}

 function updateSJFVisualization() {
    if (!sjfSimulationData || sjfCurrentStep >= sjfSimulationData.history.length) {
         clearInterval(sjfAnimationInterval);
        displaySJFStatistics();
        return;
    }

    const step = sjfSimulationData.history[sjfCurrentStep];
    document.getElementById('sjf-time-indicator').textContent = `Time: ${step.time}`;


    const svg = document.querySelector('#sjf-visualization svg');

    const processes = svg.querySelectorAll('.process');
    processes.forEach(p => p.remove());

     if (step.running) {
        const runningProcess = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        runningProcess.setAttribute("cx", "400");
        runningProcess.setAttribute("cy", "200");
        runningProcess.setAttribute("r", "20");
        runningProcess.setAttribute("fill", step.running.color);
         runningProcess.setAttribute("class", "process");
        svg.appendChild(runningProcess);

         const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", "400");
        text.setAttribute("y", "200");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("fill", "white");
        text.textContent = `P${step.running.pid}`;
        svg.appendChild(text);
    }

    // Draw queue
    step.queue.forEach((process, index) => {
        const queueProcess = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        queueProcess.setAttribute("cx", String(100 + index * 50));
        queueProcess.setAttribute("cy", "200");
        queueProcess.setAttribute("r", "20");
        queueProcess.setAttribute("fill", process.color);
        queueProcess.setAttribute("class", "process");
        svg.appendChild(queueProcess);

         const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", String(100 + index * 50));
        text.setAttribute("y", "200");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("fill", "white");
        text.textContent = `P${process.pid}`;
         svg.appendChild(text);
    });

     updateSJFTimeline();
    sjfCurrentStep++;
}

 function updateSJFTimeline() {
    const svg = document.querySelector('#sjf-timeline svg');
    svg.innerHTML = '';

    const timelineY = 100;
    const timelineStart = 50;
    const timelineWidth = 700;

    const timeline = document.createElementNS("http://www.w3.org/2000/svg", "line");
    timeline.setAttribute("x1", String(timelineStart));
    timeline.setAttribute("y1", String(timelineY));
    timeline.setAttribute("x2", String(timelineStart + timelineWidth));
    timeline.setAttribute("y2", String(timelineY));
    timeline.setAttribute("stroke", "black");
    svg.appendChild(timeline);

    const timeUnit = timelineWidth / sjfSimulationData.history.length;
    for (let i = 0; i <= sjfCurrentStep; i++) {
        const step = sjfSimulationData.history[i];
        if (step.running) {
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", String(timelineStart + i * timeUnit));
            rect.setAttribute("y", String(timelineY - 20));
            rect.setAttribute("width", String(timeUnit));
            rect.setAttribute("height", "40");
            rect.setAttribute("fill", step.running.color);
            svg.appendChild(rect);

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", String(timelineStart + i * timeUnit + timeUnit/2));
            text.setAttribute("y", String(timelineY));
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("dominant-baseline", "middle");
            text.setAttribute("fill", "white");
            text.textContent = `P${step.running.pid}`;
            svg.appendChild(text);
        }
    }
 }

function displaySJFStatistics() {
    const stats = sjfSimulationData.statistics;
    const statsDiv = document.getElementById('sjf-statistics');
    let tableHTML = `
        <h2>Statistics</h2>
         <p>Average Waiting Time: ${stats.average_waiting_time}</p>
         <p>Average Turnaround Time: ${stats.average_turnaround_time}</p>
         <p>Completion Order: ${stats.completion_order.map(pid => 'P'+pid).join(' → ')}</p>
        <table>
            <thead>
                <tr>
                    <th>Process ID</th>
                    <th>Waiting Time</th>
                    <th>Turnaround Time</th>
                    <th>Completion Time</th>
                </tr>
            </thead>
            <tbody>
    `;

    stats.process_details.forEach(process => {
      tableHTML += `
            <tr>
                <td>P${process.pid}</td>
                <td>${process.waiting_time}</td>
                <td>${process.turnaround_time}</td>
                <td>${process.completion_time}</td>
            </tr>
       `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;
    statsDiv.innerHTML = tableHTML;
  }