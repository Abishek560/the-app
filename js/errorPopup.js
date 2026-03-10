/**
 * Error popup – custom modal to show error messages instead of native alert().
 */
(function (global) {
  "use strict";

  var theApp = global.theApp || {};

  var popupEl = null;
  var messageEl = null;
  var okBtn = null;

  function getPopup() {
    if (popupEl) return popupEl;
    popupEl = document.getElementById("error-popup");
    if (popupEl) {
      messageEl = popupEl.querySelector(".error-popup-message");
      okBtn = popupEl.querySelector(".error-popup-ok");
    }
    return popupEl;
  }

  function hide() {
    var el = getPopup();
    if (!el) return;
    el.classList.remove("error-popup--visible");
    el.setAttribute("aria-hidden", "true");
  }

  function show(message) {
    var el = getPopup();
    if (!el) return;
    if (messageEl) messageEl.textContent = message || "";
    el.classList.add("error-popup--visible");
    el.setAttribute("aria-hidden", "false");
    if (okBtn) {
      okBtn.focus();
    }
  }

  function bind() {
    var el = getPopup();
    if (!el) return;
    var backdrop = el.querySelector(".error-popup-backdrop");
    if (backdrop) {
      backdrop.addEventListener("click", hide);
    }
    if (okBtn) {
      okBtn.addEventListener("click", hide);
    }
    el.addEventListener("keydown", function (e) {
      if (e.key === "Escape") hide();
    });
  }

  theApp.errorPopup = {
    show: show,
    hide: hide,
    bind: bind
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);
