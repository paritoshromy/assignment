const imageTypeCheck = "([a-zA-Z0-9\s_\\.\-:])+(.jpg|.png|.gif|.svg|.tif|.tiff|.webp|.bmp)$";
const pointSize = 5;
const tolerance = 2;
const pointColor = "#ff2626"; // Red color

document.getElementById('fileUpload').onchange = function () {

    let regex = new RegExp(imageTypeCheck);
    if (regex.test(fileUpload.value.toLowerCase())) {

        if (this.files && this.files[0]) {

            let image = document.getElementById("uploadedImage");
            image.src = URL.createObjectURL(this.files[0]);;
            image.alt = this.files[0].name;
            image.type = this.files[0].type;
            image.onload = function () {
                displayDetails(this);
            };
            image.onerror = function (event) {
                alert("File could not be read! Error message - " + event.target.error.code);
            };

        }
        else {
            alert("The browser does not support file upload.");
            return false;
        }
    }
    else {
        alert("Please select a valid Image file.");
        return false;
    }
}

function displayDetails(uploadImage) {
    document.getElementById("details").style.display = "block";
    document.getElementById("imageName").textContent = uploadImage.alt;
    document.getElementById("dimension").textContent = uploadImage.height + " x " + uploadImage.width;
    document.getElementById("mimeType").textContent = uploadImage.type;

    renderToCanvas(uploadImage.height, uploadImage.width);
    document.getElementById("tagImage").style.display = "block";

    //Clean old table for new image upload.
    let tagsTable = document.getElementById("imageTags");
    while (tagsTable.rows.length > 1) {
        tagsTable.deleteRow(1);
    };
};

function renderToCanvas(height, width) {
    let canvas = document.getElementById("uploadCanvas");
    let ctx = canvas.getContext("2d");
    let canvasImage = document.getElementById("uploadedImage");


    let canvasStyle = getComputedStyle(canvas);
    // Get it's current width, minus the px at the end
    let canvasWidth = canvasStyle.width.replace("px", "");

    let imageRatio = width / height;
    let canvasHeight = canvasWidth / imageRatio;

    // Set the canvas' height in the style tag to be correct
    canvas.style.height = canvasHeight + "px";

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.drawImage(canvasImage, 0, 0, canvasWidth, canvasHeight);
};

var canvasElement = document.getElementById('uploadCanvas');
var popupForm = document.getElementById('popupForm');
var xPosition, yPosition;
var shapes = [];

canvasElement.addEventListener('click', function (e) {
    popupForm.style.left = e.pageX + 'px';
    popupForm.style.top = e.pageY + 'px';
    popupForm.style.display = "block";
    getPosition(e);
});

function submitForm() {
    let description = document.getElementById('description');
    let errorMessage = document.getElementById('errorMessage');
    if (description.value === '') {
        errorMessage.style.display = "block";
        return false;
    }
    drawCoordinates(xPosition, yPosition);
    addNewListElement(xPosition, yPosition, description.value);

    let markerCircle = {
        name: description.value,
        x: xPosition,
        y: yPosition,
    };
    shapes.push(markerCircle);

    //Cleanup
    description.value = '';
    errorMessage.style.display = "none";
    closeForm();

}

function closeForm() {
    //form input can be cleared if needed
    popupForm.style.display = "none";
}

function getPosition(event) {
    let rect = canvasElement.getBoundingClientRect();
    //Decimals precision can be changed based on need.
    xPosition = parseInt(event.clientX - rect.left);
    yPosition = parseInt(event.clientY - rect.top);
}

function drawCoordinates(x, y) {
    let ctx = canvasElement.getContext("2d");

    ctx.fillStyle = pointColor
    ctx.beginPath();
    ctx.arc(x, y, pointSize, 0, Math.PI * 2, true);
    ctx.fill();
}

function addNewListElement(x, y, description) {

    let tr = document.createElement("tr");

    let tdX = document.createElement("td");
    let xPosition = document.createTextNode(x);

    let tdY = document.createElement("td");
    let yPosition = document.createTextNode(y);

    let tdDesc = document.createElement("td")
    let desc = document.createTextNode(description);

    tdX.appendChild(xPosition);
    tdY.appendChild(yPosition);
    tdDesc.appendChild(desc);

    tr.appendChild(tdDesc)
        .insertAdjacentElement('beforebegin', tdY)
        .insertAdjacentElement('beforebegin', tdX)

    document.getElementById("imageTags").appendChild(tr);
}

canvasElement.addEventListener('mousemove', function (e) {

    e.preventDefault();
    e.stopPropagation();

    let rect = canvasElement.getBoundingClientRect();
    mouseX = parseInt(e.clientX - rect.left);
    mouseY = parseInt(e.clientY - rect.top);

    var pointName = '';
    for (var i = 0; i < shapes.length; i++) {
        var s = shapes[i];
        let tooltip = document.getElementById('tooltip');
        if (Math.abs(s.x - mouseX) <= tolerance && Math.abs(s.y - mouseY) <= tolerance) {
            pointName = s.name;
            tooltip.style.left = e.clientX + 'px';
            tooltip.style.top = e.clientY + 'px';
            tooltip.innerText = pointName;
            tooltip.style.display = "block";
            break;
        }
        else {
            tooltip.style.display = "none";
        }
    }
});