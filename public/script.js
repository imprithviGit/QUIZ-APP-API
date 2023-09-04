// Selecting HTML elements for interaction
const questionContainer = document.querySelector('.question');
const optionsContainer = document.querySelector('.options');
const scoreElement = document.getElementById('score');
const currentUserDisplay = document.getElementById('currentUser');

// Variables to keep track of the game state
let questions = [];
let currentQuestionIndex = 0;
let score = 0; // This variable records the user's current session score

let currentUser = Number(currentUserDisplay.textContent);
let scores = [0, 0]; // Storing scores for User 1 at index 0 and User 2 at index 1
let user1Finished = false;
let user2Finished = false;

// Function to retrieve a question from the server
function fetchQuestion() {
    fetch(`/fetch-questions?user=${currentUser}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not successful");
            }
            return response.json();
        })
        .then(data => {
            questions = data.results;
            displayQuestion(questions[currentQuestionIndex]);
        })
        .catch(error => {
            console.error(`Error fetching questions for User ${currentUser}:`, error);
        });
}

// Function to display a question and its options
function displayQuestion(questionData) {
    const questionText = `Question ${currentQuestionIndex + 1}: ${questionData.question}`;
    const options = [...questionData.incorrect_answers, questionData.correct_answer];

    // Shuffling the answer options
    options.sort(() => Math.random() - 0.5);

    questionContainer.innerHTML = questionText;
    optionsContainer.innerHTML = options.map(option => `<button class="option">${option}</button>`).join('');

    // Adding click event listeners to options for scoring
    document.querySelectorAll('.option').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.textContent === questionData.correct_answer) {
                score += 5;
            } else {
                score -= 2;
            }
            scoreElement.innerText = score;
            document.querySelectorAll('.option').forEach(button => button.disabled = true);
        });
    });
}

// Function to proceed to the next question
function goToNextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion(questions[currentQuestionIndex]);
    } else {
        if (currentUser === 1) {
            scores[0] = score; // Updating the score for User 1
            user1Finished = true;
        } else {
            scores[1] = score; // Updating the score for User 2
            user2Finished = true;
        }

        if (user1Finished && user2Finished) {
            announceWinner();
        } else {
            alert(`Quiz ended for User ${currentUser}.`);
        }
    }
}

// Handling modal pop-ups and result announcement
const modal = document.getElementById('resultModal');
const closeModal = document.querySelector(".close");

closeModal.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
}

function announceWinner() {
    const modal = document.getElementById('resultModal');
    const winnerMessageElement = document.getElementById('winnerMessage');
    let winnerMessage = '';

    // Determining the winner based on the scores
    if (scores[0] > scores[1]) {
        winnerMessage = 'User 1 wins!';
    } else if (scores[1] > scores[0]) {
        winnerMessage = 'User 2 wins!';
    } else {
        winnerMessage = "It's a tie!";
    }

    winnerMessageElement.textContent = winnerMessage;
    modal.style.display = "block";

    // Closing the modal when the 'x' is clicked
    const closeModal = document.querySelector(".close");
    closeModal.onclick = function() {
        modal.style.display = "none";
    }

    // Closing the modal when anywhere outside of it is clicked
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }

    // Resetting user flags and scores for the next round
    user1Finished = false;
    user2Finished = false;
    scores[0] = 0;
    scores[1] = 0;
}

// Event listener for the "Submit" button
document.getElementById('submitBtn').addEventListener('click', () => {
    // Displaying a "submitted successfully" popup
    const submitModal = document.getElementById('submitModal');
    submitModal.style.display = "block";

    // Closing the modal when the 'x' is clicked
    const closeModal = document.querySelectorAll(".close");
    closeModal.forEach(closeBtn => {
        closeBtn.onclick = function() {
            submitModal.style.display = "none";
            downloadScorecards();
        }
    });

    // Closing the modal when anywhere outside of it is clicked
    window.onclick = function(event) {
        if (event.target === submitModal) {
            submitModal.style.display = "none";
            downloadScorecards();
        }
    }

    // Checking if both users have finished
    checkBothFinished();
});

// Function to download scorecards
function downloadScorecards() {
    // Creating and triggering links for both User 1 and User 2 scorecards
    const user1ScoreLink = document.createElement('a');
    user1ScoreLink.href = generateScorecardHTML(1);
    user1ScoreLink.target = '_blank';
    user1ScoreLink.download = 'user1_scorecard.html';
    user1ScoreLink.click();

    const user2ScoreLink = document.createElement('a');
    user2ScoreLink.href = generateScorecardHTML(2);
    user2ScoreLink.target = '_blank';
    user2ScoreLink.download = 'user2_scorecard.html';
    user2ScoreLink.click();
}

// Function to generate the scorecard HTML
function generateScorecardHTML(userNumber) {
    const userName = `User ${userNumber}`;
    const userScore = scores[userNumber - 1];

    const scorecardHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${userName} Scorecard</title>
        </head>
        <body>
            <h1>${userName} Scorecard</h1>
            <p>Score: ${userScore}</p>
        </body>
        </html>
    `;

    const blob = new Blob([scorecardHTML], { type: 'text/html' });
    return URL.createObjectURL(blob);
}

// Event listener for the "Next" button
document.getElementById('nextBtn').addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion(questions[currentQuestionIndex]);
    } else {
        alert(`Quiz ended for User ${currentUser}. Please submit your quiz.`);
    }
});

// Event listener for the "Pass" button
document.getElementById('passBtn').addEventListener('click', goToNextQuestion);

// Fetching the first question to start the quiz
fetchQuestion();
