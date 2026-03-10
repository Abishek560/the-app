/**
 * Language / i18n: translations and locale. Use t(key) for UI strings.
 * Module labels come from the API/data layer (getModules({ locale }) returns translated labels).
 * Load after config and locales (en.js, ta.js); call init() on app boot.
 * Profile panel language selector calls setLocale() then onLocaleChange().
 */
(function (global) {
  "use strict";

  var theApp = global.theApp || {};
  var config = theApp.config || {};

  var translations = (theApp.locales && typeof theApp.locales === "object")
    ? theApp.locales
    : {
    en: {
      appName: "The App",
      appTagline: "Car Garage",
      profile: "Profile",
      signedIn: "Signed in",
      signedInAs: "Signed in as",
      closeProfile: "Close profile",
      profilePhoto: "Profile photo",
      profilePhotoOf: "Profile photo of",
      name: "Name",
      email: "Email",
      phone: "Phone",
      appearance: "Appearance",
      theme: "Theme",
      light: "Light",
      system: "System",
      dark: "Dark",
      accent: "Accent",
      amber: "Amber",
      blue: "Blue",
      green: "Green",
      language: "Language",
      english: "English",
      tamil: "Tamil",
      add: "Add",
      showFilters: "Show filters",
      hideFilters: "Hide filters",
      toggleFilters: "Toggle filters",
      applyFilters: "Apply filters",
      showing: "Showing",
      of: "of",
      page: "Page",
      previousPage: "Previous page",
      nextPage: "Next page",
      noItems: "No items.",
      noItemsTitle: "No items yet",
      noResults: "No results.",
      noResultsTitle: "No results",
      noResultsMatchFilters: "No results match your filters.",
      loading: "Loading",
      moreModules: "More modules",
      recent: "Recent",
      filters: "Filters",
      listView: "List view",
      listViewTable: "Table",
      listViewSpreadsheet: "Spreadsheet",
      listViewTile: "Tile",
      all: "All",
      filterPlaceholder: "Filter...",
      moduleNotWired: "This module is not wired up yet.",
      addUIFor: "Add UI + data for",
      inTheController: "in the controller.",
      confirmLanguageReload: "Change language? The app will reload.",
      back: "Back",
      edit: "Edit",
      overview: "Overview",
      timeline: "Timeline",
      relatedLists: "Related list",
      notes: "Notes",
      attachments: "Attachments",
      emails: "Emails",
      openActivities: "Open Activities",
      closedActivities: "Closed Activities",
      addRelatedList: "Add Related List",
      links: "Links",
      noLinksFound: "No Links Found",
      addLink: "Add Link",
      sendEmailWiredHint: " – can be wired to compose.",
      addRelatedWiredHint: " – can be wired.",
      moreOptions: "More options",
      moreOptionsWiredHint: "More options – menu can be wired here.",
      relatedListWiredHint: " – related list can be wired.",
      hideDetails: "Hide details",
      showDetails: "Show details",
      lastUpdate: "Last Update",
      sendEmail: "Send Email",
      cancel: "Cancel",
      ok: "OK",
      error: "Error",
      save: "Save",
      saveAndNew: "Save and New",
      createEntity: "Create",
      editEntity: "Edit",
      information: "Information",
      dashboard: "Dashboard",
      settings: "Settings",
      setup: "Setup",
      organization: "Organization",
      portalDetails: "Portal details",
      module: "Module",
      modules: "Modules",
      modulesAndFields: "Modules & fields",
      selectModuleToEdit: "Select a module from the list to edit.",
      fieldsCount: "fields",
      moduleConfig: "Module configuration",
      fieldConfig: "Field configuration",
      fields: "Fields",
      portalName: "Portal name",
      version: "Version",
      baseURL: "Base URL",
      moduleId: "Module ID",
      moduleLabel: "Label",
      fieldId: "Field ID",
      fieldLabel: "Label",
      fieldType: "Type",
      typeText: "text",
      typeNumber: "number",
      typeSelect: "select",
      typeId: "id",
      typeReference: "Reference",
      linkToModule: "Link to",
      onboardingWelcome: "Welcome",
      onboardingSubtitle: "Set up your organization and profile to get started.",
      organizationDetails: "Organization details",
      yourDetails: "Your details",
      getStarted: "Get started",
      signUp: "Sign up",
      signUpSubtitle: "Enter your details to get started.",
      placeholderName: "Your name",
      placeholderEmail: "you@example.com",
      placeholderOrgName: "e.g. Acme Inc",
      orgName: "Organization name",
      setupModulesTitle: "Set up your modules",
      setupModulesSubtitle: "Add modules and their fields.",
      addModule: "Add module",
      setupModulesEmptyTitle: "No modules yet",
      setupModulesEmptyDesc: "Get started by adding a module or choosing a template from the list.",
      pickTemplate: "Pick a template",
      pickTemplateHint: "Choose from the list on the right",
      addModuleHint: "Create a custom module",
      setupAddOneModule: "Add at least one module.",
      addField: "Add field",
      finish: "Finish",
      remove: "Remove",
      setupDefineFirstModule: "Define the first module: add at least one field.",
      setupModuleNameRequired: "Please enter a name for every module.",
      setupModuleNeedsField: "Each module must have at least one field with a label.",
      moduleTemplates: "Start with",
      setupSuggestion: "Suggested for quick setup",
      addFieldFirst: "Add at least one field to the current module first",
      templateAlreadyUsed: "Already added",
      templateAlreadyAdded: "Already added",
      addSelected: "Add selected",
      addOneModule: "Add 1 module",
      addNModules: "Add N modules",
      selectAll: "Select all",
      clearSelection: "Clear",
      templatePopupInstruction: "Select one or more modules, then choose Add selected.",
      startFromScratch: "Start from scratch",
      placeholderModuleName: "Enter module name",
      moduleName: "Module name",
      populate: "Populate",
      populateAndGetStarted: "Populate and get started",
      populateAndFinish: "Populate and finish",
      populateData: "Populate data",
      custom1: "Custom 1",
      custom2: "Custom 2",
      populateTitle: "Fill form with sample data for testing",
      placeholderModuleIdExample: "e.g. parts",
      placeholderModuleLabelExample: "e.g. Parts",
      templateLeads: "Leads",
      templateContacts: "Contacts",
      templateProducts: "Products",
      templateServices: "Services",
      templateInvoice: "Invoice",
      templateTasks: "Tasks"
    },
    ta: {
      appName: "The App",
      appTagline: "கார் கேரேஜ்",
      profile: "சுயவிவரம்",
      signedIn: "உள்நுழைந்துள்ளீர்கள்",
      signedInAs: "உள்நுழைந்துள்ளீர்கள்",
      closeProfile: "சுயவிவரத்தை மூடு",
      profilePhoto: "சுயவிவர படம்",
      profilePhotoOf: "சுயவிவர படம் -",
      name: "பெயர்",
      email: "மின்னஞ்சல்",
      phone: "தொலைபேசி",
      appearance: "தோற்றம்",
      theme: "தீம்",
      light: "வெளிச்சம்",
      system: "கணினி",
      dark: "இருள்",
      accent: "அசென்ட்",
      amber: "அம்பர்",
      blue: "நீலம்",
      green: "பச்சை",
      language: "மொழி",
      english: "ஆங்கிலம்",
      tamil: "தமிழ்",
      add: "சேர்",
      showFilters: "வடிகட்டிகளைக் காட்டு",
      hideFilters: "வடிகட்டிகளை மறை",
      toggleFilters: "வடிகட்டிகளை மாற்று",
      applyFilters: "வடிகட்டிகளைப் பயன்படுத்து",
      showing: "காட்டப்படுகிறது",
      of: "/",
      page: "பக்கம்",
      previousPage: "முந்தைய பக்கம்",
      nextPage: "அடுத்த பக்கம்",
      noItems: "உருப்படிகள் இல்லை.",
      noItemsTitle: "இன்னும் உருப்படிகள் இல்லை",
      noResults: "முடிவுகள் இல்லை.",
      noResultsTitle: "முடிவுகள் இல்லை",
      noResultsMatchFilters: "உங்கள் வடிகட்டிகளுக்கு பொருந்தும் முடிவுகள் இல்லை.",
      loading: "ஏற்றுகிறது",
      moreModules: "மேலும் தொகுதிகள்",
      recent: "சமீபத்திய",
      filters: "வடிகட்டிகள்",
      listView: "பட்டியல் காட்சி",
      listViewTable: "அட்டவணை",
      listViewSpreadsheet: "ஸ்ப்ரெட்ஷீட்",
      listViewTile: "டைல்",
      all: "அனைத்தும்",
      filterPlaceholder: "வடிகட்டு...",
      moduleNotWired: "இந்த தொகுதி இன்னும் இணைக்கப்படவில்லை.",
      addUIFor: "UI மற்றும் தரவைச் சேர்க்கவும்",
      inTheController: "கட்டுப்படுத்தியில்.",
      confirmLanguageReload: "மொழியை மாற்றுவதா? பயன்பாடு மீண்டும் ஏற்றப்படும்.",
      back: "பின்செல்",
      edit: "திருத்து",
      overview: "கண்ணோட்டம்",
      timeline: "காலவரிசை",
      relatedLists: "தொடர்புடைய பட்டியல்",
      notes: "குறிப்புகள்",
      attachments: "இணைப்புகள்",
      emails: "மின்னஞ்சல்கள்",
      openActivities: "திறந்த செயல்பாடுகள்",
      closedActivities: "மூடிய செயல்பாடுகள்",
      addRelatedList: "தொடர்புடைய பட்டியலைச் சேர்",
      links: "இணைப்புகள்",
      noLinksFound: "இணைப்புகள் இல்லை",
      addLink: "இணைப்பைச் சேர்",
      sendEmailWiredHint: " – இணைக்கப்படலாம்.",
      addRelatedWiredHint: " – இணைக்கப்படலாம்.",
      moreOptions: "மேலும் விருப்பங்கள்",
      moreOptionsWiredHint: "மேலும் விருப்பங்கள் – மெனு இங்கே இணைக்கப்படலாம்.",
      relatedListWiredHint: " – தொடர்புடைய பட்டியல் இணைக்கப்படலாம்.",
      hideDetails: "விவரங்களை மறை",
      showDetails: "விவரங்களைக் காட்டு",
      lastUpdate: "கடைசி புதுப்பிப்பு",
      sendEmail: "மின்னஞ்சல் அனுப்பு",
      cancel: "ரத்து",
      ok: "சரி",
      error: "பிழை",
      save: "சேமி",
      saveAndNew: "சேமித்து புதிது",
      createEntity: "உருவாக்கு",
      editEntity: "திருத்து",
      information: "தகவல்",
      dashboard: "டாஷ்போர்டு",
      settings: "அமைப்புகள்",
      setup: "அமைப்பு",
      organization: "அமைப்பு",
      portalDetails: "போர்டல் விவரங்கள்",
      module: "தொகுதி",
      modules: "தொகுதிகள்",
      modulesAndFields: "தொகுதிகள் மற்றும் புலங்கள்",
      selectModuleToEdit: "திருத்த பட்டியலிலிருந்து ஒரு தொகுதியைத் தேர்ந்தெடுக்கவும்.",
      fieldsCount: "புலங்கள்",
      moduleConfig: "தொகுதி உள்ளமைப்பு",
      fieldConfig: "புல உள்ளமைப்பு",
      fields: "புலங்கள்",
      portalName: "போர்டல் பெயர்",
      version: "பதிப்பு",
      baseURL: "அடிப்படை URL",
      moduleId: "தொகுதி ID",
      moduleLabel: "லேபிள்",
      fieldId: "புல ID",
      fieldLabel: "லேபிள்",
      fieldType: "வகை",
      typeText: "உரை",
      typeNumber: "எண்",
      typeSelect: "தேர்வு",
      typeId: "ஐடி",
      typeReference: "குறிப்பு",
      linkToModule: "இணைக்க",
      onboardingWelcome: "வரவேற்பு",
      onboardingSubtitle: "தொடங்க உங்கள் அமைப்பு மற்றும் சுயவிவரத்தை அமைக்கவும்.",
      organizationDetails: "அமைப்பு விவரங்கள்",
      yourDetails: "உங்கள் விவரங்கள்",
      getStarted: "தொடங்குங்கள்",
      signUp: "பதிவு செய்",
      signUpSubtitle: "தொடங்க உங்கள் விவரங்களை உள்ளிடவும்.",
      placeholderName: "உங்கள் பெயர்",
      placeholderEmail: "you@example.com",
      placeholderOrgName: "எ.கா. அக்மே இன்க்",
      orgName: "அமைப்பு பெயர்",
      setupModulesTitle: "உங்கள் தொகுதிகளை அமைக்கவும்",
      setupModulesSubtitle: "தொகுதிகள் மற்றும் புலங்களைச் சேர்க்கவும்.",
      addModule: "தொகுதி சேர்",
      setupModulesEmptyTitle: "இன்னும் தொகுதிகள் இல்லை",
      setupModulesEmptyDesc: "தொகுதி சேர்ப்பதன் மூலம் அல்லது பட்டியலிலிருந்து வார்ப்பைத் தேர்ந்தெடுப்பதன் மூலம் தொடங்குங்கள்.",
      pickTemplate: "வார்ப்பைத் தேர்ந்தெடு",
      pickTemplateHint: "வலப்பக்க பட்டியலில் இருந்து தேர்ந்தெடுக்கவும்",
      addModuleHint: "தனிப்பயன் தொகுதி உருவாக்கு",
      setupAddOneModule: "குறைந்தது ஒரு தொகுதியைச் சேர்க்கவும்.",
      addField: "புலம் சேர்",
      finish: "முடிக்கவும்",
      remove: "அகற்று",
      setupDefineFirstModule: "முதல் தொகுதியை வரையறுக்கவும்: குறைந்தது ஒரு புலத்தைச் சேர்க்கவும்.",
      setupModuleNameRequired: "எல்லா தொகுதிகளுக்கும் பெயரை உள்ளிடவும்.",
      setupModuleNeedsField: "ஒவ்வொரு தொகுதியிலும் குறைந்தது ஒரு புலம் லேபிளுடன் இருக்க வேண்டும்.",
      moduleTemplates: "தொடங்கு",
      setupSuggestion: "விரைவு அமைப்புக்கு பரிந்துரைக்கப்பட்டது",
      addFieldFirst: "முதலில் தற்போதைய தொகுதிக்கு குறைந்தது ஒரு புலத்தைச் சேர்க்கவும்",
      templateAlreadyUsed: "ஏற்கனவே சேர்க்கப்பட்டது",
      templateAlreadyAdded: "ஏற்கனவே சேர்க்கப்பட்டது",
      addSelected: "தேர்ந்தெடுத்தவற்றை சேர்",
      addOneModule: "1 தொகுதியை சேர்",
      addNModules: "N தொகுதிகளை சேர்",
      selectAll: "அனைத்தையும் தேர்ந்தெடு",
      clearSelection: "அழி",
      templatePopupInstruction: "ஒன்று அல்லது அதற்கு மேற்பட்ட தொகுதிகளைத் தேர்ந்தெடுத்து, பின்னர் தேர்ந்தெடுத்தவற்றை சேர் என்பதைத் தேர்ந்தெடுக்கவும்.",
      startFromScratch: "புதிதாக தொடங்கு",
      placeholderModuleName: "தொகுதி பெயரை உள்ளிடவும்",
      moduleName: "தொகுதி பெயர்",
      populate: "நிரப்பு",
      populateAndGetStarted: "பூர்த்தி செய்து தொடங்குங்கள்",
      populateAndFinish: "பூர்த்தி செய்து முடிக்கவும்",
      populateData: "தரவை நிரப்பு",
      custom1: "தனிப்பயன் 1",
      custom2: "தனிப்பயன் 2",
      populateTitle: "சோதனைக்கு மாதிரி தரவுடன் படிவத்தை நிரப்பு",
      placeholderModuleIdExample: "எ.கா. பாகங்கள்",
      placeholderModuleLabelExample: "எ.கா. பாகங்கள்",
      templateLeads: "லீட்கள்",
      templateContacts: "தொடர்புகள்",
      templateProducts: "தயாரிப்புகள்",
      templateServices: "சேவைகள்",
      templateInvoice: "விலைப்பட்டியல்",
      templateTasks: "பணிகள்"
    }
  };

  if (!translations.en) translations.en = {};
  if (!translations.ta) translations.ta = {};

  var currentLocale = "en";
  var onLocaleChange = function () {};

  function getLocale() {
    return currentLocale;
  }

  function t(key) {
    var map = translations[currentLocale];
    if (!map || map[key] === undefined) {
      var en = translations.en;
      return (en && en[key] !== undefined) ? en[key] : key;
    }
    return map[key];
  }

  function setLocale(locale, options) {
    if (translations[locale]) {
      currentLocale = locale;
      var persist = !(options && options.persist === false);
      if (persist) {
        try {
          if (global.localStorage && config.localeStorageKey) global.localStorage.setItem(config.localeStorageKey, locale);
        } catch (e) {}
      }
      return true;
    }
    return false;
  }

  function init() {
    try {
      if (global.localStorage && config.localeStorageKey) {
        var saved = global.localStorage.getItem(config.localeStorageKey);
        if (saved && translations[saved]) {
          currentLocale = saved;
          return;
        }
      }
    } catch (e) {}
    if (config.defaultLocale && translations[config.defaultLocale]) currentLocale = config.defaultLocale;
  }

  /** Updates all elements with data-i18n="key" to the current translation. */
  function applyToDocument() {
    if (typeof document === "undefined" || !document.querySelectorAll) return;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (key) el.textContent = t(key);
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria-label");
      if (key) el.setAttribute("aria-label", t(key));
    });
    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-title");
      if (key) el.setAttribute("title", t(key));
    });
  }

  function setOnLocaleChange(fn) {
    onLocaleChange = typeof fn === "function" ? fn : function () {};
  }

  function notifyLocaleChange() {
    applyToDocument();
    onLocaleChange();
  }

  theApp.language = theApp.language || {};
  theApp.language.t = t;
  theApp.language.getLocale = getLocale;
  theApp.language.setLocale = setLocale;
  theApp.language.init = init;
  theApp.language.applyToDocument = applyToDocument;
  theApp.language.setOnLocaleChange = setOnLocaleChange;
  theApp.language.notifyLocaleChange = notifyLocaleChange;
  theApp.language.translations = translations;

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);
