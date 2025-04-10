async function loadGironi() {
  const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSk6sFq6_ScnG6L8i3PNCO6CMfvxPZYvawGrvWqKq3riFp-2qxuDFozQOH1aUjsbeRglRjyFMbKAeGp/pub?gid=1898554956&single=true&output=csv";
  const response = await fetch(csvUrl);
  const csvText = await response.text();

  const rows = Papa.parse(csvText, { header: true }).data;

  const filters = {
    campo: document.getElementById("filtro-campo"),
    giorno: document.getElementById("filtro-giorno"),
    girone: document.getElementById("filtro-girone")
  };

  function renderFilters(data) {
    const unique = (key) => [...new Set(data.map(row => row[key]).filter(Boolean))];

    for (let key in filters) {
      filters[key].innerHTML = `<option value="">Tutti</option>` + unique(key)
        .map(val => `<option value="${val}">${val}</option>`).join("");
    }
  }

  function renderPartite(data) {
    const tbody = document.getElementById("partite-body");
    tbody.innerHTML = "";

    const filtrate = data.filter(row => {
      return (!filters.campo.value || row.CAMPO === filters.campo.value) &&
             (!filters.giorno.value || row.GIORNO === filters.giorno.value) &&
             (!filters.girone.value || row.GIRONE === filters.girone.value);
    });

    filtrate.sort((a, b) => {
      const dateA = new Date(`${a.DATA} ${a.ORA}`);
      const dateB = new Date(`${b.DATA} ${b.ORA}`);
      return dateA - dateB;
    });

    filtrate.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.GIORNO}</td>
        <td>${row.ORA}</td>
        <td>${row.CAMPO}</td>
        <td>${row.GIRONE}</td>
        <td>${row.SQUADRA1}</td>
        <td>${row.SQUADRA2}</td>
        <td>${row.RISULTATO}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderClassifiche(data) {
    const container = document.getElementById("classifiche");
    container.innerHTML = "";

    const gironi = [...new Set(data.map(r => r.GIRONE))];

    const punteggi = {};

    data.forEach(row => {
      const { GIRONE, SQUADRA1, SQUADRA2, RISULTATO } = row;
      if (!RISULTATO || !RISULTATO.includes("-")) return;

      const [g1, g2] = RISULTATO.split("-").map(n => parseInt(n));
      if (isNaN(g1) || isNaN(g2)) return;

      if (!punteggi[GIRONE]) punteggi[GIRONE] = {};
      [SQUADRA1, SQUADRA2].forEach(sq => {
        if (!punteggi[GIRONE][sq]) punteggi[GIRONE][sq] = {
          squadra: sq, punti: 0, giocate: 0, vinte: 0, pareggi: 0, perse: 0,
          gf: 0, gs: 0
        };
      });

      const s1 = punteggi[GIRONE][SQUADRA1];
      const s2 = punteggi[GIRONE][SQUADRA2];
      s1.gf += g1; s1.gs += g2;
      s2.gf += g2; s2.gs += g1;
      s1.giocate++; s2.giocate++;

      if (g1 > g2) { s1.punti += 3; s1.vinte++; s2.perse++; }
      else if (g1 < g2) { s2.punti += 3; s2.vinte++; s1.perse++; }
      else { s1.punti += 1; s2.punti += 1; s1.pareggi++; s2.pareggi++; }
    });

    for (let girone of gironi) {
      if (filters.girone.value && filters.girone.value !== girone) continue;

      const classifica = Object.values(punteggi[girone] || {}).sort((a, b) => {
        return b.punti - a.punti || (b.gf - b.gs) - (a.gf - a.gs) || b.gf - a.gf;
      });

      const table = document.createElement("table");
      table.className = "classifica";
      const thead = `
        <thead><tr><th colspan="9">Girone ${girone}</th></tr>
        <tr><th>Squadra</th><th>Pt</th><th>G</th><th>V</th><th>N</th><th>P</th><th>GF</th><th>GS</th><th>DR</th></tr></thead>`;
      const rows = classifica.map((s, i) => `
        <tr class="${i < 2 ? 'qualificata' : ''}">
          <td>${s.squadra}</td><td>${s.punti}</td><td>${s.giocate}</td><td>${s.vinte}</td>
          <td>${s.pareggi}</td><td>${s.perse}</td><td>${s.gf}</td><td>${s.gs}</td><td>${s.gf - s.gs}</td>
        </tr>`).join("");

      table.innerHTML = thead + `<tbody>${rows}</tbody>`;
      container.appendChild(table);
    }
  }

  renderFilters(rows);
  renderPartite(rows);
  renderClassifiche(rows);

  for (let key in filters) {
    filters[key].addEventListener("change", () => {
      renderPartite(rows);
      renderClassifiche(rows);
    });
  }
}

window.renderGironi = loadGironi;
