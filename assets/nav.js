/* Site nav behaviour — drawer (mobile) + dropdown groups (desktop).
   Progressive enhancement: this file adds the `nav-js` class that switches CSS
   into drawer mode. If it never runs, the nav links wrap and stay reachable
   rather than disappearing. Dropdown links are real <a>s in the DOM either way,
   so crawlers see them with or without JS. */
(function () {
  var root = document.documentElement;
  root.classList.add('nav-js');

  document.addEventListener('DOMContentLoaded', function () {
    var header = document.querySelector('header.nav');
    if (!header) return;

    var burger = header.querySelector('.nav-burger');
    var menu = header.querySelector('.nav-links');
    var scrim = header.querySelector('.nav-scrim');
    var groups = [].slice.call(header.querySelectorAll('.nav-group'));
    var mobile = function () { return window.matchMedia('(max-width:820px)').matches; };

    function setDrawer(open) {
      if (!burger || !menu) return;
      menu.setAttribute('data-open', open);
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
      if (scrim) scrim.setAttribute('data-open', open);
      document.body.classList.toggle('nav-locked', open);
    }

    function closeGroups(except) {
      groups.forEach(function (g) {
        if (g === except) return;
        g.setAttribute('data-open', 'false');
        var t = g.querySelector('.nav-trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }

    if (burger) {
      burger.addEventListener('click', function () {
        setDrawer(menu.getAttribute('data-open') !== 'true');
      });
    }
    if (scrim) scrim.addEventListener('click', function () { setDrawer(false); });

    // Dropdowns are click-driven so touch devices above the drawer breakpoint
    // (tablets) can open them — CSS handles hover for mice and :focus-within
    // for keyboards.
    groups.forEach(function (group) {
      var trigger = group.querySelector('.nav-trigger');
      if (!trigger) return;
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        if (mobile()) return; // flattened into sections in the drawer
        var open = group.getAttribute('data-open') !== 'true';
        closeGroups(group);
        group.setAttribute('data-open', open);
        trigger.setAttribute('aria-expanded', open);
      });
    });

    document.addEventListener('click', function (e) {
      if (!header.contains(e.target)) closeGroups(null);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      closeGroups(null);
      if (menu && menu.getAttribute('data-open') === 'true') {
        setDrawer(false);
        if (burger) burger.focus();
      }
    });

    // Leaving mobile with the drawer open would strand a fixed panel and a
    // locked body on the desktop layout.
    window.addEventListener('resize', function () {
      if (!mobile() && menu && menu.getAttribute('data-open') === 'true') setDrawer(false);
    });
  });
})();
