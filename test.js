var lockedAfterDrag = false;	/* Lock items after they have been dragged, i.e. the user get's only one shot for the correct answer */

var dragContent = false;
var dragSource = false;
var dragDropTimer = -1;
var destinationObjArray = new Array();
var destination = false;
var dragSourceParent = false;
var dragSourceNextSibling = false;
var sourceObjectArray = new Array();

var containerDivPrefix = "dragContainer-";
var dragContentDivPrefix = "dragContent-";
var questionDivPrefix = "questionDiv-";
var answerDivPrefix = "answerDiv-";

var currentDragQuestion = null;

window.onload = function () {
	initDragDropScript("q1");
	initDragDropScript("q2");
};

function initDragDropScript(questionId) {

	var containerDivId = containerDivPrefix + questionId;
	var dragContentDivId = dragContentDivPrefix + questionId;
	var questionDivId = questionDivPrefix + questionId;
	var answerDivId = answerDivPrefix + questionId;

	console.log('Inside initDragDropScript');

	var containerDivRect = document.getElementById(containerDivId).getBoundingClientRect();

	var answerDiv = document.getElementById(answerDivId);
	answerDiv.onselectstart = cancelEvent;
	var divs = answerDiv.getElementsByTagName('div');
	var answers = new Array();

	for (var no = 0; no < divs.length; no++) {

		if (hasClass(divs[no], 'dragDropAnswerBox')) {
			divs[no].onmousedown = function (e) {
				initDragDrop(e, questionId);
			};
			answers[answers.length] = divs[no];
		}
	}

	var sourceObj = new Array();
	sourceObj['qid'] = questionId;
	sourceObj['obj'] = answerDiv;
	sourceObj['left'] = getLeftPos(answerDiv);
	sourceObj['top'] = getTopPos(answerDiv);
	sourceObj['width'] = answerDiv.offsetWidth;
	sourceObj['height'] = answerDiv.offsetHeight;
	sourceObjectArray[sourceObjectArray.length] = sourceObj;

	var questionDiv = document.getElementById(questionDivId);
	questionDiv.onselectstart = cancelEvent;
	var divs = questionDiv.getElementsByTagName('div');

	for (var no = 0; no < divs.length; no++) {
		if (hasClass(divs[no], 'destinationQuestionBox')) {
			var index = destinationObjArray.length;
			destinationObjArray[index] = new Array();
			destinationObjArray[index]['qid'] = questionId;
			destinationObjArray[index]['obj'] = divs[no];
			destinationObjArray[index]['left'] = getLeftPos(divs[no])
			destinationObjArray[index]['top'] = getTopPos(divs[no])
			destinationObjArray[index]['width'] = divs[no].offsetWidth;
			destinationObjArray[index]['height'] = divs[no].offsetHeight;
		}
	}

	var containerDiv = document.getElementById(containerDivId);
	containerDiv.onmouseup = function (e) {
		dragDropEnd(e, questionId);
	};
	containerDiv.onmousemove = function (e) {
		dragDropMove(e, questionId);
	};
}

function initDragDrop(e, questionId) {
	console.log('Inside initDragDrop');

	currentDragQuestion = questionId;
	var containerDivId = containerDivPrefix + questionId;
	var dragContentDivId = dragContentDivPrefix + questionId;

	// if (lockedAfterDrag && e.currentTarget.parentNode.parentNode.id == questionDivId)
	// 	return;

	var dragContentDiv = document.getElementById(dragContentDivId);
	var containerDiv = document.getElementById(containerDivId);

	dragContentDiv.style.left = e.clientX + containerDiv.scrollLeft + 'px';
	dragContentDiv.style.top = e.clientY + containerDiv.scrollTop + 'px';

	dragSource = e.currentTarget;
	dragSourceParent = e.currentTarget.parentNode;

	if (hasClass(dragSourceParent, "destinationQuestionBox")) {
		// restore empty div on question side
		dragSourceParent.innerHTML = `<div class='emptyQuestionBox ${questionId}'></div>`;
	}

	dragSourceNextSibling = false;
	if (e.currentTarget.nextSibling) dragSourceNextSibling = e.currentTarget.nextSibling;
	if (!dragSourceNextSibling.tagName) dragSourceNextSibling = dragSourceNextSibling.nextSibling;

	dragDropTimer = 0;
	timeoutBeforeDrag(questionId);

	return false;
}

function timeoutBeforeDrag(questionId) {

	if (dragDropTimer >= 0 && dragDropTimer < 10) {
		dragDropTimer = dragDropTimer + 1;
		setTimeout(`timeoutBeforeDrag("${questionId}")`, 10);
		return;
	}

	console.log('Inside timeoutBeforeDrag');

	if (dragDropTimer >= 10) {
		var dragContentDivId = dragContentDivPrefix + questionId;
		var dragContentDiv = document.getElementById(dragContentDivId);
		dragContentDiv.style.display = 'block';
		dragContentDiv.innerHTML = '';
		addClass(dragSource, 'dragDropAnswerBox');
		dragContentDiv.appendChild(dragSource);
	}
}

function dragDropMove(e, questionId) {
	if (dragDropTimer < 10) {
		return;
	}

	if (currentDragQuestion != questionId || !hasClass(e.target, questionId)) {
		return;
	}

	var containerDivId = containerDivPrefix + questionId;
	var dragContentDivId = dragContentDivPrefix + questionId;
	var dragContentDiv = document.getElementById(dragContentDivId);

	var containerDivRect = document.getElementById(containerDivId).getBoundingClientRect();
	var dragContentDivRect = dragContentDiv.getBoundingClientRect();

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
		if (destinationObjArray[no]['qid'] != questionId)
			continue;

		var left = destinationObjArray[no]['left'];
		var top = destinationObjArray[no]['top'];
		var width = destinationObjArray[no]['width'];
		var height = destinationObjArray[no]['height'];

		var subs = destinationObjArray[no]['obj'].getElementsByTagName('div');
		// Check if question destination is suitable for dropping answer div
		if (!objFound && subs.length == 1 && hasClass(subs[0], "emptyQuestionBox")) {
			if (mouseX < (left / 1 + width / 1) && (mouseX + dragWidth / 1) > left
				&& mouseY < (top / 1 + height / 1) && (mouseY + dragHeight / 1) > top) {

				destination = destinationObjArray[no]['obj'];
				objFound = true;
				break;
			}
		}
	}

	// if question destination is not found and mouse is moved inside answer div,
	// then user is trying to drop in answer div back. Set destination to answer div. 
	if (!objFound) {
		var sourceObj = sourceObjectArray.find(obj => obj['qid'] == questionId);
		var left = sourceObj['left'];
		var top = sourceObj['top'];
		var width = sourceObj['width'];
		var height = sourceObj['height'];

		if (mouseX < (left / 1 + width / 1) && (mouseX + dragWidth / 1) > left && mouseY < (top / 1 + height / 1)
			&& (mouseY + dragHeight / 1) > top) {

			// get an available answerOptionContainer
			var destinations = sourceObj['obj'].getElementsByClassName("answerOptionContainer");
			for (var no = 0; no < destinations.length; no++) {
				if (destinations[no].getElementsByTagName('div').length == 0) {
					destination = destinations[no];
					break;
				}
			}
		}
	}

	return false;
}

function dragDropEnd(e, questionId) {
	if (dragDropTimer < 10) {
		dragDropTimer = -1;
		return;
	}

	console.log('Inside dragDropEnd');

	var answerDivId = answerDivPrefix + questionId;
	var dragContentDivId = dragContentDivPrefix + questionId;
	var dragContentDiv = document.getElementById(dragContentDivId);

	dragContentDiv.style.display = 'none';
	if (destination) {
		console.log("destination", destination);
		if (hasClass(destination, "destinationQuestionBox")) {
			destination.innerHTML = "";
		}
		destination.appendChild(dragSource);
		//removeClass(destination, 'dragContentOver');
		//addClass(destination, 'destinationQuestionBox');
		//addClass(destination, 'answerDiv');

		// if (destination.id && destination.id == answerDivId) {
		// 	addClass(dragSource, 'dragDropAnswerBox');
		// }
	} else {
		if (dragSourceNextSibling) {
			console.log("dragSourceNextSibling", dragSourceNextSibling);
			dragSourceNextSibling.parentNode.insertBefore(dragSource, dragSourceNextSibling);
		}
		else {
			console.log("dragSourceParent", dragSourceParent);
			if (hasClass(dragSourceParent, "destinationQuestionBox")) {
				dragSourceParent.innerHTML = "";
			}
			dragSourceParent.appendChild(dragSource);
		}
	}

	dragDropTimer = -1;
	dragSourceNextSibling = false;
	dragSourceParent = false;
	destination = false;
	currentDragQuestion = null;
}

function getTopPos(inputObj) {
	console.log('Inside getTopPos');
	if (!inputObj || !inputObj.offsetTop)
		return 0;
	var returnValue = inputObj.offsetTop;
	while ((inputObj = inputObj.offsetParent) != null) returnValue += inputObj.offsetTop;
	return returnValue;
}

function getLeftPos(inputObj) {
	console.log('Inside getLeftPos');
	if (!inputObj || !inputObj.offsetLeft)
		return 0;
	var returnValue = inputObj.offsetLeft;
	while ((inputObj = inputObj.offsetParent) != null) returnValue += inputObj.offsetLeft;
	return returnValue;
}

function cancelEvent() {
	console.log('Inside cancelEvent');
	return false;
}

function hasClass(el, className) {
	if (el.classList)
		return el.classList.contains(className);
	return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
}

function addClass(el, className) {
	if (el.classList)
		el.classList.add(className)
	else if (!hasClass(el, className))
		el.className += " " + className;
}

function removeClass(el, className) {
	if (el.classList)
		el.classList.remove(className)
	else if (hasClass(el, className)) {
		var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
		el.className = el.className.replace(reg, ' ');
	}
}