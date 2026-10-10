const fs = require('fs');
const path = require('path');

const processHtmlPath = path.join(__dirname, 'process.html');
const styleCssPath = path.join(__dirname, 'style.css');
const appJsPath = path.join(__dirname, 'app.js');

// 1. UPDATE STYLE.CSS (Replace old cards CSS with New Operations Terminal CSS)
let css = fs.readFileSync(styleCssPath, 'utf8');

const oldCardsCssRegex = /\/\*\s*Sequential Manufacturing Matrix Section[\s\S]*?\/\*\s*Responsive Rules for Process Page/i;

const newTerminalCss = `/* ========================================================================== */
/* 8. SEQUENTIAL MANUFACTURING OPERATIONS COMMAND TERMINAL (NON-CARD UI) */
/* ========================================================================== */

.roster-terminal-section {
  padding: 100px 0 110px;
  background: radial-gradient(circle at 50% 25%, rgba(216, 179, 93, 0.05) 0%, rgba(17, 20, 24, 0.98) 75%), var(--ink-surface);
  border-top: 1px solid var(--ink-border);
  position: relative;
  overflow: hidden;
}

/* Linear Process Pipeline Progress Track (5 Stations) */
.pipeline-track-wrapper {
  margin: 36px 0 44px;
  position: relative;
}

.pipeline-stations-nav {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  position: relative;
  z-index: 2;
}

.pipeline-station-pill {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 14px 18px;
  background: rgba(22, 27, 34, 0.85);
  border: 1px solid var(--ink-border);
  border-radius: var(--radius-md);
  color: var(--muted);
  cursor: pointer;
  transition: all 0.25s ease;
  user-select: none;
  text-align: left;
  backdrop-filter: blur(8px);
}

.pipeline-station-pill .pill-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 6px;
}

.pipeline-station-pill .station-num {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 800;
  color: var(--gold-light);
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(216, 179, 93, 0.12);
  border: 1px solid rgba(216, 179, 93, 0.3);
}

.pipeline-station-pill .station-count {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--muted-dark);
}

.pipeline-station-pill .station-label {
  font-family: var(--font-body);
  font-size: 12.5px;
  font-weight: 700;
  color: var(--paper);
  line-height: 1.3;
}

.pipeline-station-pill:hover {
  background: rgba(32, 38, 48, 0.95);
  border-color: var(--gold);
  transform: translateY(-2px);
  color: #ffffff;
}

.pipeline-station-pill.active {
  background: linear-gradient(135deg, rgba(43, 51, 64, 0.98) 0%, rgba(22, 27, 34, 0.98) 100%);
  border-color: var(--gold);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), 0 0 20px rgba(216, 179, 93, 0.25);
}

.pipeline-station-pill.active .station-num {
  background: var(--gold);
  color: #111418;
  border-color: var(--gold);
}

.pipeline-station-pill.active .station-label {
  color: var(--gold-light);
}

/* Split Command Console (Left Spectrum Rail + Right CAD Blueprint Stage) */
.roster-console-split {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 32px;
  align-items: start;
}

/* Left Column: Operation Spectrum Rail (Non-Card!) */
.roster-index-rail {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.roster-rail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(22, 27, 34, 0.75);
  border: 1px solid var(--ink-border);
  border-radius: var(--radius-sm);
  margin-bottom: 4px;
}

.roster-rail-header-title {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--gold-light);
  text-transform: uppercase;
}

.roster-rail-header-status {
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--cyan);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.roster-spectrum-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 18px;
  background: rgba(32, 38, 48, 0.5);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--paper);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.roster-spectrum-item .item-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.roster-spectrum-item .item-code {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--muted-dark);
  transition: color 0.2s ease;
}

.roster-spectrum-item .item-tag-badge {
  font-family: var(--font-mono);
  font-size: 9.5px;
  padding: 3px 8px;
  border-radius: 4px;
  background: rgba(216, 179, 93, 0.08);
  border: 1px solid rgba(216, 179, 93, 0.2);
  color: var(--gold-light);
  letter-spacing: 0.04em;
}

.roster-spectrum-item:hover {
  background: rgba(32, 38, 48, 0.95);
  border-color: rgba(216, 179, 93, 0.4);
  transform: translateX(4px);
  color: #ffffff;
}

.roster-spectrum-item:hover .item-code {
  color: var(--gold);
}

.roster-spectrum-item.active {
  background: linear-gradient(90deg, rgba(43, 51, 64, 0.95) 0%, rgba(22, 27, 34, 0.9) 100%);
  border-color: var(--gold);
  color: #ffffff;
  box-shadow: 0 0 20px rgba(216, 179, 93, 0.2), inset 3px 0 0 var(--gold);
}

.roster-spectrum-item.active .item-code {
  color: var(--gold-light);
}

.roster-spectrum-item.active .item-tag-badge {
  background: var(--gold);
  color: #111418;
  font-weight: 700;
}

/* Right Column: Master Plant CAD Telemetry Stage (Non-Card!) */
.roster-screen-console {
  position: sticky;
  top: 110px;
  background: linear-gradient(150deg, rgba(32, 38, 48, 0.96) 0%, rgba(18, 22, 28, 0.99) 100%);
  border: 2px solid var(--gold);
  border-radius: var(--radius-lg);
  padding: 38px 42px;
  box-shadow: 0 25px 65px rgba(0, 0, 0, 0.85), 0 0 35px rgba(216, 179, 93, 0.2);
  position: relative;
  overflow: hidden;
}

/* Technical Corner HUD Brackets */
.roster-screen-console::before,
.roster-screen-console::after {
  content: "";
  position: absolute;
  width: 14px;
  height: 14px;
  pointer-events: none;
}

.roster-screen-console::before {
  top: 10px;
  left: 10px;
  border-top: 2px solid var(--gold-light);
  border-left: 2px solid var(--gold-light);
}

.roster-screen-console::after {
  bottom: 10px;
  right: 10px;
  border-bottom: 2px solid var(--gold-light);
  border-right: 2px solid var(--gold-light);
}

.roster-gear-watermark {
  position: absolute;
  bottom: -40px;
  right: -40px;
  width: 280px;
  height: 280px;
  opacity: 0.04;
  color: var(--gold-light);
  pointer-events: none;
  animation: gearSpinContinuous 40s linear infinite;
}

.roster-meta-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.roster-station-chip {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  padding: 5px 14px;
  border-radius: 999px;
  background: rgba(216, 179, 93, 0.15);
  border: 1px solid var(--gold);
  color: var(--gold-light);
}

.roster-beacon-live {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--cyan);
}

.roster-beacon-live .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--cyan);
  box-shadow: 0 0 8px var(--cyan);
  animation: badgePulse 2s infinite ease-in-out;
}

.roster-op-title {
  font-size: clamp(24px, 2.8vw, 34px);
  font-weight: 800;
  line-height: 1.25;
  color: #ffffff;
  margin: 0 0 6px;
}

.roster-op-subtitle {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--gold-light);
  margin-bottom: 22px;
  line-height: 1.5;
}

.roster-op-body {
  font-size: 15px;
  line-height: 1.75;
  color: var(--muted);
  margin-bottom: 26px;
}

/* 4-Box Telemetry Parameter Screen */
.roster-param-matrix {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 26px;
}

.roster-param-cell {
  background: rgba(22, 27, 34, 0.85);
  border: 1px solid var(--ink-border);
  border-top: 2px solid var(--gold);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  text-align: center;
}

.roster-param-cell .p-title {
  display: block;
  font-family: var(--font-mono);
  font-size: 9.5px;
  color: var(--muted-dark);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.roster-param-cell .p-val {
  display: block;
  font-family: var(--font-body);
  font-size: 12.5px;
  font-weight: 700;
  color: var(--paper);
}

/* Key Capability Bullets */
.roster-bullets-strip {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px 18px;
  margin-bottom: 28px;
}

.roster-bullet-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13.5px;
  color: var(--paper);
  line-height: 1.45;
}

.roster-bullet-item .b-icon {
  color: var(--gold-light);
  font-weight: 700;
  flex-shrink: 0;
}

/* Navigation & Action Footer */
.roster-footer-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 22px;
  border-top: 1px solid rgba(244, 241, 234, 0.1);
}

.roster-step-arrows {
  display: flex;
  align-items: center;
  gap: 10px;
}

.roster-arrow-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(22, 27, 34, 0.85);
  border: 1px solid var(--ink-border);
  border-radius: var(--radius-sm);
  color: var(--paper);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.roster-arrow-btn:hover {
  background: rgba(32, 38, 48, 0.95);
  border-color: var(--gold);
  color: var(--gold-light);
}

.roster-cta-inquire {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: var(--gold);
  color: #111418;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  transition: all 0.2s ease;
  box-shadow: 0 4px 20px rgba(216, 179, 93, 0.35);
}

.roster-cta-inquire:hover {
  background: var(--gold-light);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(216, 179, 93, 0.55);
}

@media (max-width: 1100px) {
  .pipeline-stations-nav {
    grid-template-columns: repeat(3, 1fr);
  }

  .roster-console-split {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .roster-screen-console {
    position: static;
  }

  .roster-param-matrix {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 700px) {
  .pipeline-stations-nav {
    grid-template-columns: 1fr;
  }

  .roster-bullets-strip {
    grid-template-columns: 1fr;
  }

  .roster-screen-console {
    padding: 26px 20px;
  }
}

/* Responsive Rules for Process Page`;

css = css.replace(oldCardsCssRegex, newTerminalCss);
fs.writeFileSync(styleCssPath, css, 'utf8');
console.log('Successfully updated style.css with Operations Command Terminal CSS');
