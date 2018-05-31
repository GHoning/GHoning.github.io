//Classes:
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 10;
  }

  draw(ctx, color) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
  }

  isPointWithin(x, y) {
    var dx = this.x - x;
    var dy = this.y - y;
    var r = this.radius;

    if (touchInterface) {
      r = this.radius * 5;
    }

    if((dx * dx) + (dy * dy) < r * r) {
      return true;
    } else {
      return false;
    }
  }
}

class Line {
  constructor(start_point, end_point) {
    this.start_point = start_point;
    this.end_point = end_point;
  }

  draw(ctx, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.moveTo(this.start_point.x, this.start_point.y);
    ctx.lineTo(this.end_point.x, this.end_point.y);
    ctx.stroke();
  }
}

class Circle {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
  }

  draw(ctx, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
    ctx.stroke();
  }
}

class Checkbox {
  constructor(x, y, width, height, text, color) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.checked = true;
      this.text = text;
      this.color = color;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "black";
    ctx.stroke();

    if(touchInterface) {
      ctx.font = "28px Arial";
      ctx.fillText(this.text, this.x + this.width + 5, this.y + (this.height * 0.5) + 10);
    } else {
      ctx.font = "18px Arial";
      ctx.fillText(this.text, this.x + this.width + 5, this.y + (this.height * 0.5) + 5);
    }

    if (this.checked) {
      ctx.fillStyle = this.color;

      if(touchInterface) {
        ctx.font = "56px Arial";
        ctx.fillText("\u2713", this.x, this.y + this.height);
      } else {
        ctx.font = "28px Arial";
        ctx.fillText("\u2713", this.x, this.y + this.height);
      }
    }
  }

  isPointWithin(x, y) {
    if (x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height) {
      return true;
    } else {
      return false;
    }
  }

  toggle() {
    if (this.checked) {
      this.checked = false;
    } else {
      this.checked = true;
    }
  }
}


//functions:

//Touch Events:
function touchDragStart(e) {
  if (e.target == canvas) {
    e.preventDefault();
  }

  dPoint = getTouchPos(e);

  var touch = e.touches[0];
  var mouseEvent = new MouseEvent("mousedown", {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas.dispatchEvent(mouseEvent);
}

function touchDragging(e) {
  if (e.target == canvas) {
    e.preventDefault();
  }
  var touch = e.touches[0];
  var mouseEvent = new MouseEvent("mousemove", {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas.dispatchEvent(mouseEvent);
}

function touchDragEnd(e) {
  if (e.target == canvas) {
    e.preventDefault();
  }
  var mouseEvent = new MouseEvent("mouseup", {});
  canvas.dispatchEvent(mouseEvent);
}

function getTouchPos(e) {
  return {
    x: e.touches[0].clientX,
    y: e.touches[0].clientY
  };
}

//Mouse Events:
function mouseStart(e) {
  e = mousePos(e);

  for (var p in points) {
    if(points[p].isPointWithin(e.x, e.y)) {
      drag = p;
      dPoint = e;
      canvas.style.cursor = "move";
      return;
    }
  }

  for (var c in checkboxes) {
    if(checkboxes[c].isPointWithin(e.x, e.y)) {
      checkboxes[c].toggle();
      return;
    }
  }
}

function mouseDragging(e) {
  if (drag) {
    e = mousePos(e);
    points[drag].x += e.x - dPoint.x;
    points[drag].y += e.y - dPoint.y;
    dPoint = e;
    update();
  }
}

function mouseEnd(e) {
  drag = null;
  canvas.style.cursor = "default";
  update();
}

function mousePos(event) {
  event = (event ? event : window.event);
  return {
    x: event.pageX - canvas.offsetLeft,
    y: event.pageY - canvas.offsetTop
  }
}

//Update function to clear to clear the screen and redraw the magical triangle:
function update() {
  ctx.clearRect(0, 0, canvas_width, canvas_height);

  drawHUD();

  drawTriangle();

  if (bCentroid.checked) {
    drawCentroid();
  }

  if (bCircumcenter.checked) {
    drawCircumcenter();
  }

  if (bOrthocenter.checked) {
    drawOrthocenter();
  }

  if(bEulerline.checked) {
    drawEulerLine();
  }

  drawPoints();

}

//The draw functions:
function drawPoints() {
  for (p in points) {
      points[p].draw(ctx, "grey");
  }

  ctx.fillStyle = "black";
  ctx.font = "30px Arial";

  ctx.fillText("A", A.x + 10, A.y +10);
  ctx.fillText("B", B.x + 10, B.y +10);
  ctx.fillText("C", C.x + 10, C.y +10);
}

function drawTriangle() {
  var lines = [new Line(A, B), new Line(B, C), new Line(A, C)];

  for (l in lines) {
    lines[l].draw(ctx, "grey");
  }
}

function drawCentroid() {
  D = halfPoint(A, B);
  E = halfPoint(A, C);
  F = halfPoint(B, C);
  halfPoints = [D, E, F];

  for(h in halfPoints) {
    halfPoints[h].radius = 4;
    halfPoints[h].draw(ctx, "red");
  }

  var lines = [new Line(C, D), new Line(E, B), new Line(A, F)];

  for (l in lines) {
    lines[l].draw(ctx, "red");
  }

  centroid = new Point((1/3) * (A.x + B.x + C.x), (1/3) * (A.y + B.y + C.y));
  centroid.draw(ctx, "red");
}

function drawCircumcenter() {
  D = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));

  uX = (1/D) * ((square(A.x) + square(A.y)) * (B.y - C.y) + (square(B.x) + square(B.y)) * (C.y - A.y) + (square(C.x) + square(C.y)) * (A.y - B.y));
  uY = (1/D) * ((square(A.x) + square(A.y)) * (C.x - B.x) + (square(B.x) + square(B.y)) * (A.x - C.x) + (square(C.x) + square(C.y)) * (B.x - A.x));

  circumcenter = new Point(uX, uY);
  circumcenter.draw(ctx, "green");

  radius = distanceBetweenPoints(circumcenter, A);
  circle = new Circle(circumcenter.x, circumcenter.y, radius);
  circle.draw(ctx, "green");
}

function drawOrthocenter() {
  //A to B;
  bYaY = B.y - A.y;
  bXaX = B.x - A.x;
  slopeAB = bYaY / bXaX;
  pSlopeAB = -1/slopeAB;
  solvedFormulaAB = (C.y) - (pSlopeAB * C.x);

  //B to C;
  cYbY = C.y - B.y;
  cXbX = C.x - B.x;
  slopeBC = cYbY / cXbX;
  pSlopeBC = -1/slopeBC;
  solvedFormulaBC = (A.y) - (pSlopeBC * A.x);

  //C to A
  cYaY = C.y - A.y;
  cXaX = C.x - A.x;
  slopeAC = cYaY / cXaX;
  pSlopeAC = -1/slopeAC;
  solvedFormulaAC = (B.y) - (pSlopeAC * B.x);

  //Get the cross point between the pBC and pAB by solving the equation.
  tempBC = -pSlopeBC;
  tempBCFromula = -solvedFormulaBC;

  solvedSlopes = tempBC + pSlopeAB;
  solvedFormulas = solvedFormulaAB + tempBCFromula;

  answer = solvedFormulas / solvedSlopes;
  x_unchecked = -answer;
  y_unchecked = (pSlopeBC * x_unchecked) + solvedFormulaBC;

  if(Math.round(x_unchecked) == (x_unchecked) && Math.round(y_unchecked) == (y_unchecked)){
    x = x_unchecked;
    y = y_unchecked;
  } else if (Math.round(x_unchecked) != (x_unchecked) && Math.round(y_unchecked) == (y_unchecked)) {
    x = x_unchecked.toFixed(5);
    y = y_unchecked;
  } else if (Math.round(x_unchecked) == (x_unchecked) && Math.round(y_unchecked) != (y_unchecked)) {
    x = x_unchecked;
    y = y_unchecked.toFixed(5);
  } else if(Math.round(x_unchecked) != (x_unchecked) &&  Math.round(y_unchecked) != (y_unchecked)) {
    x = x_unchecked.toFixed(5);
    y = y_unchecked.toFixed(5);
  }

  orthocenter = new Point(x, y);
  orthocenter.draw(ctx, "blue");

  orthoLine1 = new Line(A, orthocenter);
  orthoLine1.draw(ctx, "blue");
  orthoLine2 = new Line(B, orthocenter);
  orthoLine2.draw(ctx, "blue");
  orthoLine3 = new Line(C, orthocenter);
  orthoLine3.draw(ctx, "blue");
}

function drawEulerLine() {
  l = new Line(orthocenter, circumcenter);
  l.draw(ctx, "yellow");
}

//TODO build a check to not draw the eulerline if any of the others are unchecked.
function drawHUD() {
  if (!bCentroid.checked || !bCircumcenter.checked || !bOrthocenter.checked) {
    bEulerline.checked = false;
  }

  for (c in checkboxes) {
    checkboxes[c].draw(ctx);
  }
}

//Utility functions:
function halfPoint(p1, p2) {
  x_dif = p1.x - p2.x;
  y_dif = p1.y - p2.y;

  return new Point(p1.x - x_dif/2, p1.y - y_dif/2);
}

function square(number) {
  return number * number;
}

function distanceBetweenPoints(p1 , p2) {
  x_dif = p1.x - p2.x;
  y_dif = p1.y - p2.y;

  return Math.sqrt(square(x_dif) + square(y_dif));
}


//Start here
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
var canvas_width = 960;
var canvas_height = 640;

canvas.width = canvas_width;
canvas.height = canvas_height;
document.body.appendChild(canvas);

var touchInterface = false;

var drag;
var dPoint;

var A = new Point(600, 50);
var B = new Point(150,590);
var C = new Point(810,600);

var points = [A, B, C];

if (typeof window.ontouchstart !== 'undefined') {
  touchInterface = true;
}

var bCentroid = new Checkbox(20, 20, 15, 15, "Centroid", "red");
var bOrthocenter = new Checkbox(20, 40, 15, 15, "Orthocenter", "blue");
var bCircumcenter = new Checkbox(20, 60, 15, 15, "Circumcenter", "green");
var bEulerline = new Checkbox(20, 80, 15, 15, "Euler Line", "yellow");

//Touch event handlers
if (touchInterface) {
  bCentroid = new Checkbox(20, 20, 30, 30, "Centroid", "red");
  bOrthocenter = new Checkbox(20, 60, 30, 30, "Orthocenter", "blue");
  bCircumcenter = new Checkbox(20, 100, 30, 30, "Circumcenter", "green");
  bEulerline = new Checkbox(20, 140, 30, 30, "Euler Line", "yellow");
}

var checkboxes = [bCentroid, bOrthocenter, bCircumcenter, bEulerline];

//Mouse event handlers
canvas.onmousedown = mouseStart;
canvas.onmousemove = mouseDragging;
canvas.onmouseup = canvas.onmouseout = mouseEnd;

if (touchInterface) {
  canvas.ontouchstart = touchDragStart;
  canvas.ontouchmove = touchDragging;
  canvas.ontouchend = canvas.touchcancel = touchDragEnd;
}

update();
