async function loadFinali() {
  const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSk6sFq6_ScnG6L8i3PNCO6CMfvxPZYvawGrvWqKq3riFp-2qxuDFozQOH1aUjsbeRglRjyFMbKAeGp/pub?gid=660358441&single=true&output=csv";
  const response = await fetch(csvUrl);
  const csvText = await response.text();
  const data = Papa.parse(csvText, { header: true }).data;

  data.sort((a, b) => {
    const dateA = new Date(`${a.DATA} ${a.ORA}`);
    const dateB = new Date(`${b.DATA} ${b.ORA}`);
    return dateA - dateB;
  });

  const tbody = document.getElementById("finali-body");
  tbody.innerHTML = "";

  data.forEach(row => {
    const [g1, g2] = (row.RISULTATO || "").split("-").map(Number);
    const winnerClass = g1 > g2 ? "vincente1" : g2 > g1 ? "vincente2" : "";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.FASE}</td>
      <td>${row.GIORNO}</td>
      <td>${row.ORA}</td>
      <td>${row.CAMPO}</td>
      <td class="${winnerClass === 'vincente1' ? 'vincente' : ''}">${row.SQUADRA1}</td>
      <td class="${winnerClass === 'vincente2' ? 'vincente' : ''}">${row.SQUADRA2}</td>
      <td>${row.RISULTATO}</td>
    `;
    tbody.appendChild(tr);
  });
}

window.renderFinali = loadFinali;
