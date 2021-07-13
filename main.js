const navbar = document.querySelector('nav');
function hoverFunction(event) {
    if (event.target.tagName != 'DIV') {
        return;
    }
    event.type == 'mouseover'? event.target.style.color = 'rgba(0, 217, 159, 0.75)': event.target.style.color = 'white';
}
for (let item of navbar.children) {
    item.style.width = parseInt(getComputedStyle(item).width) + 40 + 'px';
    item.onmouseover = hoverFunction;
    item.onmouseout = hoverFunction;
}
navbar.onclick = function(event) {
    event.preventDefault();
    if (event.target.tagName == 'DIV') {
        const element = event.target.children[1];
        if (!element) {
            return;
        }
        if (getComputedStyle(element).display == 'block') {
            event.target.style.backgroundColor = '#34495e';
            event.target.onmouseover = hoverFunction;
            event.target.onmouseout = hoverFunction;
            element.style.display = 'none';
        }
        else {
            event.target.style.backgroundColor = 'rgba(0, 217, 159, 0.75)';
            event.target.style.color = 'white';
            event.target.onmouseover = null;
            event.target.onmouseout = null;
            element.style.display = '';
        }
        return;
    }
    if (event.target.tagName == 'LI') {
        event.target.closest('ul').style.display = 'none';
        let outerDiv = event.target.closest('div');
        outerDiv.style.backgroundColor = '#34495e';
        outerDiv.onmouseover = hoverFunction;
        outerDiv.onmouseout = hoverFunction;
        return;
    }
    for (let list of navbar.querySelectorAll('ul')) {
        list.style.display = 'none';
        let outerDiv = list.closest('div');
        outerDiv.style.backgroundColor = '#34495e';
        outerDiv.onmouseover = hoverFunction;
        outerDiv.onmouseout = hoverFunction;
    }
}

const scrollContainer = document.querySelector('section');
let prevCoords;
scrollContainer.onpointerdown = function(event) {
    scrollContainer.setPointerCapture(event.pointerId);
    prevCoords = event.clientX;
}
scrollContainer.onpointermove = function(event) {
    scrollContainer.scrollLeft += prevCoords - event.clientX;
    prevCoords = event.clientX;
}
const grid = document.querySelector('table[id="main-grid"]');
function generateGrid() {
    let size = document.documentElement.clientWidth > 1000? 25: 75; 
    const rows = Math.floor(document.documentElement.clientHeight / size - document.body.clientHeight / size) - 2;
    const columns = Math.floor(document.documentElement.clientWidth / size);
    for (let i = 0; i < rows; i++) {
        const newColumn = document.createElement('tr');
        for (let j = 0; j < columns; j++) {
            const newRow = document.createElement('td');
            newRow.id = i + '-' + j;
            newColumn.append(newRow);
        }
        grid.append(newColumn);
    }
}
generateGrid();
grid.addEventListener('mousedown', handleMousedown);
grid.addEventListener('mouseover', handleMouseover);
grid.addEventListener('mouseup', handleMouseup);
let nodeSelected = false;
let weightSelected = false;
const weightTap = document.querySelector('li[id="weight-tap"]');
weightTap.addEventListener('click', function() {weightSelected = !weightSelected;});
function handleMousedown(event) {
    if (event.target.tagName != 'TD') {
        return;
    }
    event.shiftKey || weightSelected? generateWeight(event.target): generateWall(event.target);
    nodeSelected = true;
    event.preventDefault();
}
function handleMouseover(event) {
    if (event.target.tagName != 'TD') {
        return;
    }
    if (nodeSelected) {
        event.shiftKey || weightSelected? generateWeight(event.target): generateWall(event.target);
    }
}
function handleMouseup() {
    nodeSelected = false;
}
function generateWall(target) {
    target.className = target.className != 'wall'? !target.className.includes('draggable')? 'wall': target.className: '';
    target.innerHTML = '';
}
function generateWeight(target) {
    target.innerHTML = target.innerHTML? Number(target.innerHTML) + 1: 1;
    target.className = '';
}
function breadthFirstSearch(start, goal, speed) {
    const frontier = [start];
    const cameFrom = {};
    cameFrom[start] = null;
    function iterate() {
        let current = frontier.shift();
        if (!current || (current[0] == goal[0] && current[1] == goal[1])) {
            retracePath(cameFrom, goal);
            clearInterval(holder);
            return;
        }
        let cell = grid.rows[current[0]].cells[current[1]];
        if (cell.className != 'draggable start' && cell.className != 'draggable goal') {
            cell.className = 'visitedAnimated';
        }
        let neighbours = [[current[0],current[1]-1], [current[0],current[1]+1], [current[0]+1,current[1]], [current[0]-1,current[1]]];
        neighbours = neighbours.filter(coords => {
            if (coords[0] < 0 || coords[0] >= grid.rows.length || coords[1] < 0 || coords[1] >= grid.rows[0].cells.length) {
                return false;
            }
            return grid.rows[coords[0]].cells[coords[1]].className != 'wall';
        });
        for (let neighbour of neighbours) {
            if (!cameFrom.hasOwnProperty(neighbour)) {
                frontier.push(neighbour);
                cameFrom[neighbour] = current;
            }
        }
    }
    let holder = setInterval(iterate, speed);
}
function dijkstrasAlgorithm(start, goal, speed) {
    const frontier = [[start, 0]];
    const cameFrom = {};
    cameFrom[start] = null;
    const costSoFar = {};
    costSoFar[start] = 0;
    function iterate() {
        let current = frontier.sort((a, b) => a[1] - b[1])[0][0];
        for (let i = 0; i < frontier.length; i++) {
            if (frontier[i][0] == current) {
                frontier.splice(i, 1);
            }
        }
        if (!current || (current[0] == goal[0] && current[1] == goal[1])) {
            retracePath(cameFrom, goal);
            clearInterval(holder);
            return;
        }
        let cell = grid.rows[current[0]].cells[current[1]];
        if (cell.className != 'draggable start' && cell.className != 'draggable goal') {
            cell.className = 'visitedAnimated';
        }
        let neighbours = [[current[0],current[1]-1], [current[0],current[1]+1], [current[0]+1,current[1]], [current[0]-1,current[1]]];
        neighbours = neighbours.filter(coords => {
            if (coords[0] < 0 || coords[0] >= grid.rows.length || coords[1] < 0 || coords[1] >= grid.rows[0].cells.length) {
                return false;
            }
            return grid.rows[coords[0]].cells[coords[1]].className != 'wall';
        });
        for (let neighbour of neighbours) {
            let cost = grid.querySelector(`td[id="${neighbour[0]}-${neighbour[1]}"]`).innerHTML;
            cost = cost? Number(cost) + 1: 1;
            const newCost = costSoFar[current] + cost;
            if (!cameFrom.hasOwnProperty(neighbour) || newCost < costSoFar[neighbour]) {
                costSoFar[neighbour] = newCost;
                frontier.push([neighbour, newCost]);
                cameFrom[neighbour] = current;
            }
        }
    }
    let holder = setInterval(iterate, speed);
}
function greedyBestFirstSearch(start, goal, speed) {
    const frontier = [[start, 0]];
    const cameFrom = {};
    cameFrom[start] = null;
    function iterate() {
        let current = frontier.sort((a, b) => a[1] - b[1])[0][0];
        for (let i = 0; i < frontier.length; i++) {
            if (frontier[i][0] == current) {
                frontier.splice(i, 1);
            }
        }
        if (!current || (current[0] == goal[0] && current[1] == goal[1])) {
            retracePath(cameFrom, goal);
            clearInterval(holder);
            return;
        }
        let cell = grid.rows[current[0]].cells[current[1]];
        if (cell.className != 'draggable start' && cell.className != 'draggable goal') {
            cell.className = 'visitedAnimated';
        }
        let neighbours = [[current[0],current[1]-1], [current[0],current[1]+1], [current[0]+1,current[1]], [current[0]-1,current[1]]];
        neighbours = neighbours.filter(coords => {
            if (coords[0] < 0 || coords[0] >= grid.rows.length || coords[1] < 0 || coords[1] >= grid.rows[0].cells.length) {
                return false;
            }
            return grid.rows[coords[0]].cells[coords[1]].className != 'wall';
        });
        for (let neighbour of neighbours) {
            if (!cameFrom.hasOwnProperty(neighbour)) {
                frontier.push([neighbour, heuristic(neighbour, goal)]);
                cameFrom[neighbour] = current;
            }
        }
    }
    let holder = setInterval(iterate, speed);
}
function aStar(start, goal, speed) {
    const frontier = [[start, 0]];
    const cameFrom = {};
    cameFrom[start] = null;
    const costSoFar = {};
    costSoFar[start] = 0;
    function iterate() {
        let current = frontier.sort((a, b) => a[1] - b[1])[0][0];
        for (let i = 0; i < frontier.length; i++) {
            if (frontier[i][0] == current) {
                frontier.splice(i, 1);
            }
        }
        if (!current || (current[0] == goal[0] && current[1] == goal[1])) {
            retracePath(cameFrom, goal);
            clearInterval(holder);
            return;
        }
        let cell = grid.rows[current[0]].cells[current[1]];
        if (cell.className != 'draggable start' && cell.className != 'draggable goal') {
            cell.className = 'visitedAnimated';
        }
        let neighbours = [[current[0],current[1]-1], [current[0],current[1]+1], [current[0]+1,current[1]], [current[0]-1,current[1]]];
        neighbours = neighbours.filter(coords => {
            if (coords[0] < 0 || coords[0] >= grid.rows.length || coords[1] < 0 || coords[1] >= grid.rows[0].cells.length) {
                return false;
            }
            return grid.rows[coords[0]].cells[coords[1]].className != 'wall';
        });
        for (let neighbour of neighbours) {
            let cost = grid.querySelector(`td[id="${neighbour[0]}-${neighbour[1]}"]`).innerHTML;
            cost = cost? Number(cost) + 1: 1;
            const newCost = costSoFar[current] + cost;
            if (!cameFrom.hasOwnProperty(neighbour) || newCost < costSoFar[neighbour]) {
                costSoFar[neighbour] = newCost;
                frontier.push([neighbour, newCost + heuristic(neighbour, goal)]);
                cameFrom[neighbour] = current;
            }
        }
    }
    let holder = setInterval(iterate, speed);
}
function instantBreadthFirstSearch(start, goal) {
    const frontier = [start];
    const cameFrom = {};
    cameFrom[start] = null;
    while (frontier) {
        let current = frontier.shift();
        if (current[0] == goal[0] && current[1] == goal[1]) {
            instantRetracePath(cameFrom, goal);
            break;
        }
        let cell = grid.rows[current[0]].cells[current[1]];
        if (cell.className != 'draggable start' && cell.className != 'draggable goal') {
            cell.className = 'visited';
        }
        let neighbours = [[current[0],current[1]-1], [current[0],current[1]+1], [current[0]+1,current[1]], [current[0]-1,current[1]]];
        neighbours = neighbours.filter(coords => {
            if (coords[0] < 0 || coords[0] >= grid.rows.length || coords[1] < 0 || coords[1] >= grid.rows[0].cells.length) {
                return false;
            }
            return grid.rows[coords[0]].cells[coords[1]].className != 'wall';
        });
        for (let neighbour of neighbours) {
            if (!cameFrom.hasOwnProperty(neighbour)) {
                frontier.push(neighbour);
                cameFrom[neighbour] = current;
            }
        }
    }
}
function instantDijkstrasAlgorithm(start, goal) {
    const frontier = [[start, 0]];
    const cameFrom = {};
    cameFrom[start] = null;
    const costSoFar = {};
    costSoFar[start] = 0;
    while (frontier) {
        let current = frontier.sort((a, b) => a[1] - b[1])[0][0];
        for (let i = 0; i < frontier.length; i++) {
            if (frontier[i][0] == current) {
                frontier.splice(i, 1);
            }
        }
        if (current[0] == goal[0] && current[1] == goal[1]) {
            instantRetracePath(cameFrom, goal);
            break;
        }
        let cell = grid.rows[current[0]].cells[current[1]];
        if (cell.className != 'draggable start' && cell.className != 'draggable goal') {
            cell.className = 'visited';
        }
        let neighbours = [[current[0],current[1]-1], [current[0],current[1]+1], [current[0]+1,current[1]], [current[0]-1,current[1]]];
        neighbours = neighbours.filter(coords => {
            if (coords[0] < 0 || coords[0] >= grid.rows.length || coords[1] < 0 || coords[1] >= grid.rows[0].cells.length) {
                return false;
            }
            return grid.rows[coords[0]].cells[coords[1]].className != 'wall';
        });
        for (let neighbour of neighbours) {
            let cost = grid.rows[neighbour[0]].cells[neighbour[1]].innerHTML;
            cost = cost? Number(cost) + 1: 1;
            const newCost = costSoFar[current] + cost;
            if (!cameFrom.hasOwnProperty(neighbour) || newCost < costSoFar[neighbour]) {
                costSoFar[neighbour] = newCost;
                frontier.push([neighbour, newCost]);
                cameFrom[neighbour] = current;
            }
        }
    }
}
function instantGreedyBestFirstSearch(start, goal) {
    const frontier = [[start, 0]];
    const cameFrom = {};
    cameFrom[start] = null;
    while (frontier) {
        let current = frontier.sort((a, b) => a[1] - b[1])[0][0];
        for (let i = 0; i < frontier.length; i++) {
            if (frontier[i][0] == current) {
                frontier.splice(i, 1);
            }
        }
        if (current[0] == goal[0] && current[1] == goal[1]) {
            instantRetracePath(cameFrom, goal);
            break;
        }
        let cell = grid.rows[current[0]].cells[current[1]];
        if (cell.className != 'draggable start' && cell.className != 'draggable goal') {
            cell.className = 'visited';
        }
        let neighbours = [[current[0],current[1]-1], [current[0],current[1]+1], [current[0]+1,current[1]], [current[0]-1,current[1]]];
        neighbours = neighbours.filter(coords => {
            if (coords[0] < 0 || coords[0] >= grid.rows.length || coords[1] < 0 || coords[1] >= grid.rows[0].cells.length) {
                return false;
            }
            return grid.rows[coords[0]].cells[coords[1]].className != 'wall';
        });
        for (let neighbour of neighbours) {
            if (!cameFrom.hasOwnProperty(neighbour)) {
                frontier.push([neighbour, heuristic(neighbour, goal)]);
                cameFrom[neighbour] = current;
            }
        }
    }
}
function instantAStar(start, goal) {
    const frontier = [[start, 0]];
    const cameFrom = {};
    cameFrom[start] = null;
    const costSoFar = {};
    costSoFar[start] = 0;
    while(frontier) {
        let current = frontier.sort((a, b) => a[1] - b[1])[0][0];
        for (let i = 0; i < frontier.length; i++) {
            if (frontier[i][0] == current) {
                frontier.splice(i, 1);
            }
        }
        if (current[0] == goal[0] && current[1] == goal[1]) {
            instantRetracePath(cameFrom, goal);
            break;
        }
        let cell = grid.rows[current[0]].cells[current[1]];
        if (cell.className != 'draggable start' && cell.className != 'draggable goal') {
            cell.className = 'visited';
        }
        let neighbours = [[current[0],current[1]-1], [current[0],current[1]+1], [current[0]+1,current[1]], [current[0]-1,current[1]]];
        neighbours = neighbours.filter(coords => {
            if (coords[0] < 0 || coords[0] >= grid.rows.length || coords[1] < 0 || coords[1] >= grid.rows[0].cells.length) {
                return false;
            }
            return grid.rows[coords[0]].cells[coords[1]].className != 'wall';
        });
        for (let neighbour of neighbours) {
            let cost = grid.rows[neighbour[0]].cells[neighbour[1]].innerHTML;
            cost = cost? Number(cost) + 1: 1;
            const newCost = costSoFar[current] + cost;
            if (!cameFrom.hasOwnProperty(neighbour) || newCost < costSoFar[neighbour]) {
                costSoFar[neighbour] = newCost;
                frontier.push([neighbour, newCost + heuristic(neighbour, goal)]);
                cameFrom[neighbour] = current;
            }
        }
    }
}
function retracePath(cameFrom, goal) {
    let current = goal;
    const path = [];
    while (current != null) {
        path.unshift(current);
        current = cameFrom[current];
    }
    let i = 0
    holder = setInterval(() => {
        if (i == path.length - 1) {
            clearInterval(holder);
        }
        let cell = grid.querySelector(`td[id="${path[i][0]}-${path[i][1]}"]`);
        cell.className = !cell.className.includes('draggable')? 'path': cell.className;
        i ++;
    }, 0);
}
function instantRetracePath(cameFrom, goal) {
    let current = goal;
    while (current != null) {
        let cell = grid.querySelector(`td[id="${current[0]}-${current[1]}"]`);
        cell.className = !cell.className.includes('draggable')? 'path': cell.className;
        current = cameFrom[current];
    }
}
function heuristic(coords, goal) {
    return Math.abs(goal[0] - coords[0]) + Math.abs(goal[1] - coords[1]);
}
let currentAlgorithm = null;
const algorithmsLookup = {
    'Breadth First Search': breadthFirstSearch, 
    "Dijkstra's Algorithm": dijkstrasAlgorithm,
    'Greedy Best First Search': greedyBestFirstSearch,
    'A Star': aStar};
const algorithmsShorthand = {
    'Breadth First Search': 'BFS',
    "Dijkstra's Algorithm": "Dijkstra's",
    'Greedy Best First Search': 'Greedy',
    'A Star': 'A *'
};
const algorithmsDescription = {
    'Breadth First Search': 'Breadth First Search is <strong>unweighted</strong> and <strong>guarantees</strong> the shortest path',
    "Dijkstra's Algorithm": "Dijkstra's Algorithm is <strong>weighted</strong> and <strong>guarantees</strong> the shortest path",
    'Greedy Best First Search': 'Greedy Best First Search is <strong>unweighted</strong> and <strong>does not guarantee</strong> the shorted path',
    'A Star': 'A Star is <strong>weighted</strong> and <strong>guarantees</strong> the shortest path'
};
let interval = 0;
const algorithmsList = document.querySelector('div[id="algorithms"]');
const visualise = document.querySelector('div[id="visualise"]');
let description = document.querySelector('div[id="description"]');
const speedList = document.querySelector('div[id="speed-settings"]');
algorithmsList.onclick = function(event) {
    if (event.target.tagName != 'LI') {
        return;
    }
    currentAlgorithm = event.target.textContent;
    visualise.innerHTML = 'Visualise ' + algorithmsShorthand[currentAlgorithm];
    description.innerHTML = algorithmsDescription[currentAlgorithm];
}
let windowWidth = document.documentElement.clientWidth;
let startCell = windowWidth > 1000? grid.querySelector('td[id="10-12"]'): grid.querySelector('td[id="7-2"]');
startCell.className = 'draggable start';
let goalCell = windowWidth > 1000? grid.querySelector('td[id="10-38"]'): grid.querySelector('td[id="7-10"]');
goalCell.className = 'draggable goal';
visualise.onclick = function() {
    clearPath();
    let startCoords = startCell.id.split('-').map(x => Number(x));
    let goalCoords = goalCell.id.split('-').map(x => Number(x));
    currentAlgorithm? algorithmsLookup[currentAlgorithm](startCoords, goalCoords, interval): alert('Choose an algorithm');
}
speedList.onclick = function(event) {
    if (event.target.tagName != 'LI') {
        return;
    }
    switch (event.target.textContent) {
        case 'Fast':
            interval = 0;
            break;
        case 'Medium':
            interval = 50;
            break;
        case 'Slow':
            interval = 100;
            break;
    }
    this.firstChild.replaceWith('Speed: ' + event.target.textContent + ' ');
}
function clearPath() {
    const rows = grid.rows.length;
    const columns = grid.rows[0].cells.length;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            const cell = grid.rows[i].cells[j];
            cell.className = cell.className != 'wall' && !cell.className.includes('draggable')? '': cell.className;
        }
    }
}
const boardClear = document.querySelector('div[id="board-clear"]');
boardClear.onclick = function() {
    const rows = grid.rows.length;
    const columns = grid.rows[0].cells.length;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            const cell = grid.rows[i].cells[j];
            cell.innerHTML = '';
            cell.className = !cell.className.includes('draggable')? '': cell.className;
        }
    }
}
const instantAlgorithmsLookup = {
    'Breadth First Search': instantBreadthFirstSearch, 
    "Dijkstra's Algorithm": instantDijkstrasAlgorithm,
    'Greedy Best First Search': instantGreedyBestFirstSearch,
    'A Star': instantAStar};
const pathClear = document.querySelector('div[id="path-clear"]');
pathClear.onclick = clearPath;
for (let draggable of document.querySelectorAll('.draggable')) {
    draggable.onpointerdown = function onPointerDown(event) {
        draggable.setPointerCapture(event.pointerId);
        grid.removeEventListener('mousedown', handleMousedown);
        let currentCell = document.elementFromPoint(event.pageX, event.pageY);
        document.addEventListener('pointermove', onPointerMove);
        function onPointerMove(event) {
            let newCell = document.elementFromPoint(event.pageX, event.pageY);
            if (currentCell != newCell) {
                if (newCell.tagName != 'TD') {
                    return;
                }
                if (newCell.className.includes('draggable')) {
                    return;
                }
                newCell.className = currentCell.className;
                currentCell.className = '';
                startCell = grid.querySelector('*[class="draggable start"]');
                let startCoords = startCell.id.split('-').map(x => Number(x));
                goalCell = grid.querySelector('*[class="draggable goal"]');
                let goalCoords = goalCell.id.split('-').map(x => Number(x));
                if (currentAlgorithm) {
                    clearPath();
                    instantAlgorithmsLookup[currentAlgorithm](startCoords, goalCoords);
                };
                currentCell.onpointerdown = null;
                newCell.onpointerdown = onPointerDown;
            }
            currentCell = newCell;
        }
        document.onpointerup = function() {
            document.removeEventListener('pointermove', onPointerMove);
            document.onpointerup = null;
            if (currentCell.className.includes('start')) {
                startCell = currentCell;
            }
            if (currentCell.className.includes('goal')) {
                goalCell = currentCell;
            }
            grid.addEventListener('mousedown', handleMousedown);
        }
        currentCell.ondragstart = function() {
            return false;
        }
    }
}
