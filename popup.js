/**
 * AllTime — popup.js
 * Features: live clocks, local time card, 12/24h toggle,
 * inline time editing, DST-safe, fully offline.
 */

"use strict";

/* ═══════════════════════════════════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════════════════════════════════ */
const state = {
    selectedIds: [],       // ordered list of country IDs on dashboard
    baseId: null,          // first country used for diff calculation
    theme: "dark",         // "dark" | "light"
    hourFormat: "24",      // "12" | "24"
    simulatedOffset: null, // ms UTC when simulation started (null = live)
    simulatedFrom: null,   // real Date.now() when simulation was set
};

/* ═══════════════════════════════════════════════════════════════════════════
   LOCAL TIMEZONE (auto-detected from system)
   ═══════════════════════════════════════════════════════════════════════════ */
const LOCAL_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

/** Maps deprecated/legacy IANA timezone aliases to their modern equivalents */
const TZ_ALIASES = {
    "Asia/Calcutta": "Asia/Kolkata",
    "Asia/Rangoon": "Asia/Yangon",
    "Asia/Katmandu": "Asia/Kathmandu",
    "Asia/Ulaanbaatar": "Asia/Ulaanbaatar",
    "America/Buenos_Aires": "America/Argentina/Buenos_Aires",
    "America/Catamarca": "America/Argentina/Catamarca",
    "Pacific/Ponape": "Pacific/Pohnpei",
    "Europe/Kiev": "Europe/Kyiv",
};

/** Returns the canonical (modern) timezone string for LOCAL_TZ */
function canonicalTz(tz) { return TZ_ALIASES[tz] || tz; }

/** Built after COUNTRIES is available — matches system timezone to a real country */
function buildLocalCountry() {
    if (typeof COUNTRIES === "undefined") {
        return {
            id: "__local__", label: LOCAL_TZ.split("/").pop().replace(/_/g, " "),
            city: LOCAL_TZ.split("/").pop().replace(/_/g, " "), timezone: LOCAL_TZ, flag: "📍"
        };
    }
    // Try exact match first, then try after resolving deprecated alias
    const canon = canonicalTz(LOCAL_TZ);
    const match = COUNTRIES.find(c => c.timezone === LOCAL_TZ || c.timezone === canon);
    if (match) {
        return {
            id: "__local__",
            realId: match.id, // Store real code (e.g., "in")
            label: match.label,
            city: match.city,
            timezone: LOCAL_TZ,
            flag: match.flag,
        };
    }
    // Last resort: derive readable label from timezone string
    const city = LOCAL_TZ.split("/").pop().replace(/_/g, " ");
    return { id: "__local__", realId: "??", label: city, city, timezone: LOCAL_TZ, flag: "📍" };
}

let LOCAL_COUNTRY = buildLocalCountry();

/* ═══════════════════════════════════════════════════════════════════════════
   DOM REFS
   ═══════════════════════════════════════════════════════════════════════════ */
const $ = id => document.getElementById(id);

const DOM = {
    clockGrid: $("clock-grid"),
    searchInput: $("country-search"),
    searchClear: $("search-clear"),
    dropdown: $("dropdown"),
    btnHourFormat: $("btn-hour-format"),
    hourFormatLabel: $("hour-format-label"),
    btnTheme: $("btn-theme"),
    iconDark: $("icon-dark"),
    iconLight: $("icon-light"),
    toast: $("toast"),
};

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════════════════════ */

function getNow() {
    if (state.simulatedOffset !== null && state.simulatedFrom !== null) {
        return state.simulatedOffset + (Date.now() - state.simulatedFrom);
    }
    return Date.now();
}

function getCountry(id) {
    if (id === "__local__") return LOCAL_COUNTRY;
    return COUNTRIES.find(c => c.id === id) || null;
}

/** Format time parts for a timezone, honouring hourFormat state */
function getTimeParts(utcMs, timezone) {
    const is12 = state.hourFormat === "12";
    const date = new Date(utcMs);

    const timeFmt = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: is12,
    });
    const dateFmt = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        weekday: "short", month: "short", day: "numeric",
    });
    const tzFmt = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone, timeZoneName: "short",
    });

    const tp = timeFmt.formatToParts(date);
    const get = type => tp.find(p => p.type === type)?.value || "00";
    const ampm = is12 ? (tp.find(p => p.type === "dayPeriod")?.value || "") : "";

    return {
        h: get("hour"), m: get("minute"), s: get("second"),
        ampm,
        dateStr: dateFmt.format(date),
        tzAbbr: tzFmt.formatToParts(date).find(p => p.type === "timeZoneName")?.value || "",
    };
}

/** DST-safe UTC offset in minutes for a timezone at a given UTC ms */
function getUtcOffsetMinutes(timezone, utcMs) {
    const utcDate = new Date(utcMs);
    const localFmt = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: false,
    });
    const parts = localFmt.formatToParts(utcDate);
    const get = type => parseInt(parts.find(p => p.type === type)?.value || "0", 10);
    const localDate = new Date(
        Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"))
    );
    return Math.round((localDate - utcDate) / 60000);
}

function formatOffset(offsetMin) {
    offsetMin = Math.round(offsetMin);
    const abs = Math.abs(offsetMin);
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    const sign = offsetMin >= 0 ? "+" : "−";
    return m === 0 ? `${sign}${h}h` : `${sign}${h}h ${m}m`;
}

/** Returns day/night emoji for a timezone */
function getDayPart(timezone, utcMs) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone, hour: "numeric", hour12: false,
    }).formatToParts(new Date(utcMs));
    const hour = parseInt(parts.find(p => p.type === "hour")?.value || "0", 10);
    return hour >= 6 && hour < 18
        ? { emoji: "☀️", label: "Day" }
        : { emoji: "🌙", label: "Night" };
}

function isBusinessHours(timezone, utcMs) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone, hour: "numeric", hour12: false,
    }).formatToParts(new Date(utcMs));
    const hour = parseInt(parts.find(p => p.type === "hour")?.value || "0", 10);
    return hour >= 9 && hour < 18;
}

let toastTimer = null;
function showToast(msg) {
    DOM.toast.textContent = msg;
    DOM.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => DOM.toast.classList.remove("show"), 2500);
}

/* ═══════════════════════════════════════════════════════════════════════════
   STORAGE
   ═══════════════════════════════════════════════════════════════════════════ */
function saveState() {
    const data = {
        selectedIds: state.selectedIds,
        baseId: state.baseId,
        theme: state.theme,
        hourFormat: state.hourFormat,
    };
    if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.set({ allthetime: data });
    } else {
        localStorage.setItem("allthetime", JSON.stringify(data));
    }
}

function loadState(cb) {
    if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.get("allthetime", result => { applyStoredState(result.allthetime); cb(); });
    } else {
        try {
            const raw = localStorage.getItem("allthetime");
            if (raw) applyStoredState(JSON.parse(raw));
        } catch (_) { }
        cb();
    }
}

function applyStoredState(data) {
    if (!data) return;
    if (Array.isArray(data.selectedIds))
        state.selectedIds = data.selectedIds.filter(id => COUNTRIES.some(c => c.id === id));
    if (data.baseId) state.baseId = data.baseId;
    if (data.theme) state.theme = data.theme;
    if (data.hourFormat) state.hourFormat = data.hourFormat;
}

/* ═══════════════════════════════════════════════════════════════════════════
   THEME
   ═══════════════════════════════════════════════════════════════════════════ */
function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    DOM.iconDark.style.display = state.theme === "dark" ? "block" : "none";
    DOM.iconLight.style.display = state.theme === "dark" ? "none" : "block";
}

DOM.btnTheme.addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    applyTheme();
    saveState();
});

/* ═══════════════════════════════════════════════════════════════════════════
   HOUR FORMAT (12h / 24h)
   ═══════════════════════════════════════════════════════════════════════════ */
function applyHourFormat() {
    // Label shows what you'll switch TO
    DOM.hourFormatLabel.textContent = state.hourFormat === "24" ? "12H" : "24H";
}

DOM.btnHourFormat.addEventListener("click", () => {
    state.hourFormat = state.hourFormat === "24" ? "12" : "24";
    applyHourFormat();
    saveState();
    renderClocks();
});

/* ═══════════════════════════════════════════════════════════════════════════
   SEARCH / DROPDOWN
   ═══════════════════════════════════════════════════════════════════════════ */
DOM.searchInput.addEventListener("input", () => {
    const q = DOM.searchInput.value.trim();
    DOM.searchClear.style.display = q ? "block" : "none";
    if (q) renderDropdown(q); else closeDropdown();
});

DOM.searchClear.addEventListener("click", () => {
    DOM.searchInput.value = "";
    DOM.searchClear.style.display = "none";
    closeDropdown();
    DOM.searchInput.focus();
});

DOM.searchInput.addEventListener("focus", () => {
    if (DOM.searchInput.value.trim()) renderDropdown(DOM.searchInput.value.trim());
});

document.addEventListener("click", e => {
    if (!e.target.closest(".add-bar")) closeDropdown();
});

function openDropdown() { DOM.dropdown.classList.add("open"); }
function closeDropdown() { DOM.dropdown.classList.remove("open"); }

function renderDropdown(query) {
    const q = query.toLowerCase();
    const results = COUNTRIES.filter(c =>
        !state.selectedIds.includes(c.id) &&
        (c.label.toLowerCase().includes(q) || c.city.toLowerCase().includes(q) || c.timezone.toLowerCase().includes(q))
    ).slice(0, 12);

    if (results.length === 0) {
        DOM.dropdown.innerHTML = `<div class="dropdown-empty">No results for "${query}"</div>`;
    } else {
        DOM.dropdown.innerHTML = results.map(c => {
            const rawCode = c.id.split("-")[0].toUpperCase();
            const flagUrl = `https://flagcdn.com/w20/${rawCode.toLowerCase()}.png`;
            return `
      <div class="dropdown-item" data-id="${c.id}" role="option" tabindex="0">
        <img class="di-flag-img" src="${flagUrl}" alt="" onerror="this.style.display='none'">
        <span class="di-code">${rawCode}</span>
        <span class="di-label">${c.label}</span>
        <span class="di-city">${c.city}</span>
      </div>`;
        }).join("");
        DOM.dropdown.querySelectorAll(".dropdown-item").forEach(el => {
            el.addEventListener("click", () => {
                addCountry(el.dataset.id);
                DOM.searchInput.value = "";
                DOM.searchClear.style.display = "none";
                closeDropdown();
            });
        });
    }
    openDropdown();
}

/* ═══════════════════════════════════════════════════════════════════════════
   COUNTRY MANAGEMENT
   ═══════════════════════════════════════════════════════════════════════════ */
function addCountry(id) {
    if (state.selectedIds.includes(id)) return;
    state.selectedIds.push(id);
    if (!state.baseId) state.baseId = id;
    saveState();
    renderClocks();
}

function removeCountry(id) {
    state.selectedIds = state.selectedIds.filter(x => x !== id);
    if (state.baseId === id) state.baseId = state.selectedIds[0] || null;
    saveState();
    renderClocks();
}

/* ═══════════════════════════════════════════════════════════════════════════
   CLOCK RENDERING
   ═══════════════════════════════════════════════════════════════════════════ */
let simBanner = null;

function renderClocks() {
    if (simBanner && simBanner.parentNode) simBanner.remove();
    simBanner = null;

    const now = getNow();
    // Always diff against user's local timezone
    const baseOffsetMin = getUtcOffsetMinutes(LOCAL_TZ, now);

    const fragment = document.createDocumentFragment();

    // ── Always-first: Local time card ─────────────────────────────────────────
    fragment.appendChild(buildCard(LOCAL_COUNTRY, now, baseOffsetMin));

    if (state.selectedIds.length === 0) {
        DOM.clockGrid.innerHTML = "";
        DOM.clockGrid.appendChild(fragment);
        const hint = document.createElement("div");
        hint.className = "empty-state";
        hint.innerHTML = `
      <span class="empty-icon">🌍</span>
      <p>Add a country to get started</p>
      <small>Search above to add your first clock</small>
    `;
        DOM.clockGrid.appendChild(hint);
        return;
    }

    // ── Sim banner ───────────────────────────────────────────────────────────
    if (state.simulatedOffset !== null) {
        simBanner = document.createElement("div");
        simBanner.className = "sim-banner";
        simBanner.innerHTML = `<span>⏱ <strong>Time Simulation Active</strong></span><button class="sim-reset-btn" id="sim-reset">Reset to Live</button>`;
        DOM.clockGrid.parentNode.insertBefore(simBanner, DOM.clockGrid);
        document.getElementById("sim-reset").addEventListener("click", resetSimulation);
    }

    state.selectedIds.forEach(id => {
        const country = getCountry(id);
        if (!country) return;
        fragment.appendChild(buildCard(country, now, baseOffsetMin));
    });

    DOM.clockGrid.innerHTML = "";
    DOM.clockGrid.appendChild(fragment);
    setupDragDrop();
}



/* ─── Card Helper: build card HTML ─── */
function buildCard(country, now, baseOffsetMin) {
    const isLocal = country.id === "__local__";
    const { h, m, s, ampm, dateStr, tzAbbr } = getTimeParts(now, country.timezone);
    const business = isBusinessHours(country.timezone, now);
    const thisOffsetMin = getUtcOffsetMinutes(country.timezone, now);
    const diffMin = (baseOffsetMin !== null && !isLocal)
        ? (thisOffsetMin - baseOffsetMin) : null;

    const diffBadge = (diffMin !== null && diffMin !== 0)
        ? `<span class="card-diff">${formatOffset(diffMin)}</span>` : "";
    const ampmHtml = ampm ? `<span class="card-ampm">${ampm}</span>` : "";

    const card = document.createElement("div");
    card.className = [
        "clock-card",
        business ? "business-hours" : "",
        isLocal ? "local-card" : "",
    ].filter(Boolean).join(" ");
    card.dataset.id = country.id;
    if (!isLocal) card.setAttribute("draggable", "true");

    // Display ID (e.g., "us-ny" -> "US", "__local__" -> matched real code)
    const rawId = isLocal ? (country.realId || "") : country.id;
    const countryCode = rawId.split("-")[0].toUpperCase();
    const flagImgUrl = `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;

    card.innerHTML = `
    ${!isLocal
            ? `<div class="drag-handle" title="Drag to reorder"><span></span><span></span><span></span></div>`
            : `<div class="drag-placeholder"></div>`}
    <div class="card-flag-container">
      <img class="card-flag-img" src="${flagImgUrl}" alt="${countryCode}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
      <span class="card-flag-emoji" style="display:none;">${country.flag}</span>
      <span class="card-flag-code">${countryCode}</span>
    </div>
    <div class="card-body">
      <div class="card-label">
        <span class="card-country">${country.label}</span>
        <span class="card-city">${country.city}${isLocal ? ` <span class="local-badge">Local</span>` : ""}</span>
      </div>
      <div class="card-time" title="Click to set time">
        <span class="hms">${h}:${m}</span><span class="seconds">:${s}</span>${ampmHtml}
      </div>
      <div class="card-meta">
        <span class="card-date">${dateStr}</span>
        <span class="card-tz">${tzAbbr}</span>
        ${diffBadge}
      </div>
    </div>
    <span class="card-daypart" title="${getDayPart(country.timezone, now).label}">${getDayPart(country.timezone, now).emoji}</span>
    ${!isLocal ? `<div class="card-actions">
      <button class="card-btn danger remove-btn" data-id="${country.id}" title="Remove">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>` : ""
        }
    `;

    // Inline time editing: click the time digits to edit
    card.querySelector(".card-time").addEventListener("click", e => {
        e.stopPropagation();
        startInlineEdit(card, country);
    });

    if (!isLocal) {
        card.querySelector(".remove-btn")?.addEventListener("click", e => {
            e.stopPropagation();
            removeCountry(country.id);
        });
    }

    return card;
}

/* ─── Inline time editing ─────────────────────────────────────────────────── */
function startInlineEdit(card, country) {
    const timeEl = card.querySelector(".card-time");
    if (!timeEl || timeEl.querySelector(".inline-time-input")) return;

    // Get HH:MM in this timezone
    const now = getNow();
    const dtFmt = new Intl.DateTimeFormat("en-US", {
        timeZone: country.timezone, hour: "2-digit", minute: "2-digit", hour12: false,
    });
    const tp = dtFmt.formatToParts(new Date(now));
    const getP = t => tp.find(p => p.type === t)?.value || "00";
    const hh = getP("hour") === "24" ? "00" : getP("hour");
    const mm = getP("minute");

    timeEl.innerHTML = `<input class="inline-time-input" type="time" value="${hh}:${mm}" />`;
    const input = timeEl.querySelector("input");
    input.focus();
    try { input.select(); } catch (_) { }

    const apply = () => {
        if (!input.value) { renderClocks(); return; }
        const [h, m] = input.value.split(":").map(Number);

        const dateFmt = new Intl.DateTimeFormat("en-US", {
            timeZone: country.timezone, year: "numeric", month: "2-digit", day: "2-digit",
        });
        const dp = dateFmt.formatToParts(new Date(getNow()));
        const dget = t => parseInt(dp.find(p => p.type === t)?.value || "0", 10);

        const approxUtc = Date.UTC(dget("year"), dget("month") - 1, dget("day"), h, m);
        const offsetMin = getUtcOffsetMinutes(country.timezone, approxUtc);
        const utcMs = approxUtc - (offsetMin * 60000);

        state.simulatedOffset = utcMs;
        state.simulatedFrom = Date.now();
        renderClocks();
        showToast("Time updated — all clocks synced");
    };

    let done = false;
    input.addEventListener("keydown", e => {
        if (e.key === "Enter") { done = true; apply(); }
        if (e.key === "Escape") { done = true; renderClocks(); }
    });
    input.addEventListener("blur", () => { if (!done) { done = true; apply(); } });
}

/* ─── Per-second tick: updates text nodes without re-rendering ────────────── */
function tickClocks() {
    const now = getNow();
    // Always diff against user's local timezone
    const baseOffsetMin = getUtcOffsetMinutes(LOCAL_TZ, now);

    const cards = Array.from(DOM.clockGrid.children);
    ["__local__", ...state.selectedIds].forEach(id => {
        const card = cards.find(c => c.dataset?.id === id);
        if (!card) return;
        const country = getCountry(id);
        if (!country) return;

        const timeEl = card.querySelector(".card-time");
        if (timeEl?.querySelector(".inline-time-input")) return; // skip while editing

        const { h, m, s, ampm, dateStr, tzAbbr } = getTimeParts(now, country.timezone);

        const hmsEl = card.querySelector(".hms");
        const secEl = card.querySelector(".seconds");
        const dateEl = card.querySelector(".card-date");
        const tzEl = card.querySelector(".card-tz");
        let ampmEl = card.querySelector(".card-ampm");

        if (hmsEl) hmsEl.textContent = `${h}:${m} `;
        if (secEl) secEl.textContent = `:${s} `;
        if (dateEl) dateEl.textContent = dateStr;
        if (tzEl) tzEl.textContent = tzAbbr;

        // AM/PM badge
        if (ampm) {
            if (!ampmEl) {
                ampmEl = document.createElement("span");
                ampmEl.className = "card-ampm";
                timeEl?.appendChild(ampmEl);
            }
            ampmEl.textContent = ampm;
        } else if (ampmEl) {
            ampmEl.remove();
        }

        card.classList.toggle("business-hours", isBusinessHours(country.timezone, now));

        // Time diff vs first country (not for local card)
        if (id !== "__local__") {
            const thisOff = getUtcOffsetMinutes(country.timezone, now);
            const diffMin = baseOffsetMin !== null ? (thisOff - baseOffsetMin) : null;
            let diffEl = card.querySelector(".card-diff");
            if (diffMin !== null && diffMin !== 0) {
                if (!diffEl) {
                    diffEl = document.createElement("span");
                    diffEl.className = "card-diff";
                    card.querySelector(".card-meta")?.appendChild(diffEl);
                }
                diffEl.textContent = formatOffset(diffMin);
            } else if (diffEl) {
                diffEl.remove();
            }
        }

        // Day-part emoji (updates when hour changes)
        const daypartEl = card.querySelector(".card-daypart");
        if (daypartEl) {
            const { emoji, label } = getDayPart(country.timezone, now);
            daypartEl.textContent = emoji;
            daypartEl.title = label;
        }
    });
}

/* ═══════════════════════════════════════════════════════════════════════════
   LIVE CLOCK TICKER
   ═══════════════════════════════════════════════════════════════════════════ */
let tickInterval = null;

function startTicker() {
    clearInterval(tickInterval);
    const delay = 1000 - (Date.now() % 1000);
    setTimeout(() => {
        tickClocks();
        tickInterval = setInterval(tickClocks, 1000);
    }, delay);
}

function resetSimulation() {
    state.simulatedOffset = null;
    state.simulatedFrom = null;
    renderClocks();
    showToast("Restored to live time");
}

/* ═══════════════════════════════════════════════════════════════════════════
   DRAG-TO-REORDER (local card is skipped)
   ═══════════════════════════════════════════════════════════════════════════ */
let dragSrcId = null;

function setupDragDrop() {
    const cards = DOM.clockGrid.querySelectorAll(".clock-card:not(.local-card)");

    cards.forEach(card => {
        card.addEventListener("dragstart", e => {
            dragSrcId = card.dataset.id;
            card.classList.add("dragging");
            e.dataTransfer.effectAllowed = "move";
        });
        card.addEventListener("dragend", () => {
            card.classList.remove("dragging");
            DOM.clockGrid.querySelectorAll(".clock-card").forEach(c => c.classList.remove("drag-over"));
        });
        card.addEventListener("dragover", e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            if (card.dataset.id !== dragSrcId && !card.classList.contains("local-card")) {
                DOM.clockGrid.querySelectorAll(".clock-card").forEach(c => c.classList.remove("drag-over"));
                card.classList.add("drag-over");
            }
        });
        card.addEventListener("drop", e => {
            e.preventDefault();
            const targetId = card.dataset.id;
            if (dragSrcId && targetId && dragSrcId !== targetId) {
                const si = state.selectedIds.indexOf(dragSrcId);
                const ti = state.selectedIds.indexOf(targetId);
                if (si > -1 && ti > -1) {
                    state.selectedIds.splice(si, 1);
                    state.selectedIds.splice(ti, 0, dragSrcId);
                    saveState();
                    renderClocks();
                }
            }
        });
    });
}

/* ═══════════════════════════════════════════════════════════════════════════
   INITIALISE
   ═══════════════════════════════════════════════════════════════════════════ */
function init() {
    LOCAL_COUNTRY = buildLocalCountry(); // refresh now COUNTRIES is guaranteed loaded
    loadState(() => {
        applyTheme();
        applyHourFormat();
        renderClocks();
        startTicker();
    });
}

document.addEventListener("DOMContentLoaded", init);
