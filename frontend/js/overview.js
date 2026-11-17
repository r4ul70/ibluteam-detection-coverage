import { state, refresh } from "./state.js";
import { esc, platformSelectHtml } from "./ui.js";

const R = 84;
const C = 2 * Math.PI * R;
const pct = (n, total) => (total ? Math.round((n / total) * 100) : 0);

export function renderOverview(root) {
  const { stats } = state;
  const T = stats.techniques;
  const S = stats.subtechniques;
  const rules = stats.rules;
  const covered = T.full + T.partial;

  const segs = [
    { cls: "d-full", len: (T.full / T.total) * C, off: 0 },
    { cls: "d-part", len: (T.partial / T.total) * C, off: (T.full / T.total) * C },
  ];

  const maxSrc = Math.max(1, ...Object.values(rules.by_source));

  root.innerHTML = `
    <div class="page">
      <div class="page-head">
        <div>
          <h1>İcmal</h1>
          <p>Hansı ATT&amp;CK texnikaları aşkarlanır, hansılar yox. «Tam» aktiv, test olunmuş və log mənbəyi toplanan qayda, «qismən» draft və ya test olunmamış qayda deməkdir. Log mənbəyi toplanmayan qayda («kor») sayılmır.</p>
        </div>
        <div class="page-actions">${platformSelectHtml(state)}</div>
      </div>

      <div class="overview">
        <div class="box">
          <h2>Texnikalar üzrə əhatə</h2>
          <div class="donut-wrap">
            <svg class="donut" viewBox="0 0 200 200" role="img" aria-label="${T.full} tam, ${T.partial} qismən, ${T.gap} boşluq, cəmi ${T.total} texnika">
              <circle class="d-track" cx="100" cy="100" r="${R}"/>
              ${segs.map((s) => `<circle class="${s.cls}" cx="100" cy="100" r="${R}" data-len="${s.len}" data-off="${s.off}" style="stroke-dasharray:0 ${C};stroke-dashoffset:0"/>`).join("")}
            </svg>
            <div class="donut-center">
              <strong>${pct(covered, T.total)}<small>%</small></strong>
              <span>texnikada ən azı qismən aşkarlama var</span>
            </div>
          </div>
          <div class="legend">
            <div class="legend-row"><i class="state full"></i><span>Tam</span><span><b>${T.full}</b><span class="muted">${pct(T.full, T.total)}%</span></span></div>
            <div class="legend-row"><i class="state partial"></i><span>Qismən</span><span><b>${T.partial}</b><span class="muted">${pct(T.partial, T.total)}%</span></span></div>
            <div class="legend-row"><i class="state gap"></i><span>Boşluq</span><span><b>${T.gap}</b><span class="muted">${pct(T.gap, T.total)}%</span></span></div>
          </div>
          <p class="legend-sub">Alt-texnikalar: ${S.full} tam, ${S.partial} qismən, ${S.gap} boşluq. Cəmi ${S.total}.<br>Risk-çəkili əhatə: <b>${stats.weighted.score}%</b>. Çox ATT&amp;CK qrupunun istifadə etdiyi texnikalar daha çox çəkiyə malikdir.</p>
        </div>

        <div class="box">
          <h2>Taktikalar üzrə</h2>
          <div class="tbars">
            ${stats.tactics
              .map(
                (t) => `
              <div class="tbar">
                <span class="tn" title="${esc(t.name)}">${esc(t.name)}</span>
                <div class="track" role="img" aria-label="${esc(t.name)}: ${t.full} tam, ${t.partial} qismən, ${t.gap} boşluq">
                  <i class="s-full" data-w="${pct(t.full, t.total)}"></i><i class="s-part" data-w="${pct(t.partial, t.total)}"></i>
                </div>
                <span class="tv">${t.full + t.partial} / ${t.total}</span>
              </div>`
              )
              .join("")}
          </div>
        </div>
      </div>

      <div class="stat-row">
        <div class="stat"><b>${rules.total}</b><span>Qayda cəmi</span></div>
        <div class="stat"><b>${rules.active}</b><span>Aktiv</span></div>
        <div class="stat"><b>${rules.draft}</b><span>Draft</span></div>
        <div class="stat"><b>${rules.disabled}</b><span>Söndürülüb</span></div>
        <div class="stat"><b>${rules.tested}</b><span>Test olunub</span></div>
        <div class="stat"><b>${stats.tests.total ? stats.tests.pass_rate + "<small>%</small>" : "—"}</b><span>Test uğur faizi (${stats.tests.total} test)</span></div>
        <div class="stat"><b>${rules.blind}</b><span>Kor qayda</span></div>
        <div class="stat"><b>${stats.data_sources.collected}<small class="muted"> / ${stats.data_sources.total}</small></b><span>Log mənbəyi toplanır</span></div>
        <div class="stat"><b>${rules.avg_quality || "—"}</b><span>Orta keyfiyyət (5-dən)</span></div>
      </div>

      ${
        rules.total
          ? `<div class="box" style="margin-top:20px;max-width:560px">
              <h2>Qaydaların mənbəyi</h2>
              <div class="src-list">
                ${Object.entries(rules.by_source)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, n]) => `<div class="src-row"><span>${esc(name)}</span><div class="track"><i style="width:${(n / maxSrc) * 100}%"></i></div><b>${n}</b></div>`)
                  .join("")}
              </div>
            </div>`
          : ""
      }
    </div>`;

  root.querySelector("#platform").addEventListener("change", async (e) => {
    state.filters.platform = e.target.value;
    await refresh();
  });

                                                          
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      root.querySelectorAll(".donut circle[data-len]").forEach((c) => {
        c.style.strokeDasharray = `${c.dataset.len} ${C}`;
        c.style.strokeDashoffset = `${-c.dataset.off}`;
      });
      root.querySelectorAll(".track i[data-w]").forEach((i) => (i.style.width = i.dataset.w + "%"));
    })
  );
}
