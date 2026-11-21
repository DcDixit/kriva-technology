(function () {
  var modified = null;
  var scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (var i = 0; i < scripts.length; i++) {
    try {
      var data = JSON.parse(scripts[i].textContent);
      var list = data["@graph"] || [data];
      for (var j = 0; j < list.length; j++) {
        if (list[j] && list[j].dateModified) modified = list[j].dateModified;
      }
    } catch (e) {}
  }
  if (!modified) return;
  var parts = String(modified).slice(0, 10).split("-");
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var month = months[Number(parts[1]) - 1];
  if (!month || !parts[0]) return;
  var label = "Updated " + month + " " + parts[0];
  var nodes = document.querySelectorAll("[data-updated]");
  for (var k = 0; k < nodes.length; k++) nodes[k].textContent = label;
})();
