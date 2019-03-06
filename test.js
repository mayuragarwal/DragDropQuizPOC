var shuffleQuestions = true;	/* Shuffle questions ? */
var shuffleAnswers = true;	/* Shuffle answers ? */
var lockedAfterDrag = false;	/* Lock items after they have been dragged, i.e. the user get's only one shot for the correct answer */

function quizIsFinished() {
	// This function is called when everything is solved		
}

/* Don't change anything below here */
var dragContentDiv;
var dragContent = false;

var dragSource = false;
var dragDropTimer = -1;
var destinationObjArray = new Array();
var destination = false;
var dragSourceParent = false;
var dragSourceNextSibling = false;
var answerDiv;
var questionDiv;
var sourceObjectArray = new Array();
var arrayOfEmptyBoxes = new Array();
var arrayOfAnswers = new Array();

window.onload = function () {
	var questionId = "1";
	initDragDropScript("dragScriptContainer" + questionId, "dragContent" + questionId,
		"questionDiv" + questionId, "answerDiv" + questionId);
	//initDragDropScript("questionDiv2", "answerDiv2");
};

function initDragDropScript(containerDivId, dragContentDivId, questionDivId, answerDivId) {
	console.log('Inside initDragDropScript');
	dragContentDiv = document.getElementById(dragContentDivId);

	answerDiv = document.getElementById(answerDivId);
	answerDiv.onselectstart = cancelEvent;
	var divs = answerDiv.getElementsByTagName('DIV');
	var answers = new Array();

	for (var no = 0; no < divs.length; no++) {

		if (divs[no].className == 'dragDropSmallBox left-capsule-text') {
			divs[no].onmousedown = function (e) {
				initDragDrop(e, containerDivId, questionDivId, answerDivId);
			};
			answers[answers.length] = divs[no];
			arrayOfAnswers[arrayOfAnswers.length] = divs[no];
		}

	}

	if (shuffleAnswers) {
		for (var no = 0; no < (answers.length * 10); no++) {
			var randomIndex = Math.floor(Math.random() * answers.length);
			answerDiv.appendChild(answers[randomIndex]);
		}
	}

	sourceObjectArray['obj'] = answerDiv;
	sourceObjectArray['left'] = getLeftPos(answerDiv);
	sourceObjectArray['top'] = getTopPos(answerDiv);
	sourceObjectArray['width'] = answerDiv.offsetWidth;
	sourceObjectArray['height'] = answerDiv.offsetHeight;


	questionDiv = document.getElementById(questionDivId);

	questionDiv.onselectstart = cancelEvent;
	var divs = questionDiv.getElementsByTagName('DIV');

	var questions = new Array();
	var questionsOpenBoxes = new Array();


	for (var no = 0; no < divs.length; no++) {
		if (divs[no].className == 'destinationBox') {
			var index = destinationObjArray.length;
			destinationObjArray[index] = new Array();
			destinationObjArray[index]['obj'] = divs[no];
			destinationObjArray[index]['left'] = getLeftPos(divs[no])
			destinationObjArray[index]['top'] = getTopPos(divs[no])
			destinationObjArray[index]['width'] = divs[no].offsetWidth;
			destinationObjArray[index]['height'] = divs[no].offsetHeight;
			questionsOpenBoxes[questionsOpenBoxes.length] = divs[no];
			arrayOfEmptyBoxes[arrayOfEmptyBoxes.length] = divs[no];
		}
		if (divs[no].className == 'dragDropSmallBox left-capsule-text') {
			questions[questions.length] = divs[no];
		}

	}

	if (shuffleQuestions) {
		for (var no = 0; no < (questions.length * 10); no++) {
			var randomIndex = Math.floor(Math.random() * questions.length);

			questionDiv.appendChild(questions[randomIndex]);
			questionDiv.appendChild(questionsOpenBoxes[randomIndex]);

			destinationObjArray[destinationObjArray.length] = destinationObjArray[randomIndex];
			destinationObjArray.splice(randomIndex, 1);

			questionsOpenBoxes[questionsOpenBoxes.length] = questionsOpenBoxes[randomIndex];
			questionsOpenBoxes.splice(randomIndex, 1);
			questions[questions.length] = questions[randomIndex];
			questions.splice(randomIndex, 1);
		}
	}

	questionDiv.style.visibility = 'visible';
	answerDiv.style.visibility = 'visible';

	var containerDiv = document.getElementById(containerDivId);
	containerDiv.onmouseup = function (e) {
		dragDropEnd(e, questionDivId, answerDivId);
	};
	containerDiv.onmousemove = function (e) {
		dragDropMove(e, containerDivId, dragContentDivId);
	};
	setTimeout('resetPositions()', 150);
	window.onresize = resetPositions;
}

function getTopPos(inputObj) {
	console.log('Inside getTopPos');
	if (!inputObj || !inputObj.offsetTop) return 0;
	var returnValue = inputObj.offsetTop;
	while ((inputObj = inputObj.offsetParent) != null) returnValue += inputObj.offsetTop;
	return returnValue;
}

function getLeftPos(inputObj) {
	console.log('Inside getLeftPos');
	if (!inputObj || !inputObj.offsetLeft) return 0;
	var returnValue = inputObj.offsetLeft;
	while ((inputObj = inputObj.offsetParent) != null) returnValue += inputObj.offsetLeft;
	return returnValue;
}

function cancelEvent() {
	console.log('Inside cancelEvent');
	return false;
}

function initDragDrop(e, containerDivId, questionDivId, answerDivId) {
	console.log('Inside initDragDrop');
	//if (document.all) e = event;

	if (lockedAfterDrag && e.currentTarget.parentNode.parentNode.id == questionDivId)
		return;

	console.log("dragContentDiv: " + dragContentDiv);
	var containerDiv = document.getElementById(containerDivId);
	dragContentDiv.style.left = e.clientX + containerDiv.scrollLeft + 'px';
	dragContentDiv.style.top = e.clientY + containerDiv.scrollTop + 'px';
	dragSource = e.currentTarget;
	dragSourceParent = e.currentTarget.parentNode;
	dragSourceNextSibling = false;
	if (e.currentTarget.nextSibling) dragSourceNextSibling = e.currentTarget.nextSibling;
	if (!dragSourceNextSibling.tagName) dragSourceNextSibling = dragSourceNextSibling.nextSibling;

	dragDropTimer = 0;
	timeoutBeforeDrag();

	return false;
}

function timeoutBeforeDrag() {
	
	if (dragDropTimer >= 0 && dragDropTimer < 10) {
		dragDropTimer = dragDropTimer + 1;
		setTimeout('timeoutBeforeDrag()', 10);
		return;
	}

	console.log('Inside timeoutBeforeDrag');
	if (dragDropTimer >= 10) {
		dragContentDiv.style.display = 'block';
		dragContentDiv.innerHTML = '';
		dragContentDiv.appendChild(dragSource);
	}
}

function dragDropMove(e, containerDivId, dragContentDivId) {
	if (dragDropTimer < 10) {
		return;
	}

	console.log('Inside dragDropMove');
	//if (document.all) e = event;

	var containerDivRect = document.getElementById(containerDivId).getBoundingClientRect();
	var dragContentDivRect = document.getElementById(dragContentDivId).getBoundingClientRect();

	var maxScrollTop = containerDivRect.top + containerDivRect.height - dragContentDivRect.height;
	var maxScrollLeft = containerDivRect.left + containerDivRect.width - dragContentDivRect.width;

	dragContentDiv.style.left = Math.min(e.clientX, maxScrollLeft) + 'px';
	dragContentDiv.style.top = Math.min(e.clientY, maxScrollTop) + 'px';

	var dragWidth = dragSource.offsetWidth;
	var dragHeight = dragSource.offsetHeight;


	var objFound = false;

	var mouseX = e.clientX;
	var mouseY = e.clientY;

	destination = false;
	for (var no = 0; no < destinationObjArray.length; no++) {
		var left = destinationObjArray[no]['left'];
		var top = destinationObjArray[no]['top'];
		var width = destinationObjArray[no]['width'];
		var height = destinationObjArray[no]['height'];

		destinationObjArray[no]['obj'].className = 'destinationBox answerDiv';
		var subs = destinationObjArray[no]['obj'].getElementsByTagName('DIV');
		if (!objFound && subs.length == 0) {
			if (mouseX < (left / 1 + width / 1) && (mouseX + dragWidth / 1) > left && mouseY < (top / 1 + height / 1) && (mouseY + dragHeight / 1) > top) {
				destinationObjArray[no]['obj'].className = 'dragContentOver answerDiv';
				destination = destinationObjArray[no]['obj'];
				objFound = true;
			}
		}
	}

	//sourceObjectArray['obj'].className = '';

	if (!objFound) {
		var left = sourceObjectArray['left'];
		var top = sourceObjectArray['top'];
		var width = sourceObjectArray['width'];
		var height = sourceObjectArray['height'];

		if (mouseX < (left / 1 + width / 1) && (mouseX + dragWidth / 1) > left && mouseY < (top / 1 + height / 1) && (mouseY + dragHeight / 1) > top) {
			destination = sourceObjectArray['obj'];
			sourceObjectArray['obj'].className = 'dragContentOver answerDiv';
		}
	}
	return false;
}


function dragDropEnd(e, questionDivId, answerDivId) {
	console.log('Inside dragDropEnd');
	if (dragDropTimer < 10) {
		dragDropTimer = -1;
		return;
	}
	dragContentDiv.style.display = 'none';
	sourceObjectArray['obj'].style.backgroundColor = '#FFF';
	if (destination) {
		destination.appendChild(dragSource);
		destination.className = 'destinationBox answerDiv';

		// Check if position is correct, i.e. correct answer to the question

		// if (!destination.id || destination.id != answerDivId) {
		// 	var previousEl = dragSource.parentNode.previousSibling;
		// 	if (!previousEl.tagName) previousEl = previousEl.previousSibling;
		// 	var numericId = previousEl.id.replace(/[^0-9]/g, '');
		// 	var numericIdSource = dragSource.id.replace(/[^0-9]/g, '');

		// 	if (numericId == numericIdSource) {
		// 		dragSource.className = 'correctAnswer';
		// 		checkAllAnswers();
		// 	}
		// 	else
		// 		dragSource.className = 'wrongAnswer';
		// }

		if (destination.id && destination.id == answerDivId) {
			dragSource.className = 'dragDropSmallBox left-capsule-text';
		}

	} else {
		if (dragSourceNextSibling)
			dragSourceNextSibling.parentNode.insertBefore(dragSource, dragSourceNextSibling);
		else
			dragSourceParent.appendChild(dragSource);
	}
	dragDropTimer = -1;
	dragSourceNextSibling = false;
	dragSourceParent = false;
	destination = false;
}

function checkAllAnswers() {
	console.log('Inside checkAllAnswers');
	for (var no = 0; no < arrayOfEmptyBoxes.length; no++) {
		var sub = arrayOfEmptyBoxes[no].getElementsByTagName('DIV');
		if (sub.length == 0) return;

		if (sub[0].className != 'correctAnswer') {
			return;
		}

	}

	quizIsFinished();
}

function resetPositions() {
	console.log('Inside resetPositions');
	if (dragDropTimer >= 10) return;

	for (var no = 0; no < destinationObjArray.length; no++) {
		if (destinationObjArray[no]['obj']) {
			destinationObjArray[no]['left'] = getLeftPos(destinationObjArray[no]['obj'])
			destinationObjArray[no]['top'] = getTopPos(destinationObjArray[no]['obj'])
		}

	}
	sourceObjectArray['left'] = getLeftPos(answerDiv);
	sourceObjectArray['top'] = getTopPos(answerDiv);
}

/* Reset the form */
function dragDropResetForm() {
	console.log('Inside dragDropResetForm');
	for (var no = 0; no < arrayOfAnswers.length; no++) {
		arrayOfAnswers[no].className = 'dragDropSmallBox left-capsule-text'
		answerDiv.appendChild(arrayOfAnswers[no]);
	}
}