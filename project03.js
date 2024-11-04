// Main screen to show my application
const app = document.querySelector('#app');

// Handlebar compling
const startTemplate = Handlebars.compile(document.querySelector('#start-template').innerHTML);
const questionTemplate = Handlebars.compile(document.querySelector('#question-template').innerHTML);

// constructor
let correct = 0;
let incorrect = 0;
let questionNumber = 1;
let startTime;
let quizInProgress = false;

// using new approach to render instead of waiting for all to load.
function renderStartView() {
    app.innerHTML = startTemplate();
    document.querySelector('#quizForm').addEventListener('submit', handleQuizStart);
}

// to start the quiz
function handleQuizStart(event) {
    event.preventDefault(); //to have user enter the name.
    const userName = document.querySelector('#userName').value;
    const selectedQuiz = document.querySelector('#quizSelection').value;
    
    // Initialize all attributes
    correct = 0;
    incorrect = 0;
    questionNumber = 1;
    startTime = Date.now();
    quizInProgress = true;
    totalNumber = 0;

    loadQuestion(questionNumber, userName, selectedQuiz); // Start with question 1
}

// using await and fetch to get API
async function loadQuestion(questionId, userName, quizId) {
    if (questionNumber > 10) {
        return endQuiz(userName);
    }
        const response = await fetch(`https://my-json-server.typicode.com/Sang5Ch/project03/${quizId}/${questionId}`);
        const questionData = await response.json();
        
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const score = Math.floor((correct / totalNumber) * 100);
        
        renderQuestion({
            ...questionData,
            correct,
            incorrect,
            elapsedTime,
            score
        }, questionId, userName, quizId);
    
}

// Render question view
function renderQuestion(data, questionId, userName, quizId) {
    app.innerHTML = questionTemplate(data);

    // check for answer
    document.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', () => evaluateAnswer(option.dataset.answer, data.correctAnswer, questionId, userName, quizId));
    });

    // provide answer
    if (data.isNarrative) {
        document.querySelector('#submitNarrative').addEventListener('click', () => {
            const answer = document.querySelector('#narrativeAnswer').value;
            evaluateAnswer(answer, data.correctAnswer, questionId, userName, quizId);
        });
    }
}

// if answer is right, increase the correct. Vise versa for wrong.
function evaluateAnswer(givenAnswer, correctAnswer, questionId, userName, quizId) {
    if (givenAnswer.trim() === correctAnswer) {
        correct++;
        app.innerHTML = `
    <div class="card shadow p-4 text-center my-3">
        <div class="alert alert-success" role="alert">
            <h1 class="display-4">Correct!</h1>
            <p class="lead">Great job, ${userName}!</p>
        </div>
    </div>
`; //made it fancy using bootstrap
        setTimeout(() => {
            questionNumber++;
            totalNumber++;
            loadQuestion(questionNumber, userName, quizId);
        }, 1000);
    } else {
        incorrect++;
        app.innerHTML = `
    <div class="card shadow p-4 text-center my-3">
        <div class="alert alert-danger" role="alert">
            <h1 class="display-4">Incorrect</h1>
            <p class="lead">The correct answer was: <strong>${correctAnswer}</strong>.</p>
            <button id="gotIt" class="btn btn-outline-light mt-3">Got it</button>
        </div>
    </div>
`;//made it fancy using bootstrap again.
        document.querySelector('#gotIt').addEventListener('click', () => {
            questionNumber++;
            totalNumber++;
            loadQuestion(questionNumber, userName, quizId);
        });
    }
}

// 80 pass or fail
function endQuiz(userName) {
    quizInProgress = false;
    const score = Math.floor((correct / 10) * 100);

    if (score >= 80) {
        alert(`Congratulations, ${userName}! You passed the quiz!`);
    } else {
        alert(`Sorry, ${userName}, you failed the quiz.`);
    }

    renderStartView(); // Restart quiz
}

// Initialize the app
renderStartView();
