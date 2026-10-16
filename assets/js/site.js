/* 淳月 · 夜行 — 交互
   转场：左侧视频轨道完整播放，右侧内容逐条显现（由 <head> 内联脚本在首帧前进入 staging 状态） */
(function () {
  "use strict";

  var doc = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var stage = document.getElementById("stage");
  var stageVideo = stage ? stage.querySelector(".stage-video") : null;
  var FLAG = "cy-stage";

  function clearFlag() {
    try { sessionStorage.removeItem(FLAG); } catch (e) {}
  }

  /* ---------- 点击内链：标记后跳转，目标页首帧即进入转场 ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a[data-nav]") : null;
    if (!a) return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#") return;
    if (/^(https?:)?\/\//i.test(href) || a.target === "_blank") return;
    if (a.getAttribute("aria-current") === "page") { e.preventDefault(); return; }
    e.preventDefault();
    try { sessionStorage.setItem(FLAG, "1"); } catch (err) {}
    window.location.href = href;
  });

  /* ---------- 内容显现 ---------- */
  function stagger(nodes, base) {
    Array.prototype.forEach.call(nodes, function (n, i) {
      window.setTimeout(function () { n.classList.add("in"); }, base + Math.min(i * 85, 900));
    });
  }

  function scrollReveal() {
    var nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) return;
    if (!("IntersectionObserver" in window) || reduce) {
      Array.prototype.forEach.call(nodes, function (n) { n.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    Array.prototype.forEach.call(nodes, function (n) { io.observe(n); });
  }

  /* ---------- 顶栏滚动态 ---------- */
  function scrollState() {
    var on = window.scrollY > 24;
    doc.classList.toggle("is-scrolled", on);
  }
  window.addEventListener("scroll", scrollState, { passive: true });
  scrollState();

  /* ---------- 左侧视频轨道 ---------- */
  function runStage() {
    var nodes = document.querySelectorAll(".reveal");
    var finished = false;

    if (stageVideo) {
      try { stageVideo.currentTime = 0; } catch (e) {}
      var p = stageVideo.play();
      if (p && typeof p.catch === "function") p.catch(function () {});
    }

    stagger(nodes, 320);

    function finish() {
      if (finished) return;
      finished = true;
      clearFlag();
      doc.classList.remove("stage-on");
      doc.classList.add("stage-off");
      window.setTimeout(function () { doc.classList.remove("stage-off"); }, 900);
    }

    if (stageVideo) {
      stageVideo.addEventListener("ended", finish);
      stageVideo.addEventListener("error", function () { window.setTimeout(finish, 500); });
      window.setTimeout(finish, 7000);
    } else {
      window.setTimeout(finish, 1400);
    }
  }

  function boot() {
    if (doc.classList.contains("stage-on") && stage && !reduce) {
      runStage();
    } else {
      doc.classList.remove("stage-on");
      clearFlag();
      scrollReveal();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
