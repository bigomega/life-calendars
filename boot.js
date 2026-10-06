// ---------- boot ----------

window.addEventListener("hashchange", () => {
  const view = parseHashView();
  if (!view) return;
  if (view.tab === "spiral") {
    setActiveTab("spiral", { persist: false, skipHash: true });
    return;
  }
  setActiveTab("location", { persist: false, skipHash: true });
  scrollToMonth(view.year, view.month, { smooth: true });
});

(async function init() {
  loadSettings();
  await loadData();
  resumePendingSaveWatch();
  setupPeopleFilter();
  setupYearControls();
  setupSettingsControls();
  setupLocationCombo();
  setupStickyOffset();
  setupDragToAdd();
  setupTabs();
  setupSpiral();
  const view = parseHashView();
  if (view?.tab === "spiral" || (!view && settings.tab === "spiral")) {
    renderAll();
    setActiveTab("spiral", { persist: false, force: true });
    return;
  }
  const loc = view || defaultView();
  renderAll({ year: loc.year, month: loc.month });
})();
