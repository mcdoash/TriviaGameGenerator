/*
loadTest function loads a test from the pre-existing 6 defined in triva.js
*/
function loadTest() {
    //get test number
    let testNum = document.forms["premade-test"]["premade-options"].value;
    
    if(!testNum) {
        alert("Please select a test to load.");
        return;
    }
    if(testNum.localeCompare("Random")) {
        let keys = Object.keys(tests);
        testNum = keys[Math.floor(Math.random() * 6)];
        console.log(testNum);
    }
    
    //remove create test screen and show test screen 
    let createScreen = document.getElementById("create-test");
    let testScreen = document.getElementById("play-test");
    
    createScreen.style.display = "none";
    testScreen.style.display = "block";
    
    let test = tests[testNum];
    console.log(test);
    let html = "";
    let q;

    for(let i=0; i<=test.length-1; i++) {
        q = test[i];
        html += '<div class="question"><h3>' + q.question + '<span class="tooltip"><p>Category: ' + q.category + '<br/>Difficulty: ' + q.difficulty + '</span></h3>';

        let options = [];
        for(let x=0; x<q.incorrect_answers.length; x++) {
            options.push(q.incorrect_answers[x]);
        }
        
        options.push(q.correct_answer);

        for(let x=0; x<options.length; x++) {
            html += '<label><input type="radio" name="' + i + '" value="' + options[x] + '">' + options[x] +'</label>'
        }
        html += '</div>';
    }
    
    document.getElementById("test").innerHTML = html;
}


function checkTest() {
    
}
/*
function sendPost(){
			req = new XMLHttpRequest();
			//We won't even handle the response
			req.open("POST", `http://localhost:3000/`);
			//Below is the body, it is in plain text
			obj = {name : "dave", age : "old"};
			
			req.send(JSON.stringify(obj));
		}

*/



