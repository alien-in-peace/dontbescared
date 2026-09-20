(function () {
  "use strict";

  var allItems = [];

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderDebunk(item) {
    var answersHtml = item.answers
      .map(function (a) { return "<p>" + escapeHtml(a) + "</p>"; })
      .join("");

    return (
      '<article class="debunk-item">' +
        '<div class="debunk-q">' +
          '<span class="debunk-tag">' + escapeHtml(item.tag) + "</span>" +
          "<p>" + escapeHtml(item.question) + "</p>" +
        "</div>" +
        '<div class="debunk-a">' + answersHtml + "</div>" +
        '<div class="debunk-meta">Submitted by ' + escapeHtml(item.submittedBy || "Anonymous") +
          " &middot; " + escapeHtml(item.date) + "</div>" +
      "</article>"
    );
  }

  function applyFilter() {
    var list = document.getElementById("debunk-list");
    var status = document.getElementById("debunk-list-status");
    var input = document.getElementById("debunk-search");
    var q = input ? input.value.trim().toLowerCase() : "";

    if (!allItems.length) {
      if (status) status.textContent = "No debunks published yet — be the first to submit a claim above.";
      list.innerHTML = "";
      return;
    }

    var filtered = !q
      ? allItems
      : allItems.filter(function (item) {
          var hay = (item.tag + " " + item.question + " " + item.answers.join(" ")).toLowerCase();
          return hay.indexOf(q) !== -1;
        });

    if (!filtered.length) {
      list.innerHTML = "";
      if (status) status.textContent = 'No debunks match "' + q + '".';
      return;
    }

    if (status) status.textContent = "";
    list.innerHTML = filtered.map(renderDebunk).join("");
  }

  function loadDebunks() {
    var list = document.getElementById("debunk-list");
    var status = document.getElementById("debunk-list-status");
    var input = document.getElementById("debunk-search");
    if (!list) return;

    fetch("data/debunks.json")
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load debunks");
        return res.json();
      })
      .then(function (items) {
        items.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
        allItems = items;
        applyFilter();
        if (input) input.addEventListener("input", applyFilter);
      })
      .catch(function () {
        if (status) status.textContent = "Couldn't load the debunks backlog right now.";
      });
  }

  document.addEventListener("DOMContentLoaded", loadDebunks);
})();
