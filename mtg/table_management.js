const table = document.getElementById('percent_to_cards');
const input_row = document.getElementById('input_row');
const graph = document.getElementById('graph');
const ctx = graph.getContext('2d');
let data = [];

function add_rows(rows) {
    for (i = 0; i < rows; i++) {
        let new_row = input_row.cloneNode(true);

        new_row.firstElementChild.firstElementChild.style['background-color'] = `hsl(${(i+1) * 360/(rows+1)} 30% 50%)`;

        table.firstElementChild.appendChild(new_row);
    }
}

function read_table() {
    let inputs = [];

    for (const i in row_list) {
        let parsed_row = {
            category: row_list[i].childNodes[1].firstElementChild.value,
            draws: parseInt(row_list[i].childNodes[3].firstElementChild.value) + 7,
            success: row_list[i].childNodes[5].firstElementChild.value,
            cards: row_list[i].childNodes[7].firstElementChild.innerHTML,
            id: i,
        };

        if (!(parsed_row.draws && parsed_row.success)) {
            continue;
        }
        
        inputs.push(parsed_row);
    }

    return inputs;
}

function calculate() {
    data = read_table();

    let answer = '';
    let overall_success = 1;
    let total_cards = 0;

    for (const datum of data) {
        answer = parseFloat(root(at_least_one, 32, datum.draws, datum.success).toFixed(1));
            
        overall_success *= datum.success / 100;
        total_cards += answer;

        row_list[datum.id].childNodes[7].firstElementChild.innerHTML = answer;
    }

    document.getElementById('overall_success').innerHTML = Math.round(overall_success * 100);
    document.getElementById('total_cards').innerHTML = total_cards.toFixed(1);

    data = read_table();

    create_graph();
    draw_area();
    draw_probability();
}

function at_least_one(cards, draws) {
    let probability = 1;

    for (n = 1; n <= draws; n++) {
        probability *= (100 - n - cards) / (100 - n)
    }

    return 1 - probability;
}

function root(func, iterations, draws, success) {
    let cards = 50;
    
    for (let i = 0; i < iterations; i++) {
        let guess = func(cards, draws, success) - success / 100;

        cards += 100/2**(i+2) * Math.sign(guess) * -1;
    }

    return cards;
}

function create_graph() {
    ctx.clearRect(0, 0, graph.width, graph.height)
    ctx.font = '10px Arial';

    ctx.textAlign = 'center'
    ctx.textBaseline = 'top';

    for (i = 0; i < 21; i++) {
        ctx.fillStyle = '#4C566A';
        ctx.fillRect((i + 1) * graph.width / 22, graph.height / 22, 1, graph.height * 20/22);

        ctx.fillStyle = '#D8DEE9';
        ctx.fillText(i, (i + 1) * graph.width / 22, graph.height - graph.height / 22 + 6)
    }

    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle';

    for (i = 0; i < 21; i++) {
        ctx.fillStyle = '#4C566A';
        ctx.fillRect(graph.width / 22, (i + 1) * graph.height / 22, graph.width * 20/22, 1);

        ctx.fillStyle = '#D8DEE9';
        ctx.fillText(100 - i * 5 + '%', graph.width * 21/22 + 6, (i + 1) * graph.height / 22)
    }

    ctx.textAlign = 'center'
    ctx.fillStyle = '#5E81AC';
    ctx.font = '18px Arial';

    ctx.fillText('Turn', graph.width / 2, graph.height - graph.height / 22 * 2/7);
    // ctx.fillText('Chance %', graph.width - graph.width / 21 * 4/3, graph.height / 21 * 2/5);
}

function draw_probability() {
    ctx.lineWidth = 3;
    
    for (const datum of data) {
        ctx.strokeStyle = `hsl(${(datum.id) * 360/10} 30% 50%)`;
        ctx.moveTo(-graph.width / 2, graph.height);
        ctx.beginPath();    
       
        for (let i = 0; i < 21; i++) {
            let x = (i + 1) * graph.width / 22;
            let y = graph.height * 21/22 - at_least_one(datum.cards, i + 7) * graph.height * 20/22

            ctx.lineTo(x, y)
        }
        
        ctx.stroke();
    }

    ctx.font = '15px Arial';

    for (const datum of data) {
        ctx.fillStyle = `hsl(${(datum.id) * 360/10} 30% 50%)`;   
       
        let x = (datum.draws - 7 + 1) * graph.width / 22;
        let y =  graph.height * 21/22 - at_least_one(datum.cards, datum.draws) * graph.height * 20/22;

        ctx.beginPath();
        ctx.arc(x + 1, y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText(datum.category, x, y - 12);
    }
    
}

function draw_area() {
    ctx.fillStyle = '#5E81AC66';

    for (i = 0; i < 21; i++) {
        let total_probability = 1;

        for (const datum of data) {
            total_probability *= at_least_one(datum.cards, i + 7);
        }

        ctx.fillRect(
            (i + 1) * graph.width / 22 - graph.width / 22 / 2 + ((i == 0) ? graph.width / 22 / 2 : 0), 
            graph.height * 21/22 - total_probability * graph.height * 20/22, 
            graph.width / 22 - ((i == 0 || i == 20) ? graph.width / 22 / 2 : 0) + ((i == 20) ? 0 : 0.1), 
            total_probability * graph.height * 20/22
        );
    }

    // let constricted_x = Math.round(Math.round(Math.max(Math.min(x, graph.width * 21/22), graph.width / 22) * 22 / graph.width) * graph.width / 22);
    // let constricted_y = Math.max(Math.min(y, graph.height * 21/22), graph.height / 22);
    // let total_probability = 1;

    // for (const datum of data) {
    //     if (!datum.cards) {
    //         continue;
    //     }
       
    //     let probability = at_least_one(datum.cards, Math.round(constricted_x * 22 / graph.width - 1) + 7);

    //     total_probability *= probability;

    //     let line_y = graph.height * 21/22 - probability * graph.height * 20/22;

    //     ctx.beginPath();
    //     ctx.arc(constricted_x + 1, line_y, 5, 0, 2 * Math.PI);
    //     ctx.fill();
    // }

    // let text = `Total probability: ${Math.round(100 * total_probability)}%`;
    // let offset = 12;
    
    // if (graph.width * 21/22 < x + ctx.measureText(text).width) {
    //     ctx.textAlign = 'right';
    //     offset *= -1;
    // } else {
    //     ctx.textAlign = 'left';
    // }
    
    // ctx.fillRect(constricted_x - 1, graph.height / 22 - 1, 3, graph.height * 20/22 + 1);
    // ctx.beginPath();
    // ctx.arc(constricted_x + 1, constricted_y, 5, 0, 2 * Math.PI);
    // ctx.fill();
    // ctx.fillText(text, constricted_x + offset, constricted_y);
}

add_rows(9);

let row_list = [];

for (i = 0; i < table.childNodes[1].childElementCount + 2; i++) {
    row = table.childNodes[1].childNodes[i];

    if (row.id == 'input_row') {
        row_list.push(row);
    }
}

create_graph();

// function getMousePos(graph, event) {
//     let bounding_box = graph.getBoundingClientRect();

//     return {
//       x: event.clientX - bounding_box.left,
//       y: event.clientY - bounding_box.top
//     };
// }

// graph.addEventListener('mousemove', function(evt) { 
//     let mouse = getMousePos(graph, evt);

//     create_graph(); 
//     draw_line(mouse.x, mouse.y); 
//     draw_probability(); 
// }, false);


