import { api } from "./api.js";
import { state, platformParam, refresh } from "./state.js";
import { esc, icon, loadingHtml, COV, PRIO, platformSelectHtml } from "./ui.js";
import { openPanel } from "./panel.js";

let data = [];
const gf = { q: "", cov: "", tactic: "", prio: "" };

export async function renderGaps(root) {
  root.innerHTML = `<div class="page">${loadingHtml()}</div>`;
  data = await api.get(`/api/gaps?platform=${platformParam()}`);
  const tactics = state.matrix.tactics.map((t) => t.name);
  const p = platformParam();

  root.innerHTML = `
    <div class="page">
      <div class="page-head">
        <div>
          <h1>Boşluqlar</h1>
          <p>Tam örtülməyən texnikalar, prioritet balına görə sıralanıb. Bal boşluğun növündən, texnikanı istifadə edən ATT&amp;CK qruplarının sayından, log mənbəyinin olmamasından və qeyd prioritetindən hesablanır. «Kor» texnikada əvvəl log mənbəyi bağlanmalıdır.</p>
        </div>
        <div class="page-actions">
          ${platformSelectHtml(state)}
          <a class="btn" href="/api/export/gaps.csv?platform=${p}" download>${icon("download")}CSV ixrac</a>
        </div>
      </div>

      <div class="filters">
        <label class="search">${icon("search")}<input id="gq" type="search" placeholder="Texnika ID və ya ad" aria-label="Boşluq axtar" value="${esc(gf.q)}"></label>
        <select id="gc" aria-label="Əhatə">
          <option value="">Boşluq və qismən</option>
          <option value="gap" ${gf.cov === "gap" ? "selected" : ""}>Yalnız boşluq</option>
          <option value="partial" ${gf.cov === "partial" ? "selected" : ""}>Yalnız qismən</option>
          <option value="blind" ${gf.cov === "blind" ? "selected" : ""}>Yalnız kor</option>
        </select>
        <select id="gt" aria-label="Taktika">
          <option value="">Bütün taktikalar</option>
          ${tactics.map((t) => `<option ${gf.tactic === t ? "selected" : ""}>${esc(t)}</option>`).join("")}
        </select>
        <select id="gp" aria-label="Prioritet qeydi">
          <option value="">Bütün prioritetlər</option>
          ${Object.entries(PRIO).map(([k, v]) => `<option value="${k}" ${gf.prio === k ? "selected" : ""}>${v}</option>`).join("")}
        </select>
      </div>
      <div id="gapTable"></div>
    </div>`;

  paintRows(root);
  const bind = (sel, key, ev = "change") =>
    root.querySelector(sel).addEventListener(ev, (e) => {
      gf[key] = e.target.value.trim();
      paintRows(root);
    });
  bind("#gq", "q", "input");
  bind("#gc", "cov");
  bind("#gt", "tactic");
  bind("#gp", "prio");
  root.querySelector("#platform").addEventListener("change", async (e) => {
    state.filters.platform = e.target.value;
    await refresh();
  });
}

function paintRows(root) {
  const box = root.querySelector("#gapTable");
  const rows = data.filter(
    (g) =>
      (!gf.q || g.id.toLowerCase().includes(gf.q.toLowerCase()) || g.name.toLowerCase().includes(gf.q.toLowerCase())) &&
      (!gf.cov || (gf.cov === "blind" ? g.blind : g.coverage === gf.cov)) &&
      (!gf.tactic || g.tactics.includes(gf.tactic)) &&
      (!gf.prio || g.priority === gf.prio)
  );

  if (!data.length) {
    box.innerHTML = `<div class="empty"><h3>Bütün texnikalar tam örtülüb</h3><p>Boşluq qalmayıb. Yeni qaydalar əlavə olunduqca bu siyahı yenilənəcək.</p></div>`;
    return;
  }
  if (!rows.length) {
    box.innerHTML = `<div class="empty"><h3>Filtrə uyğun texnika tapılmadı</h3><p>Axtarışı və ya filtrləri dəyişin.</p></div>`;
    return;
  }

  box.innerHTML = `
    <p class="muted" style="margin-bottom:10px">${rows.length} texnika</p>
    <div class="table-wrap">
      <table>
        <thead><tr><th>#</th><th>Texnika</th><th class="hide-md">Taktika</th><th>Əhatə</th><th>Səbəb</th><th title="Texnikanı istifadə edən ATT&CK qrupları">Qrup</th><th title="Honeypot-da son 24 saatda müşahidə olunan hadisə sayı">Honeypot</th><th>Bal</th></tr></thead>
        <tbody>
          ${rows
            .map(
              (g) => `
            <tr tabindex="0" data-id="${esc(g.id)}">
              <td class="num muted">${g.rank}</td>
              <td><div class="name">${esc(g.name)}</div><div class="sub-line tid">${esc(g.id)}${g.priority ? ` <span class="pill ${g.priority === "high" ? "prio-high" : ""}" style="margin-left:6px">${PRIO[g.priority]}</span>` : ""}</div></td>
              <td class="muted hide-md">${esc(g.tactics.join(", "))}</td>
              <td><span class="pill ${g.coverage}"><i class="state ${g.coverage}"></i>${COV[g.coverage]}</span>${g.blind ? `<span class="pill blind" style="margin-left:6px">${icon("blind")}Kor</span>` : ""}</td>
              <td class="reason">${esc(g.reason)}</td>
              <td class="num">${g.groups || '<span class="muted">0</span>'}</td>
              <td class="num">${g.obs || '<span class="muted">0</span>'}</td>
              <td class="num"><b style="font-weight:600">${g.score}</b></td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>`;

  box.onclick = (e) => {
    const tr = e.target.closest("tr[data-id]");
    if (tr) openPanel(tr.dataset.id);
  };
  box.onkeydown = (e) => {
    if (e.key === "Enter" && e.target.matches("tr[data-id]")) openPanel(e.target.dataset.id);
  };
}
