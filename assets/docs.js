/* Shared docs-layout helper for ObMob sub-pages.
   For every .doc block it builds the left "On this page" rail from the page's section
   headings, gives them slug ids, and highlights the active one on scroll (scroll-spy).
   Per-page options on the .doc element:
     data-toc-sel="<css>"  - which headings are sections (default "article h2")
   Per-heading options:
     class="no-toc"        - exclude this heading from the rail
     data-toc="Short label" - use this label in the rail instead of the heading text */
(function () {
  function slug(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "section";
  }
  document.querySelectorAll(".doc").forEach(function (doc) {
    var rail = doc.querySelector(".doc-rail nav");
    var aside = doc.querySelector(".doc-rail");
    var sel = doc.getAttribute("data-toc-sel") || "article h2";
    var hs = Array.prototype.slice.call(doc.querySelectorAll(sel)).filter(function (h) {
      return !h.classList.contains("no-toc");
    });
    if (!rail || !hs.length) { doc.classList.add("doc--norail"); if (aside) aside.remove(); return; }

    var links = [], seen = {};
    hs.forEach(function (h) {
      if (!h.id) { var base = slug(h.textContent), id = base, n = 2; while (seen[id] || document.getElementById(id)) { id = base + "-" + n++; } h.id = id; }
      seen[h.id] = true;
      var a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = h.getAttribute("data-toc") || h.textContent;
      rail.appendChild(a);
      links.push(a);
    });

    if (!("IntersectionObserver" in window)) return;
    var map = {};
    hs.forEach(function (h, i) { map[h.id] = links[i]; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (a) { a.classList.remove("active"); });
          if (map[e.target.id]) map[e.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-80px 0px -68% 0px", threshold: 0 });
    hs.forEach(function (h) { io.observe(h); });
  });
})();
