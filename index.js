var pdfUrl = `https://pdftron.s3.amazonaws.com/downloads/pl/webviewer-demo.pdf`;

// "https://api.printnode.com/static/test/pdf/multipage.pdf";

convertPdfToImages(pdfUrl);
var pdfContainer = document.getElementById("pdfContainer");
let pointX,
	PointY,
	sectionForm,
	commentTop,
	commentLeft;

pdfContainer.addEventListener("click", function (event) {
	if (!event.target.classList[0]?.includes("overlay"))
		return;



	closeForm();
	var pdfContainer = document.getElementById("pdfContainer");
	var overlay = pdfContainer.querySelectorAll(".overlay");
	let overlyIndex;
	overlay.forEach((element, index) => {
		if ([...element.classList].includes(event.target.className.split(" ")[1])) {
			overlyIndex = index;
		}
	});

	let fullHeight = 0;
	if (overlyIndex) {
		for (let i = 1; i <= overlyIndex; i++) {
			let overlayHeight = document.querySelector(`.${"overlay-" + [i]
				}`).offsetHeight;
			fullHeight += overlayHeight;
		}
	}

	const x = event.clientX - pdfContainer.getBoundingClientRect().left - 10;
	const y = event.clientY - pdfContainer.getBoundingClientRect().top - 10 - fullHeight;
	pointX = x;
	PointY = y;
	sectionForm = event.target.classList[1];
	const bullet = document.createElement("div");
	const overly = document.querySelector(`.${event.target.classList[1]
		}`);
	bullet.className = "bullet bullet-add";
	let { width, height } = overlay[overlyIndex].getBoundingClientRect();
	let formX = 0,
		formY = 0;

	if (width - x + 150 < 500) {
		formX = 250;
	}

	if (height - y + 250 < 500) {
		formY = 250;
	}

	commentLeft = formX;
	commentTop = formY;

	bullet.style.left = x + "px";

	bullet.style.top = y + "px";
	let formTop = 22 - formY;

	let formBottom = 22 - formX;

	const htmlContent = `<div class = "container-comments add add__form--comments" style ="left:${formBottom}px;top : ${formTop}px ">
            <div>
                <div class="close action__btn" onClick="closeForm()">X</div>
                <div class="remove action__btn" onClick="save()">+
                </div>
            </div>
            <div class="over-comments"></div>
            <textarea rows="10" id="add-comment-box"></textarea>
        </div>`;

	overly?.appendChild(bullet);
	bullet.innerHTML += htmlContent;
});
const wrap = document.getElementById("wrap");
const dragImage = document.getElementById("dragImage");

let offsetX,
	offsetY;
let isDragging = false;

dragImage?.addEventListener("mousedown", (e) => {
	isDragging = true;
	offsetX = e.clientX - dragImage.getBoundingClientRect().left;
	offsetY = e.clientY - dragImage.getBoundingClientRect().top;
});

dragImage?.addEventListener("mousemove", (e) => {
	if (!isDragging)
		return;



	const x = e.clientX - offsetX - wrap.getBoundingClientRect().left;
	const y = e.clientY - offsetY - wrap.getBoundingClientRect().top;
	dragImage.style.left = x + "px";
	dragImage.style.top = y + "px";
});

dragImage?.addEventListener("mouseup", () => {
	if (isDragging) {
		isDragging = false;
		const x = parseInt(dragImage.style.left);
		const y = parseInt(dragImage.style.top);
	}
});

const printButton = document.getElementById("printButton");
printButton.addEventListener("click", captureAndAppendToPDF);

function captureAndAppendToPDF() {
	const jsPDF = window.jspdf.jsPDF;
	const container = document.getElementById("pdfContainer");
	var overlay = container.querySelectorAll(".overlay");
	const pdf = new jsPDF("p", "mm", "a4");
	function addElementToPDF(index) {
		if (index >= overlay.length) {
			pdf.save("output.pdf");
			return;
		}
		const element = overlay[index];
		html2canvas(element).then((canvas) => {
			const imgWidth = 208;
			const imgHeight = (((canvas.height + canvas.height) / 1.7) * imgWidth) / canvas.width;
			pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, imgHeight);
			if (index <= overlay.length - 2) {
				pdf.addPage();
			}
			addElementToPDF(index + 1);
		});
	}
	addElementToPDF(0);
}

const oldPoints = [
];
function addPoints() {
	var pdfContainer = document.getElementById("pdfContainer");
	var overlay = pdfContainer.querySelectorAll(".overlay");
	let overlyIndex;

	const childrenArray = Array.from(overlay);

	const elements = document.querySelectorAll(".bullet");

	// Remove each element
	elements.forEach((element) => { // Check if the element has a parent node before removing it
		if (element.parentNode) {
			element.parentNode.removeChild(element);
		}
	});

	oldPoints.forEach((element) => {
		overlay.forEach((overs, index) => {
			if ([...overs.classList].includes(element.section)) {
				overlyIndex = index;
			}
		});

		let fullHeight = 0;
		for (let i = 1; i <= overlyIndex; i++) {
			let overlayHeight = document.querySelector(`.${"overlay-" + [i]
				}`).offsetHeight;

			fullHeight += overlayHeight;
		}

		let formX = 0;
		const x = element.positionX;
		const y = element.positionY;

		const bullet = document.createElement("div");
		const overly = document.querySelector(`.${element.section
			}`);

		bullet.className = `bullet bullet-comments comments-${x}-${y}`;

		bullet.style.left = x + "px";
		bullet.style.top = y + "px";
		overly?.appendChild(bullet);
		let pointWidth = overlay[overlyIndex]?.clientWidth - bullet.offsetLeft;

		let pointHeight = overlay[overlyIndex]?.clientHeight;
		let sumPosition = pointHeight - bullet.offsetTop;
		let Position = sumPosition <= 150 ? "bottom" : "top";
		if (pointWidth < 250) {
			let minus = - pointWidth;
			formX = -250 - minus;
		}
		const htmlContent = `<div class="container-comments  view" style="left:${formX + "px"
			};${Position} : 22px ">
        <div>
        </div>
        <div class="over-comments"></div>
        <div class="comment">
			${element.comment
			}
        </div>
        </div>`;
		bullet.innerHTML += htmlContent;
	});
}
function convertPdfToImages(pdfUrl) {
	pdfjsLib.getDocument(pdfUrl).promise.then(function (pdf) {
		var numPages = pdf.numPages;
		var pdfContainer = document.getElementById("pdfContainer");
		for (let i = 1; i <= numPages; i++) {
			pdf.getPage(i).then(function (page) {
				var scale = 1.6;
				var viewport = page.getViewport({ scale: scale });
				var canvas = document.createElement("canvas");
				var context = canvas.getContext("2d");
				canvas.height = viewport.height;
				canvas.width = viewport.width;
				var renderContext = {
					canvasContext: context,
					viewport: viewport
				};
				page.render(renderContext).promise.then(function () {
					var imageDataURL = canvas.toDataURL("image/png");
					var image = new Image();
					image.src = imageDataURL;
					var divOverlay = document.createElement("div");
					divOverlay.appendChild(image);
					divOverlay.className = `overlay overlay-${i - 1
						}`;
					pdfContainer.appendChild(divOverlay);
					const children = pdfContainer.querySelectorAll(".overlay");

					const childrenArray = Array.from(children);
					childrenArray.sort((a, b) => {
						const classA = parseInt(a.className.split("-")[1]);
						const classB = parseInt(b.className.split("-")[1]);
						return classA - classB;
					});

					childrenArray.forEach((child) => {
						pdfContainer.appendChild(child);
					});

					addPoints();
				});
			});
		}
	}).catch(function (error) { });
}

function closeForm() {
	const elements = document.querySelectorAll(".bullet-add");
	if (elements.length > 0) {
		elements.forEach((element) => {
			element.remove();
		});
	}
}
function save() {
	const textAreaValue = document.getElementById('add-comment-box').value;
	if (textAreaValue) {
		oldPoints.push({ section: sectionForm, positionX: pointX, positionY: PointY, comment: textAreaValue });
		addPoints();
	}


	closeForm();
}
