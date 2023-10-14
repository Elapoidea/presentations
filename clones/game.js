let css = getComputedStyle(document.querySelector(':root'));

let square_size = +css.getPropertyValue('--square-size');
let board_size = +css.getPropertyValue('--board-size');
let board_offset_x = +css.getPropertyValue('--board-offset-x');
let board_offset_y = +css.getPropertyValue('--board-offset-y');

let slide_number = 0;
let slides_up = [create_weights, plain_sums, factored_sums, reduce_sum, complete_sum, single_column, final];
let slides_down = [delete_weights, blank_sums, plain_sums, factored_sums, reduce_sum, single_column, final];

function create_canvases() {
    for (y = 0; y < board_size; y++) {
        for (x = 0; x < board_size; x++) {
            let square = document.createElement('div');

            square.id = `square_${x}_${y}`;
            square.classList.add((y + x) % 2 == 0 ? 'dark' : 'light');

            square.style.width = square_size;
            square.style.height = square_size;
            square.style.top = `${square_size * y + board_offset_y}px`;
            square.style.left = `${square_size * x + board_offset_x}px`;

            square.appendChild(document.createElement('p'));

            document.getElementById('squares').appendChild(square); 
        }
    }
}

function create_clones() {
    for (y = 0; y < board_size; y++) {
        for (x = 0; x < board_size; x++) {
            let clone = document.createElement('div');

            clone.id = `clone_${x}_${y}`;
            clone.classList.add('clone');
            
            if (x + y < 2) {
                clone.classList.add('active')
                document.getElementById(`square_${x}_${y}`).classList.add('prison')
            }

            clone.style.width = square_size;
            clone.style.height = square_size;
            clone.style.top = `${square_size * y + board_offset_y}px`;
            clone.style.left = `${square_size * x + board_offset_x}px`;

            document.getElementById('clones').appendChild(clone);
        }
    }
}

function create_weights() {
    for (y = 0; y < board_size; y++) {
        for (x = 0; x < board_size; x++) {
            let square = document.getElementById(`square_${x}_${y}`);
            let p = square.childNodes[0];

            if (x + y == 0) {
                p.innerHTML = 'x';
            } else if (x + y <= 16) {
                p.innerHTML = `x / ${2**(x+y)}`;
            } else {
                p.innerHTML = `x / 2^${x+y}`;
            }
        }
    }

    document.getElementById('board_weight').classList.remove('invisible');
}

function delete_weights() {
    for (y = 0; y < board_size; y++) {
        for (x = 0; x < board_size; x++) {
            let square = document.getElementById(`square_${x}_${y}`);
            let p = square.childNodes[0];

            p.innerHTML = '';
        }
    }

    document.getElementById('board_weight').classList.add('invisible');
}

function active_clone(x, y) {
    return get_clone(x, y).classList.contains('active');
}

function get_clone(x, y) {
    return document.getElementById(`clone_${x}_${y}`);
}

function toggle_clone(x, y) {
    document.getElementById(`clone_${x}_${y}`).classList.toggle('active');
}

function interact_with_clone(e) {
    continue_animation = false;

    if (e.pageX < board_offset_x || e.pageY < board_offset_y) { return; }

    let x = Math.floor((e.pageX - board_offset_x) / square_size);
    let y= Math.floor((e.pageY - board_offset_y) / square_size);

    if (active_clone(x, y) && !active_clone(x + 1, y) && !active_clone(x, y + 1)) {
        toggle_clone(x, y)
        toggle_clone(x + 1, y)
        toggle_clone(x, y + 1)
    }

    update_board_weight();
}

function create_sums() {
    for (i = 0; i < board_size; i++) {
        let sum_label = document.createElement('p');

        sum_label.style.top = board_offset_y - 20;
        sum_label.style.left = board_offset_x + square_size * i;
        sum_label.id = `sum_row_${i + 1}`;
        sum_label.classList.add('sum_label');
        
        document.getElementById('sums').appendChild(sum_label);
    }
}

function blank_sums() {
    for (i = 0; i < board_size; i++) {
        let sum_label = document.getElementById(`sum_row_${i + 1}`);

        sum_label.innerHTML = '';
    } 
}

function plain_sums() {
    for (i = 0; i < board_size; i++) {
        let sum_label = document.getElementById(`sum_row_${i + 1}`);

        if (i < 2) {
            sum_label.innerHTML = `${2/(i + 1)}x +`;
        } else if (i <= 10) {
            sum_label.innerHTML = `x/${2**(i - 1)} +`;
        } else {
            sum_label.innerHTML = `x/2^${i - 1} +`;
        }
    }
}

function factored_sums() {
    for (i = 0; i < board_size; i++) {
        let sum_label = document.getElementById(`sum_row_${i + 1}`);

        if (i == 0) {
            sum_label.innerHTML = '2x ( 1 +';
        } else if (i <= 10) {
            sum_label.innerHTML = `1/${2**i} +`;
        } else {
            sum_label.innerHTML = `1/2^${i} +`;
        }
    }
}

function reduce_sum() {
    blank_sums();

    document.getElementById('sum_row_1').innerHTML = '2x ( 2 )';
}

function complete_sum() {
    blank_sums();
    
    document.getElementById(`sum_row_1`).innerHTML = '4x';
}

function update_board_weight() {
    let text = document.getElementById('board_weight');
    let active_weights = [];

    for (y = 0; y < board_size; y++) {
        for (x = 0; x < board_size; x++) {
            if (document.getElementById(`clone_${x}_${y}`).classList.contains('active')) {
                active_weights.push('x' + ((x + y == 0) ? '' : `/${2**(x+y)}`));
            } 
        }
    }

    let total_weight = active_weights.sort(function(a, b){ return Number(a.slice(2)) - Number(b.slice(2)) }).join(' + ');

    text.innerHTML = `Board Weight = 2x = ${total_weight}`;
}

function single_column() {
    for (y = 0; y < board_size; y++) {
        for (x = 0; x < board_size; x++) {          
            if (x != 0) {
                document.getElementById(`clone_${x}_${y}`).classList.toggle('invisible');
                document.getElementById(`square_${x}_${y}`).classList.toggle('invisible');
            }
        }
    }
}

function final() {
    single_column();
    blank_sums();
    delete_weights();

    document.getElementById('qed').classList.toggle('invisible');
    document.getElementById('overlay').classList.toggle('invisible');
}

document.getElementById('board_weight').classList.toggle('invisible');

create_sums();
create_canvases();
create_clones();
update_board_weight();

document.addEventListener('click', interact_with_clone, true);

function change_slide(x) {
    continue_animation = false;

    if (x == 1 && slide_number < slides_up.length) {
        slides_up[slide_number]();

        slide_number += x;
    } 

    if (x == -1 && slide_number > 0) {
        slide_number += x;

        slides_down[slide_number]();
    }

    console.log(slide_number);
}