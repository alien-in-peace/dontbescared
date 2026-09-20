(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var input = document.getElementById("vault-search");
    var empty = document.getElementById("vault-search-empty");
    var blocks = document.querySelectorAll(".topic-block");
    if (!input || !blocks.length) return;

    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      var visible = 0;
      blocks.forEach(function (block) {
        var match = !q || block.textContent.toLowerCase().indexOf(q) !== -1;
        block.style.display = match ? "" : "none";
        if (match) visible++;
      });
      if (empty) empty.style.display = visible === 0 ? "block" : "none";
    });
  });
})();
