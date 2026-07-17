// draw.js: mdbook-draw canvas initializer
// mdBook injects additional-js scripts at the bottom of <body>, so the DOM
// is fully parsed by the time this runs. No event listener needed.

(function () {
  var toolbars = document.querySelectorAll(".mdbook-draw-toolbar");

  toolbars.forEach(function (toolbar) {
    var canvasId = toolbar.getAttribute("data-canvas-id");
    var canvas   = document.getElementById(canvasId);

    if (!canvas) {
      console.warn("mdbook-draw: canvas not found for id:", canvasId);
      return;
    }

    var ctx       = canvas.getContext("2d");
    var drawing   = false;
    var tool      = "pencil";
    var color     = "#000000";
    var brushSize = 4;

    // Fill canvas with background color on init
    ctx.fillStyle = canvas.getAttribute("data-background") || "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // --- Toolbar wiring ---
    toolbar.querySelectorAll("button[data-tool]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var t = btn.getAttribute("data-tool");
        if (t === "clear") {
          ctx.fillStyle = canvas.getAttribute("data-background") || "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          tool = t;
        }
      });
    });

    var colorInput = toolbar.querySelector("input[data-role='color']");
    if (colorInput) {
      colorInput.addEventListener("input", function () { color = colorInput.value; });
    }

    var sizeInput = toolbar.querySelector("input[data-role='size']");
    if (sizeInput) {
      sizeInput.addEventListener("input", function () {
        brushSize = parseInt(sizeInput.value, 10);
      });
    }

    // --- Drawing events ---
    function getPos(e) {
      var rect = canvas.getBoundingClientRect();
      var scaleX = canvas.width / rect.width;
      var scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      }
    }

    canvas.addEventListener("mousedown", function (e) {
      drawing = true;
      var pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    });

    canvas.addEventListener("mousemove", function (e) {
      if (!drawing) return;
      var pos = getPos(e);

      if (tool === "eraser") {
        ctx.strokeStyle = canvas.getAttribute("data-background") || "#ffffff";
        ctx.lineWidth   = brushSize * 3;
      } else {
        ctx.strokeStyle = color;
        ctx.lineWidth   = brushSize;
      }

      ctx.lineCap  = "round";
      ctx.lineJoin = "round";
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    });

    canvas.addEventListener("mouseup",    function () { drawing = false; });
    canvas.addEventListener("mouseleave", function () { drawing = false; });

    console.log("mdbook-draw: initialized canvas", canvasId);
  });
}());
