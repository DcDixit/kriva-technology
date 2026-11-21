/* Content-dependent blocks. Empty data renders nothing.
   Source of truth for the live site: /content/features.json */
(function (factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (typeof document !== "undefined") api.boot();
})(function () {
  "use strict";

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function text(value) {
    return String(value == null ? "" : value).replace(/\s+/g, " ").trim();
  }

  function words(value) {
    var t = text(value);
    return t ? t.split(" ").length : 0;
  }

  function httpUrl(value) {
    return /^https:\/\/[^\s]+$/i.test(text(value));
  }

  function assetUrl(value) {
    var v = text(value);
    return httpUrl(v) || /^\/[^\s]+$/.test(v);
  }

  function renderScheduler(url) {
    if (!httpUrl(url)) return "";
    return (
      '<div class="kriva-sched">' +
      '<div class="kriva-sched-frame">' +
      '<iframe title="Book a fit call" loading="lazy" data-src="' + esc(text(url)) + '" referrerpolicy="no-referrer-when-downgrade"></iframe>' +
      "</div></div>" +
      '<p class="kriva-sched-fallback">Prefer to send details?</p>'
    );
  }

  function usableFounders(list) {
    return (Array.isArray(list) ? list : []).filter(function (person) {
      return person && text(person.name) && text(person.role);
    });
  }

  function renderFounders(list) {
    var people = usableFounders(list);
    if (!people.length) return "";
    var cards = people.map(function (person) {
      var bio = text(person.bio);
      var bioHtml = bio && words(bio) <= 60 ? '<p class="bio">' + esc(bio) + "</p>" : "";
      var prev = text(person.previous_work);
      var prevHtml = prev ? '<p class="prev">' + esc(prev) + "</p>" : "";
      var photo = assetUrl(person.photo)
        ? '<img src="' + esc(text(person.photo)) + '" alt="" width="72" height="72" loading="lazy" decoding="async">'
        : "";
      var linkedin = httpUrl(person.linkedin)
        ? '<p><a href="' + esc(text(person.linkedin)) + '" rel="noopener noreferrer">LinkedIn</a></p>'
        : "";
      return (
        '<li class="kriva-founder">' + photo +
        "<h3>" + esc(text(person.name)) + "</h3>" +
        '<p class="role">' + esc(text(person.role)) + "</p>" +
        bioHtml + prevHtml + linkedin +
        "</li>"
      );
    }).join("");
    return (
      '<section class="svx-sec kriva-founders" id="founders" aria-labelledby="foundersH">' +
      '<div class="wrap"><p class="svx-kicker eyebrow">Founders</p>' +
      '<h2 id="foundersH">The people behind the studio.</h2>' +
      "<ul>" + cards + "</ul></div></section>"
    );
  }

  function usableQuotes(list) {
    return (Array.isArray(list) ? list : []).filter(function (item) {
      return item && text(item.quote) && text(item.name);
    });
  }

  function quotesFor(list, path) {
    var quotes = usableQuotes(list);
    if (path === "/" || path === "") return quotes;
    return quotes.filter(function (item) {
      var pages = Array.isArray(item.solutions) ? item.solutions : [];
      return pages.some(function (p) { return text(p) === path; });
    });
  }

  function renderTestimonials(list) {
    if (!list || !list.length) return "";
    var cards = list.map(function (item) {
      var logo = assetUrl(item.company_logo)
        ? '<img src="' + esc(text(item.company_logo)) + '" alt="' + esc(text(item.company) || "Company") + ' logo" height="28" loading="lazy" decoding="async">'
        : "";
      var who = [text(item.name), text(item.role), text(item.company)].filter(Boolean).join(", ");
      var metric = text(item.metric) ? "<b>" + esc(text(item.metric)) + "</b>" : "";
      return (
        '<li><figure class="kriva-quote"><blockquote>' + esc(text(item.quote)) + "</blockquote>" +
        "<figcaption>" + logo + "<span>" + esc(who) + "</span>" + metric + "</figcaption></figure></li>"
      );
    }).join("");
    return '<section class="kriva-quotes" aria-label="What clients have said"><div class="wrap"><ul>' + cards + "</ul></div></section>";
  }

  function outcomeFor(list, path) {
    var rows = Array.isArray(list) ? list : [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      if (!row || text(row.path) !== path) continue;
      if (text(row.outcome_metric) && text(row.outcome_label)) return row;
    }
    return null;
  }

  function renderOutcome(row) {
    if (!row) return "";
    return (
      '<p class="kriva-outcome"><b>' + esc(text(row.outcome_metric)) + "</b><span>" +
      esc(text(row.outcome_label)) + "</span></p>"
    );
  }

  var OUTCOME_DISCLAIMER = /(?:[;,]?\s*(?:and\s+)?(?:we\s+)?(?:do not publish|don't publish|no) outcome figures[^.]*\.|outcome figures are not published[^.]*\.|measured outcome metrics are not published[^.]*\.)/gi;

  function withoutOutcomeDisclaimer(value) {
    return text(String(value || "").replace(OUTCOME_DISCLAIMER, " "));
  }

  function renderBadges(list) {
    var rows = (Array.isArray(list) ? list : []).filter(function (badge) {
      return badge && text(badge.name) && assetUrl(badge.image) && (httpUrl(badge.url) || /^\/[^\s]+$/.test(text(badge.url)));
    });
    if (!rows.length) return "";
    var items = rows.map(function (badge) {
      return (
        '<li><a href="' + esc(text(badge.url)) + '" rel="noopener noreferrer">' +
        '<img src="' + esc(text(badge.image)) + '" alt="' + esc(text(badge.name)) + '" height="28" loading="lazy" decoding="async">' +
        "</a></li>"
      );
    }).join("");
    return '<ul class="kriva-badges" aria-label="Partner badges">' + items + "</ul>";
  }

  function renderLeadMagnet(data, path) {
    data = data || {};
    var page = text(data.page) || "/insights/build-vs-buy-tms";
    if (path !== page || !assetUrl(data.pdf)) return "";
    var title = text(data.title) || "Get the comparison";
    return (
      '<form class="kriva-magnet" id="leadMagnet" novalidate>' +
      "<h2>" + esc(title) + "</h2>" +
      "<p>Work email only. We will show the download here after it is accepted.</p>" +
      '<div class="hp" aria-hidden="true"><label>Website<input type="text" name="website_hp" tabindex="-1" autocomplete="off"></label></div>' +
      '<label for="lead-email">Work email</label>' +
      '<input id="lead-email" name="email" type="email" autocomplete="email" inputmode="email" required>' +
      '<p class="err" hidden></p>' +
      '<button type="submit" class="btn"><span>Email me the download</span></button>' +
      '<p class="kriva-magnet-file" hidden data-file="' + esc(text(data.pdf)) + '"><a>Download the file</a></p>' +
      "</form>"
    );
  }

  return {
    esc: esc,
    renderScheduler: renderScheduler,
    renderFounders: renderFounders,
    quotesFor: quotesFor,
    renderTestimonials: renderTestimonials,
    outcomeFor: outcomeFor,
    renderOutcome: renderOutcome,
    withoutOutcomeDisclaimer: withoutOutcomeDisclaimer,
    renderBadges: renderBadges,
    renderLeadMagnet: renderLeadMagnet,
    boot: boot
  };

  function boot() {
    if (window.__KRIVA_FEATURES__) return;
    window.__KRIVA_FEATURES__ = true;
    window.KrivaFeatures = {
      renderScheduler: renderScheduler,
      renderFounders: renderFounders,
      quotesFor: quotesFor,
      renderTestimonials: renderTestimonials,
      outcomeFor: outcomeFor,
      renderOutcome: renderOutcome,
      withoutOutcomeDisclaimer: withoutOutcomeDisclaimer,
      renderBadges: renderBadges,
      renderLeadMagnet: renderLeadMagnet
    };
    var path = location.pathname.replace(/\/$/, "") || "/";
    fetch("/content/features.json", { credentials: "same-origin", cache: "no-store" })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) { if (data) paint(data, path); })
      .catch(function () {});
  }

  function ensureCss() {
    if (document.querySelector('link[href="/shared/features.css"]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/shared/features.css";
    document.head.appendChild(link);
  }

  function paint(data, path) {
    var scheduler = renderScheduler(data.schedulerUrl);
    var founders = renderFounders(data.founders);
    var quotes = renderTestimonials(quotesFor(data.testimonials, path));
    var outcome = renderOutcome(outcomeFor(data.caseOutcomes, path));
    var badges = renderBadges(data.badges);
    var magnet = renderLeadMagnet(data.leadMagnet, path);
    if (!scheduler && !founders && !quotes && !outcome && !badges && !magnet) return;
    ensureCss();
    if (scheduler) mountScheduler(scheduler);
    if (founders) {
      mountFounders(founders);
      linkNineYears();
    }
    if (quotes) mountQuotes(quotes);
    if (outcome) mountOutcome(outcome);
    if (badges) mountBadges(badges, path);
    if (magnet) mountMagnet(magnet);
  }

  function mountScheduler(html) {
    var form = document.getElementById("fitForm");
    if (!form || document.querySelector(".kriva-sched")) return;
    form.insertAdjacentHTML("beforebegin", html);
    var frame = document.querySelector(".kriva-sched iframe");
    if (!frame) return;
    var load = function () {
      if (!frame.getAttribute("src")) frame.src = frame.getAttribute("data-src");
    };
    if (!("IntersectionObserver" in window)) { load(); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (entry) { return entry.isIntersecting; })) {
        load();
        io.disconnect();
      }
    }, { rootMargin: "240px" });
    io.observe(frame);
  }

  function mountFounders(html) {
    var glance = document.getElementById("glanceH");
    var section = glance && glance.closest("section");
    if (!section || document.getElementById("founders")) return;
    section.insertAdjacentHTML("afterend", html);
    linkNineYears();
  }

  function linkNineYears() {
    var href = (location.pathname.replace(/\/$/, "") || "/") === "/about" ? "#founders" : "/about#founders";
    var root = document.body;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      if (!/nine years/i.test(node.nodeValue)) return;
      var parent = node.parentElement;
      if (!parent || parent.closest("#founders, a, script, style")) return;
      var holder = document.createElement("span");
      holder.innerHTML = node.nodeValue.replace(/([Nn]ine years)/, '<a href="' + href + '">$1</a>');
      node.parentNode.replaceChild(holder, node);
    });
  }

  function mountQuotes(html) {
    if (document.querySelector(".kriva-quotes")) return;
    var clients = document.getElementById("clients");
    if (clients) {
      clients.insertAdjacentHTML("afterend", html);
      return;
    }
    var hero = document.querySelector("main header.sx-hero, main header");
    if (hero) hero.insertAdjacentHTML("afterend", html);
  }

  function mountOutcome(html) {
    var hero = document.querySelector("main header");
    if (!hero || document.querySelector(".kriva-outcome")) return;
    hero.insertAdjacentHTML("beforeend", html);
    document.querySelectorAll("main p, main li, main dd").forEach(function (el) {
      if (!/outcome figures|outcome metrics/i.test(el.textContent)) return;
      if (!apiWithout(el.textContent)) { el.remove(); return; }
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      var nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(function (node) {
        node.nodeValue = node.nodeValue.replace(OUTCOME_DISCLAIMER, "");
        if (node.nodeValue && !/[.!?]\s*$/.test(node.nodeValue) && node.nextSibling && node.nextSibling.nodeType === 1) {
          node.nodeValue = node.nodeValue.replace(/\s+$/, "") + ". ";
        }
      });
    });
  }

  function apiWithout(value) {
    var next = withoutOutcomeDisclaimer(value);
    return next.length < 24 ? "" : next;
  }

  function mountBadges(html, path) {
    if (path === "/solutions/accounting-integrations") {
      var hero = document.querySelector("main header");
      if (hero && !hero.querySelector(".kriva-badges")) hero.insertAdjacentHTML("beforeend", html);
    }
    var social = document.querySelector("footer .fsocial");
    if (social && !social.parentNode.querySelector(".kriva-badges")) {
      social.insertAdjacentHTML("afterend", html);
    }
  }

  function mountMagnet(html) {
    var article = document.querySelector("article");
    if (!article || document.getElementById("leadMagnet")) return;
    var end = article.querySelector(".art-end");
    if (end) end.insertAdjacentHTML("afterend", html);
    else article.insertAdjacentHTML("beforeend", html);
    var form = document.getElementById("leadMagnet");
    form.addEventListener("submit", onMagnet);
  }

  function onMagnet(event) {
    event.preventDefault();
    var form = event.currentTarget;
    var err = form.querySelector(".err");
    var email = (form.email.value || "").trim();
    err.hidden = true;
    if (form.website_hp && form.website_hp.value) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      err.textContent = "Add a valid work email.";
      err.hidden = false;
      return;
    }
    var button = form.querySelector("button");
    button.disabled = true;
    fetch("/api/inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inquiry_type: "lead_magnet",
        email: email,
        page: location.pathname,
        details: "Requested the download on " + location.pathname
      })
    }).then(function (res) { return res.json().then(function (body) { return { ok: res.ok && body && body.ok, body: body }; }); })
      .then(function (result) {
        if (!result.ok) throw new Error((result.body && result.body.error) || "Please try again.");
        var file = form.querySelector(".kriva-magnet-file");
        file.querySelector("a").href = file.getAttribute("data-file");
        file.hidden = false;
        button.hidden = true;
        form.querySelector("label").hidden = true;
        form.email.hidden = true;
        window.dispatchEvent(new CustomEvent("kriva:lead", {
          detail: { type: "lead_magnet", form_id: "leadMagnet", form_name: "lead_magnet" }
        }));
      })
      .catch(function (error) {
        err.textContent = error.message || "Please try again.";
        err.hidden = false;
        button.disabled = false;
      });
  }
});
