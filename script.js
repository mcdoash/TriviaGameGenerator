let test; //global test variable for current test

/*
Gets a list of all the available categories from open trivia database and adds it to the dropdown menu (called on load)
*/
function getCategories() {
    let req = new XMLHttpRequest()
    
    req.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            //get the list of categories
            let categories = JSON.parse(req.responseText).trivia_categories;
            
            //get the dropdown for categories
            let menu = document.getElementById("categories");
            let html = "";
            
            //add each category to dropdown
            for(let i=0; i<categories.length; i++) {
                html += '<h3 class="option" name="' + categories[i].id + '" onclick="setOption(this)">' + categories[i].name + '</h3>';
            }
            menu.innerHTML = html;
        }
    }
    req.open("GET", "https://opentdb.com/api_category.php");
    req.send();
}



/*
Sets the selected option in a dropdown
*/
function setOption(selected) {
    let options = selected.parentNode.children;
    
    //remove styling for selected for all options
    for(let i=1; i<options.length; i++) {
        options[i].classList.remove("selected");
    }
    selected.classList.add("selected");
    
    //gets h3 which displays selected option
    let showSelected = selected.parentNode.parentNode.firstElementChild;
    
    //set h3 text to the content of selected option
    showSelected.innerHTML = selected.innerText;
    
    //set the name to the selected name (useful for the category id (different than above)
    showSelected.setAttribute("name", selected.getAttribute("name"));
}


/*
Loads a test from the pre-existing 6 defined in triva.js
*/
function loadTest() {
    //show loading modal
    let modal = document.getElementById("modal");
    modal.style.display = "block";
    
    //get test number
    testNum = document.getElementById("test-num").textContent;
    
    if(!testNum) {
        alert("Please select a test to load.");
        return;
    }
    
    document.getElementById("test-title").innerHTML = testNum;
    document.getElementById("test info").innerHTML = "";
    
    test = tests[testNum];
    
    createTest(test);    
}


/*
Creates a random test with 10 questions from the open trivia database
*/
function loadRandom() {
    //show loading modal
    let modal = document.getElementById("modal");
    modal.style.display = "block";
    
    let req = new XMLHttpRequest()
    req.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            //response code of 0 corresponds with successful request
            if(JSON.parse(req.responseText).response_code == 0) {
                //set test info
                document.getElementById("test-title").innerHTML = "Random Test";
                document.getElementById("test info").innerHTML = "";
                
                //set and create test
                test = JSON.parse(req.responseText).results;
                createTest(test);
            }
            //unsuccessful request
            else {
                alert("Request failed.");
                
                //remove loading modal
                document.getElementById("modal").style.display = "none";
            }
        }
    }
    req.open("GET", "https://opentdb.com/api.php?amount=10");
    req.send();
}


/*
Creates a test from the open trivia database with the user's enteres parameters
*/
function loadCustom() {
    //show loading modal
    let modal = document.getElementById("modal");
    modal.style.display = "block";
    
    //get test parameters
    let num = document.forms["user-test"]["num"].value;
    let category = document.getElementById("category").textContent;
    let categoryId = document.getElementById("category").getAttribute("name");
    let difficulty = document.getElementById("difficulty").textContent.toLowerCase();
    
    
    //trivia request
    let req = new XMLHttpRequest()
    req.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            //response code of 0 corresponds with successful request
            if(JSON.parse(req.responseText).response_code == 0) {
                //set test info
                document.getElementById("test-title").innerHTML = category;
                document.getElementById("test info").innerHTML = difficulty + " | " + num + " questions";
                
                //set and create test
                test = JSON.parse(req.responseText).results;
                createTest(test);
            }
            //unsuccessful request
            else {
                alert("Request failed. Please select all values.");
                
                //remove loading modal
                document.getElementById("modal").style.display = "none";
            }
        }
    }
    req.open("GET", ("https://opentdb.com/api.php?amount=" + num + "&category=" + categoryId + "&difficulty=" + difficulty));
    req.send();
}


function createTest(test) {
    let html = "";
    let q;

    for(let i=0; i<test.length; i++) {
        q = test[i];
        
        html += '<div class="question" id="q' + i + '"><h3>' + q.question + '<span class="tooltip"><p>Category: ' + q.category + '<br/>Difficulty: ' + q.difficulty + '</span></h3>';

        //get options
        let options = [];
        
        for(let x=0; x<q.incorrect_answers.length; x++) {
            options.push(q.incorrect_answers[x]);
        }
        options.push(q.correct_answer);
        
        //randomize option order
        for(let i=options.length-1; i>0; i--) {
            let rand = Math.floor(Math.random() * i);
            let temp = options[rand];
            options[rand] = options[i];
            options[i] = temp;
        }
         
        //build options
        for(let x=0; x<options.length; x++) {
            html += '<label><input type="radio" name="' + i + '" value="' + options[x] + '">' + options[x] +'</label>'
        }
        html += '</div>';
    }
    
    //display score num
    let score = document.getElementById("score");
    score.innerHTML = "<sup></sup>&frasl;<sub>" + test.length + "</sub>";
    
    //remove loadin modal, create test screen and show test screen 
    let createScreen = document.getElementById("create-test");
    let testScreen = document.getElementById("play-test");
    document.getElementById("test").innerHTML = html;
    let modal = document.getElementById("modal");
    
    modal.style.display = "none";
    createScreen.style.display = "none";
    testScreen.style.display = "block";
}


/*
Checks each question to determine if all the questions were answered, and determine if they were right or wrong. Displays styling based on those answers
*/
function checkTest() {
    clearStyling();
    
    let allAnswered = true;
    let numCorrect = 0;
    let correct = [];
    let incorrect = [];
    
    //iterate through each question
    for(let i=0; i<test.length; i++) {
        let options = document.getElementsByName(i);
        let qAnswered = false;
        //iterate through each option in question
        for(let x=0; x<options.length; x++) {
            if(options[x].checked) {
                
                    qAnswered = true;
                if(options[x].value.localeCompare(test[i].correct_answer) === 0) {
                    correct.push(options[x]);
                    numCorrect++;
                }
                else {
                    incorrect.push(options[x]);
                }
            }
        }
        
        if(qAnswered == false) {
            allAnswered = false;

            //get the assoicated question div and add unaswered class
            let question = document.getElementById("q" + i);
            question.classList.add("unanswered");
        }
    }
    //if not all questions were answered, show alert
    if(allAnswered == false) {
        //set unanswered q's text colour to red
        alert("Please answer all questions.");
        return;
    }
    //if all answers were answered, we can  show styling for graded test
    else {
        //set styling for all correct answers
        for(let i=0; i<correct.length; i++) {
            correctAnswer(correct[i]);
        }
        //set styling for all incorrect answers
        for(let i=0; i<incorrect.length; i++) {
            incorrectAnswer(incorrect[i]);
        }
        //disable all options
        for(let i=0; i<test.length; i++) {
            let options = document.getElementsByName(i);
            //diable each option in question
            for(let x=0; x<options.length; x++) {
                options[x].disabled = true;
            }
        }
        //disable checking test
        let checkBtn = document.getElementById("checkbtn");
        checkBtn.removeAttribute("onclick");
        checkBtn.classList.add("disabled");
        
        //display score
        let score = document.getElementById("score");
        score.innerHTML = "<sup>" + numCorrect + "</sup>&frasl;<sub>" + test.length + "</sub>";
    }
}


/*
Adds styling for correct answers, and span with checkmark/correct designation
*/
function correctAnswer(selected) {
    //gets the assoicated question div
    let question = selected.parentElement.parentElement;
    
    question.classList.add("correct");
    
    let feedbackBar = document.createElement("span");
    feedbackBar.setAttribute("class", "status");
    
    let check = document.createElement("i");
    check.classList.add("fas", "fa-check-circle");
    let text = document.createTextNode(" Correct!");
    
    feedbackBar.appendChild(check);
    feedbackBar.appendChild(text);
    question.insertBefore(feedbackBar, question.childNodes[0]);
}


/*
Adds styling for incorrect answers, and span with checkmark/incorrect designation
*/
function incorrectAnswer(selected) {
    //gets the assoicated question div
    let question = selected.parentElement.parentElement;
    
    question.classList.add("incorrect");
    
    let feedbackBar = document.createElement("span");
    feedbackBar.setAttribute("class", "status");
    
    let x = document.createElement("i");
    x.classList.add("fas", "fa-times-circle");
    let text = document.createTextNode(" Incorrect!");
    
    feedbackBar.appendChild(x);
    feedbackBar.appendChild(text);
    question.insertBefore(feedbackBar, question.childNodes[0]);
}


/*
Clears all answers from the test 
*/
function clearTest() {
    //confirm clear test
    if(!confirm("Are you sure you want to clear the test?")) {
        return;
    }
    
    //clear question styling 
    clearStyling();
    
    //enable check test button
        document.getElementById("checkbtn").setAttribute("onclick", "checkTest()");
        document.getElementById("checkbtn").classList.remove("disabled");
    
    //enable and unselect all options
    for(let i=0; i<test.length; i++) {
        let options = document.getElementsByName(i);
        //diable each option in question
        for(let x=0; x<options.length; x++) {
            options[x].disabled = false;
            options[x].checked = false;
        }
    }
    
    //reset score
    let score = document.getElementById("score");
    score.innerHTML = "<sup></sup>&frasl;<sub>" + test.length + "</sub>";
}


/*
Clears styling for incorrect, correct, and unasnwered questions, therefore setting it to the "defaul" state
@param      feedback    true if feebackBars should be removed
                        false if it shoulf not
*/
function clearStyling() {
    let questions = document.getElementsByClassName("question");
    let feedbackBar = document.getElementsByClassName("status");
    
    for(let i=0; i<questions.length; i++) {
        
        questions[i].classList.remove("incorrect", "correct", "unanswered");
        
        //removes all span with check/x mark
        while(feedbackBar.length > 0){
           feedbackBar[0].parentNode.removeChild(feedbackBar[0]);
       }
    }
}

/*
Removes the trivia game screen and brings up the create test screen to allow user to create a new test
*/
function newTest() {
    //clear test
    clearTest();
    
    //reset forms
    document.getElementById("test-num").textContent = "Choose test...";
    document.getElementById("user-test").reset(); //resets number of questions
    document.getElementById("category").textContent = "Category...";
    document.getElementById("difficulty").textContent = "Difficulty...";
    
    //remove test screen and show create test screen 
    let createScreen = document.getElementById("create-test");
    let testScreen = document.getElementById("play-test");
    
    testScreen.style.display = "none";
    createScreen.style.display = "flex";
}