/* Funções utilitárias compartilhadas entre as páginas. Depende de const.js. */
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const fmt = (v, d = 2) => v == null || isNaN(v) ? '—' : Number(v).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmt0 = (v, d = 0) => fmt(v, d);
const hora = iso => iso ? new Date(iso).toLocaleString('pt-BR', { timeZone: TZ, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';
const esc = t => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
async function api(p) {
  const r = await fetch(URL_API + p, { headers: { apikey: KEY } });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}
const hojeStr = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ });
const amanhaStr = () => new Date(Date.now() + 24 * 3600e3).toLocaleDateString('en-CA', { timeZone: TZ });
const horaAgora = () => +new Date().toLocaleString('en-US', { timeZone: TZ, hour: 'numeric', hour12: false }) % 24;
