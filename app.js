class QuizApp {
	constructor() {
		this.quizData = null;
		this.currentQuestionIndex = 0;
		this.selectedAnswers = [];
		this.score = 0;

		this.init();
	}

	async init() {
		try {
			const response = await fetch("quiz-data.json");
			this.quizData = await response.json();

			this.setupEventListeners();
			this.renderLandingPage();
		} catch (error) {
			console.error("Error loading quiz data:", error);
			alert("Failed to load quiz data. Please refresh the page.");
		}
	}

	setupEventListeners() {
		document
			.getElementById("start-btn")
			.addEventListener("click", () => this.startQuiz());

		document
			.getElementById("prev-btn")
			.addEventListener("click", () => this.previousQuestion());
		document
			.getElementById("next-btn")
			.addEventListener("click", () => this.submitAnswer());
		document
			.getElementById("restart-quiz-btn")
			.addEventListener("click", () => this.confirmRestart());

		document
			.getElementById("continue-btn")
			.addEventListener("click", () => this.nextQuestion());

		document
			.getElementById("retake-btn")
			.addEventListener("click", () => this.resetQuiz());
	}

	confirmRestart() {
		if (
			confirm(
				"Are you sure you want to restart the quiz? Your progress will be lost."
			)
		) {
			this.resetQuiz();
		}
	}

	renderLandingPage() {
		document.getElementById("quiz-title").textContent =
			this.quizData.quizTitle;
		document.getElementById("quiz-subtitle").textContent =
			this.quizData.quizSubtitle;
	}

	startQuiz() {
		this.showScreen("quiz-page");
		this.renderQuestion();
	}

	renderQuestion() {
		const question = this.quizData.questions[this.currentQuestionIndex];
		const totalQuestions = this.quizData.questions.length;

		const progressPercent =
			((this.currentQuestionIndex + 1) / totalQuestions) * 100;
		document.getElementById(
			"progress-fill"
		).style.width = `${progressPercent}%`;
		document.getElementById("current-question").textContent =
			this.currentQuestionIndex + 1;
		document.getElementById("total-questions").textContent = totalQuestions;

		document.getElementById("question-text").textContent = question.question;

		const optionsContainer = document.getElementById("options-container");
		optionsContainer.innerHTML = "";

		question.options.forEach((option, index) => {
			const optionElement = document.createElement("div");
			optionElement.className = "option";
			optionElement.innerHTML = `
                <span class="option-letter">${String.fromCharCode(
							65 + index
						)}</span>
                <span>${option}</span>
            `;

			if (this.selectedAnswers[this.currentQuestionIndex] === index) {
				optionElement.classList.add("selected");
			}

			optionElement.addEventListener("click", () =>
				this.selectOption(index)
			);
			optionsContainer.appendChild(optionElement);
		});

		document.getElementById("prev-btn").disabled =
			this.currentQuestionIndex === 0;
		document.getElementById("next-btn").disabled =
			this.selectedAnswers[this.currentQuestionIndex] === undefined;
	}

	selectOption(index) {
		document
			.querySelectorAll(".option")
			.forEach((opt) => opt.classList.remove("selected"));

		document.querySelectorAll(".option")[index].classList.add("selected");

		this.selectedAnswers[this.currentQuestionIndex] = index;

		document.getElementById("next-btn").disabled = false;
	}

	previousQuestion() {
		if (this.currentQuestionIndex > 0) {
			this.currentQuestionIndex--;
			this.renderQuestion();
		}
	}

	submitAnswer() {
		const question = this.quizData.questions[this.currentQuestionIndex];
		const selectedAnswer = this.selectedAnswers[this.currentQuestionIndex];
		const isCorrect = selectedAnswer === question.correctAnswer;

		this.showFeedback(isCorrect, question);
	}

	showFeedback(isCorrect, question) {
		this.showScreen("feedback-page");

		const feedbackIcon = document.getElementById("feedback-icon");
		const feedbackTitle = document.getElementById("feedback-title");

		if (isCorrect) {
			feedbackIcon.innerHTML = "✓";
			feedbackIcon.className = "feedback-icon correct";
			feedbackTitle.textContent = "Correct!";
			feedbackTitle.className = "feedback-title correct";
		} else {
			feedbackIcon.innerHTML = "✗";
			feedbackIcon.className = "feedback-icon incorrect";
			feedbackTitle.textContent = "Not quite!";
			feedbackTitle.className = "feedback-title incorrect";
		}

		document.getElementById("explanation-text").textContent =
			question.explanation;

		document.getElementById("dx-fact-text").textContent = question.dxFact;
		document.getElementById("statistic-text").textContent =
			question.statistic;
	}

	nextQuestion() {
		const question = this.quizData.questions[this.currentQuestionIndex];
		const selectedAnswer = this.selectedAnswers[this.currentQuestionIndex];
		const isCorrect = selectedAnswer === question.correctAnswer;

		if (isCorrect) {
			this.score++;
		}

		this.currentQuestionIndex++;

		if (this.currentQuestionIndex < this.quizData.questions.length) {
			this.showScreen("quiz-page");
			this.renderQuestion();
		} else {
			this.showResults();
		}
	}

	showResults() {
		this.showScreen("results-page");

		const totalQuestions = this.quizData.questions.length;
		const successRate = Math.round((this.score / totalQuestions) * 100);

		const resultMessage = this.quizData.resultsMessages.find(
			(msg) => this.score >= msg.minScore && this.score <= msg.maxScore
		);

		document.getElementById(
			"score-display"
		).textContent = `${this.score}/${totalQuestions}`;
		document.getElementById("results-title").textContent =
			resultMessage.title;
		document.getElementById("results-message").textContent =
			resultMessage.message;
		document.getElementById("correct-count").textContent = this.score;
		document.getElementById("success-rate").textContent = `${successRate}%`;
		document.getElementById("cta-message").textContent = resultMessage.cta;

		const ctaButton = document.getElementById("cta-button");
		ctaButton.textContent = this.quizData.ctaButton;
		ctaButton.href = this.quizData.ctaUrl;
	}

	resetQuiz() {
		this.currentQuestionIndex = 0;
		this.selectedAnswers = [];
		this.score = 0;
		this.showScreen("landing-page");
	}

	showScreen(screenId) {
		document.querySelectorAll(".screen").forEach((screen) => {
			screen.classList.remove("active");
		});

		document.getElementById(screenId).classList.add("active");

		window.scrollTo({ top: 0, behavior: "smooth" });
	}
}

document.addEventListener("DOMContentLoaded", () => {
	new QuizApp();
});
