var lockedAfterDrag = false;	/* Lock items after they have been dragged, i.e. the user get"s only one shot for the correct answer */

var dragContent = false;
var dragSource = false;
var dragDropTimer = -1;
var destinationAnswerContainerArray = new Array();
var destination = false;
var dragSourceParent = false;
var dragSourceNextSibling = false;
var answerDivArray = new Array();
var boxWidthArray = new Array();

var containerDivPrefix = "dragContainer-";
var dragContentContainerPrefix = "dragContentContainer-";
var questionDivPrefix = "questionDiv-";
var answerDivPrefix = "answerDiv-";

var currentDragQuestion = null;

window.onload = function () {
	initDragDropScript("q1");
	initDragDropScript("q2");
};

function initDragDropScript(questionId) {

	initContainerDiv(questionId);
	initBoxWidthArray(questionId);
	initAnswerDiv(questionId);

	initAnswerDivArray(questionId);
	initDestinationAnswerContainerArray(questionId);
}

function initContainerDiv(questionId) {

	var containerDivId = containerDivPrefix + questionId;
	var containerDiv = document.getElementById(containerDivId);
	containerDiv.onmouseup = function (e) {
		dragDropEnd(questionId);
	};
	containerDiv.onmousemove = function (e) {
		dragDropMove(e, questionId);
	};
}

function initBoxWidthArray(questionId) {

	var containerDivId = containerDivPrefix + questionId;
	var containerDiv = document.getElementById(containerDivId);
	var boxes = containerDiv.getElementsByClassName("box");

	var maxWidth = 0;
	for (var no = 0; no < boxes.length; no++) {
		if (maxWidth < boxes[no].clientWidth) {
			maxWidth = boxes[no].clientWidth;
		}
	}

	var widthArray = new Array();
	widthArray["qid"] = questionId;
	widthArray["width"] = maxWidth;
	boxWidthArray[boxWidthArray.length] = widthArray;

	for (var no = 0; no < boxes.length; no++) {
		boxes[no].style.width = maxWidth + "px";
		if (hasClass(boxes[no].parentElement, "questionOptionContainer")) {
			boxes[no].parentElement.style.width = ((maxWidth * 2) + 50) + "px";
		}
	}

	containerDiv.style.width = ((maxWidth * 4) + 60) + "px";
	var numOfOptions = boxes.length / 3;
	containerDiv.style.height = ((boxes[0].clientHeight * numOfOptions) + (10 * numOfOptions)) + "px";
}

function initAnswerDiv(questionId) {

	var answerDivId = answerDivPrefix + questionId;
	var answerDiv = document.getElementById(answerDivId);
	answerDiv.onselectstart = cancelEvent;
	var divs = answerDiv.getElementsByTagName("div");
	for (var no = 0; no < divs.length; no++) {
		if (hasClass(divs[no], "dragDropAnswerBox")) {
			divs[no].onmousedown = function (e) {
				startDragDrop(e, questionId);
			};
		}
	}
}

function initAnswerDivArray(questionId) {

	var answerDivId = answerDivPrefix + questionId;
	var answerDiv = document.getElementById(answerDivId);
	var sourceObj = new Array();
	sourceObj["qid"] = questionId;
	sourceObj["obj"] = answerDiv;
	sourceObj["left"] = getLeftPos(answerDiv);
	sourceObj["top"] = getTopPos(answerDiv);
	sourceObj["width"] = answerDiv.offsetWidth;
	sourceObj["height"] = answerDiv.offsetHeight;
	answerDivArray[answerDivArray.length] = sourceObj;
}

function initDestinationAnswerContainerArray(questionId) {

	var questionDivId = questionDivPrefix + questionId;
	var questionDiv = document.getElementById(questionDivId);
	questionDiv.onselectstart = cancelEvent;
	var divs = questionDiv.getElementsByTagName("div");
	for (var no = 0; no < divs.length; no++) {
		if (hasClass(divs[no], "destinationAnswerContainer")) {
			var index = destinationAnswerContainerArray.length;
			destinationAnswerContainerArray[index] = new Array();
			destinationAnswerContainerArray[index]["qid"] = questionId;
			destinationAnswerContainerArray[index]["obj"] = divs[no];
			destinationAnswerContainerArray[index]["left"] = getLeftPos(divs[no]);
			destinationAnswerContainerArray[index]["top"] = getTopPos(divs[no]);
			destinationAnswerContainerArray[index]["width"] = divs[no].offsetWidth;
			destinationAnswerContainerArray[index]["height"] = divs[no].offsetHeight;
		}
	}
}

function startDragDrop(e, questionId) {

	if (currentDragQuestion)
		return;

	currentDragQuestion = questionId;

	var containerDivId = containerDivPrefix + questionId;
	var dragContentDivId = dragContentContainerPrefix + questionId;

	// if (lockedAfterDrag && e.currentTarget.parentNode.parentNode.id == questionDivId)
	// 	return;

	var dragContentDiv = document.getElementById(dragContentDivId);
	var containerDiv = document.getElementById(containerDivId);

	dragContentDiv.style.left = e.clientX + containerDiv.scrollLeft + "px";
	dragContentDiv.style.top = e.clientY + containerDiv.scrollTop + "px";

	dragSource = e.currentTarget;
	dragSourceParent = e.currentTarget.parentNode;

	if (hasClass(dragSourceParent, "destinationAnswerContainer")) {
		// restore empty div on question side
		dragSourceParent.innerHTML = "";
		var emptyQuestionBoxDiv = document.createElement("div");
		emptyQuestionBoxDiv.className = `emptyQuestionBox box ${questionId}`;
		emptyQuestionBoxDiv.style.width = boxWidthArray.find(boxArr => boxArr["qid"] == questionId)["width"] + "px";
		dragSourceParent.appendChild(emptyQuestionBoxDiv);
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

	if (dragDropTimer >= 10) {
		var dragContentDivId = dragContentContainerPrefix + questionId;
		var dragContentDiv = document.getElementById(dragContentDivId);
		dragContentDiv.style.display = "block";
		dragContentDiv.innerHTML = "";
		addClass(dragSource, "dragDropAnswerBox");
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
	var dragContentDivId = dragContentContainerPrefix + questionId;
	var dragContentDiv = document.getElementById(dragContentDivId);

	var containerDivRect = document.getElementById(containerDivId).getBoundingClientRect();
	var dragContentDivRect = dragContentDiv.getBoundingClientRect();

	var maxScrollTop = containerDivRect.top + containerDivRect.height - dragContentDivRect.height;
	var maxScrollLeft = containerDivRect.left + containerDivRect.width - dragContentDivRect.width;

	dragContentDiv.style.left = Math.min(e.clientX, maxScrollLeft) + "px";
	dragContentDiv.style.top = Math.min(e.clientY, maxScrollTop) + "px";

	trySetDestinationForDrop(e, questionId);

	return false;
}

function trySetDestinationForDrop(e, questionId) {

	destination = false;
	var objFound = false;

	var dragWidth = dragSource.offsetWidth;
	var dragHeight = dragSource.offsetHeight;

	var mouseX = e.clientX;
	var mouseY = e.clientY;

	for (var no = 0; no < destinationAnswerContainerArray.length; no++) {
		if (destinationAnswerContainerArray[no]["qid"] != questionId)
			continue;

		var left = destinationAnswerContainerArray[no]["left"];
		var top = destinationAnswerContainerArray[no]["top"];
		var width = destinationAnswerContainerArray[no]["width"];
		var height = destinationAnswerContainerArray[no]["height"];

		var subs = destinationAnswerContainerArray[no]["obj"].getElementsByTagName("div");
		// Check if question destination is suitable for dropping answer div
		if (!objFound && subs.length == 1 && hasClass(subs[0], "emptyQuestionBox")) {
			if (mouseX < (left / 1 + width / 1) && (mouseX + dragWidth / 1) > left
				&& mouseY < (top / 1 + height / 1) && (mouseY + dragHeight / 1) > top) {

				destination = destinationAnswerContainerArray[no]["obj"];
				objFound = true;
				break;
			}
		}
	}

	// if question destination is not found and mouse is moved inside answer div,
	// then user is trying to drop in answer div back. Set destination to answer div. 
	if (!objFound) {
		var sourceObj = answerDivArray.find(obj => obj["qid"] == questionId);
		var left = sourceObj["left"];
		var top = sourceObj["top"];
		var width = sourceObj["width"];
		var height = sourceObj["height"];

		if (mouseX < (left / 1 + width / 1) && (mouseX + dragWidth / 1) > left && mouseY < (top / 1 + height / 1)
			&& (mouseY + dragHeight / 1) > top) {

			// get an available answerOptionContainer
			var destinations = sourceObj["obj"].getElementsByClassName("answerOptionContainer");
			for (var no = 0; no < destinations.length; no++) {
				if (destinations[no].getElementsByTagName("div").length == 0) {
					destination = destinations[no];
					break;
				}
			}
		}
	}
}

function dragDropEnd(questionId) {

	if (dragDropTimer < 10) {
		dragDropTimer = -1;
		return;
	}

	var dragContentDivId = dragContentContainerPrefix + questionId;
	var dragContentDiv = document.getElementById(dragContentDivId);

	dragContentDiv.style.display = "none";
	if (destination) {
		if (hasClass(destination, "destinationAnswerContainer")) {
			destination.innerHTML = "";
		}
		destination.appendChild(dragSource);
	} else {
		if (dragSourceNextSibling) {
			dragSourceNextSibling.parentNode.insertBefore(dragSource, dragSourceNextSibling);
		}
		else {
			if (hasClass(dragSourceParent, "destinationAnswerContainer")) {
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

	if (!inputObj || !inputObj.offsetTop)
		return 0;
	var returnValue = inputObj.offsetTop;
	while ((inputObj = inputObj.offsetParent) != null) returnValue += inputObj.offsetTop;
	return returnValue;
}

function getLeftPos(inputObj) {

	if (!inputObj || !inputObj.offsetLeft)
		return 0;
	var returnValue = inputObj.offsetLeft;
	while ((inputObj = inputObj.offsetParent) != null) returnValue += inputObj.offsetLeft;
	return returnValue;
}

function cancelEvent() {
	return false;
}

function hasClass(el, className) {
	if (el.classList)
		return el.classList.contains(className);
	return !!el.className.match(new RegExp("(\\s|^)" + className + "(\\s|$)"));
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
		var reg = new RegExp("(\\s|^)" + className + "(\\s|$)");
		el.className = el.className.replace(reg, " ");
	}
}