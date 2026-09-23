/* ============================================================
   PAINEL DE EMELLYN CRACCO
   Tudo em JavaScript puro. Nada aqui precisa ser instalado.

   Regra de ouro deste arquivo: o painel nunca abre em branco.
   Se faltar uma tabela ou um campo no banco, ele avisa no topo
   e continua funcionando no resto.
   ============================================================ */

/* ------------------------------------------------------------
   ATALHOS E AJUDANTES
   ------------------------------------------------------------ */
const pegar = (s) => document.querySelector(s);
const pegarTodos = (s) => Array.from(document.querySelectorAll(s));

/* Deixa qualquer texto seguro para ir para a tela. */
function seguro(v){
  return String(v == null ? "" : v)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* Número sem susto: se não der conta, devolve zero em vez de NaN. */
function numero(v){
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function moeda(v){
  return numero(v).toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
}

/* Data no formato do banco (2026-09-23) para o nosso (23/09/2026). */
function dataBR(iso){
  if(!iso) return "";
  const p = String(iso).slice(0,10).split("-");
  if(p.length !== 3) return String(iso);
  return p[2] + "/" + p[1] + "/" + p[0];
}
function hojeISO(){
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
}
function diasEntre(isoA, isoB){
  const a = new Date(String(isoA).slice(0,10) + "T00:00:00");
  const b = new Date(String(isoB).slice(0,10) + "T00:00:00");
  return Math.round((a - b) / 86400000);
}

/* Recado rápido no canto da tela. */
function recado(texto, ruim){
  const caixa = document.createElement("div");
  caixa.className = "recado-flutua" + (ruim ? " ruim" : "");
  caixa.textContent = texto;
  pegar("#recados").appendChild(caixa);
  setTimeout(() => caixa.remove(), 4200);
}

/* Ícones de traço, desenhados na hora. */
const ICONE = {
  portfolio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 21h8M12 18v3"/></svg>',
  marcas:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 19v-1.5A3.5 3.5 0 0 0 12.5 14h-5A3.5 3.5 0 0 0 4 17.5V19"/><circle cx="10" cy="8" r="3.2"/><path d="M19 19v-1.5a3.5 3.5 0 0 0-2.6-3.4M15.4 5.2a3.2 3.2 0 0 1 0 5.6"/></svg>',
  calendario:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  campanhas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12h18"/></svg>',
  checklist: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/></svg>',
  mais:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  baixar:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v10M8 11l4 4 4-4M4 19h16"/></svg>',
  lupa:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/></svg>',
  olhoAberto:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.6"/></svg>',
  olhoFechado:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 5l16 14M6.7 7.7C3.9 9.3 2 12 2 12s3.6 6 10 6c1.8 0 3.4-.5 4.7-1.2M10 6.2c.6-.1 1.3-.2 2-.2 6.4 0 10 6 10 6s-1 1.6-2.8 3.1"/></svg>',
  lapis:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="M14.5 6.5l3 3"/></svg>',
  lixo:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 7V5h4v2M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>',
  arrastar:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01"/></svg>',
  seta:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
  cupons:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 9V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v2a2.5 2.5 0 0 1 0 6v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2a2.5 2.5 0 0 1 0-6Z"/><path d="M13 7v2M13 14v3"/></svg>',
  copiar:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 6H6a2 2 0 0 0-2 2v9"/></svg>',
  link:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a4 4 0 0 0 5.7 0l3-3a4 4 0 1 0-5.7-5.7L11.3 6"/><path d="M14 11a4 4 0 0 0-5.7 0l-3 3a4 4 0 1 0 5.7 5.7l1.7-1.7"/></svg>',
  zap:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 0 1-11.9 7L4 20l1.1-4A8 8 0 1 1 20 12Z"/></svg>'
};

/* ------------------------------------------------------------
   ESTADO: tudo o que o painel guarda enquanto está aberto
   ------------------------------------------------------------ */
const ABAS = [
  { id:"portfolio",  grupo:"meu site",     nome:"Portfólio",  sub:"Como o seu site está indo." },
  { id:"marcas",     grupo:"meu site",     nome:"Marcas",     sub:"A sua base de contatos de empresa." },
  { id:"cupons",     grupo:"meu site",     nome:"Cupons",     sub:"Seus cupons e links de afiliada, prontos para enviar." },
  { id:"calendario", grupo:"minha rotina", nome:"Calendário", sub:"O mês inteiro de gravar, editar e postar." },
  { id:"campanhas",  grupo:"minha rotina", nome:"Campanhas",  sub:"Trabalhos, valores e prazos." },
  { id:"checklist",  grupo:"minha rotina", nome:"Checklist",  sub:"O que ainda falta no seu portfólio." }
];

const FUNIL = ["Briefing", "Roteiro", "Aprovação Roteiro", "Gravação", "Edição", "Aprovado", "Entregue"];
const SITUACOES = ["Lead", "Conversando", "Cliente", "Parada"];
const TIPOS_AGENDA = ["gravar", "editar", "postar"];

const estado = {
  aba: "portfolio",
  email: "",
  faltando: [],
  dados: { videos:[], marcas:[], calendario:[], campanhas:[], marcados:{}, visitas:[], cupons:[] },
  buscaCupons: "", filtroCupons: "Todos",
  buscaMarcas: "", filtroSituacao: "Todas",
  buscaCampanhas: "", filtroCampanhas: "Todas",
  ordem: { campo:"prazo", sentido:1 },
  mes: new Date(),
  filtroAgenda: "Todos",
  subaba: "checklist",
  secoesAbertas: {}
};

/* ------------------------------------------------------------
   CONVERSA COM O BANCO, sempre sem deixar a página quebrar
   ------------------------------------------------------------ */
function anotarFalta(tabela, mensagem){
  const texto = String(mensagem || "").toLowerCase();
  let recadoTexto;
  if(texto.includes("does not exist") || texto.includes("not find the table") || texto.includes("schema cache")){
    recadoTexto = "a tabela <b>" + tabela + "</b> ainda não existe no banco";
  } else if(texto.includes("column")){
    recadoTexto = "a tabela <b>" + tabela + "</b> está sem um campo que o painel esperava";
  } else if(texto.includes("permission") || texto.includes("policy") || texto.includes("row-level")){
    recadoTexto = "o banco não deixou ler a tabela <b>" + tabela + "</b>, confira as regras de segurança";
  } else {
    recadoTexto = "não consegui carregar <b>" + tabela + "</b>";
  }
  if(!estado.faltando.includes(recadoTexto)) estado.faltando.push(recadoTexto);
}

async function lerTabela(tabela, campoOrdem, crescente){
  if(!window.sb){ anotarFalta(tabela, "sem conexão"); return []; }
  try{
    let consulta = window.sb.from(tabela).select("*");
    if(campoOrdem) consulta = consulta.order(campoOrdem, { ascending: crescente !== false });
    const { data, error } = await consulta;
    if(error){ anotarFalta(tabela, error.message); return []; }
    return data || [];
  }catch(e){
    anotarFalta(tabela, e && e.message);
    return [];
  }
}

async function gravar(tabela, linha, id){
  if(!window.sb){ recado("Sem conexão com o banco.", true); return false; }
  try{
    const resposta = id
      ? await window.sb.from(tabela).update(linha).eq("id", id)
      : await window.sb.from(tabela).insert(linha);
    if(resposta.error){ recado("Não consegui salvar: " + resposta.error.message, true); return false; }
    return true;
  }catch(e){
    recado("Não consegui salvar agora.", true);
    return false;
  }
}

async function apagarLinha(tabela, id){
  if(!window.sb) return false;
  try{
    const { error } = await window.sb.from(tabela).delete().eq("id", id);
    if(error){ recado("Não consegui apagar: " + error.message, true); return false; }
    return true;
  }catch(e){
    recado("Não consegui apagar agora.", true);
    return false;
  }
}

async function carregarTudo(){
  estado.faltando = [];
  const [videos, marcas, calendario, campanhas, marcados, visitas, cupons] = await Promise.all([
    lerTabela("videos", "ordem", true),
    lerTabela("marcas", "criado_em", false),
    lerTabela("calendario", "data", true),
    lerTabela("campanhas", "criado_em", false),
    lerTabela("marcados"),
    lerTabela("visitas", "data", false),
    lerTabela("cupons", "criado_em", false)
  ]);
  estado.dados.cupons = cupons;
  estado.dados.videos = videos;
  estado.dados.marcas = marcas;
  estado.dados.calendario = calendario;
  estado.dados.campanhas = campanhas;
  estado.dados.visitas = visitas;
  estado.dados.marcados = {};
  (marcados || []).forEach(m => { estado.dados.marcados[m.chave] = !!m.marcado; });
}

/* ------------------------------------------------------------
   JANELA (o formulário que abre por cima)
   ------------------------------------------------------------ */
let fecharDepois = null;

function abrirJanela(titulo, html, larga){
  pegar("#tituloJanela").textContent = titulo;
  pegar("#corpoJanela").innerHTML = html;
  pegar("#janela").classList.toggle("larga", !!larga);
  pegar("#fundoJanela").classList.add("aberto");
  const primeiro = pegar("#corpoJanela input, #corpoJanela textarea, #corpoJanela select");
  if(primeiro) primeiro.focus();
}
function fecharJanela(){
  pegar("#fundoJanela").classList.remove("aberto");
  pegar("#corpoJanela").innerHTML = "";
  if(typeof fecharDepois === "function"){ const f = fecharDepois; fecharDepois = null; f(); }
}

/* ------------------------------------------------------------
   BAIXAR EM CSV, abrindo certinho no Excel com acento
   ------------------------------------------------------------ */
function baixarCSV(nomeArquivo, cabecalhos, linhas){
  const escapa = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
  const conteudo = [cabecalhos.map(escapa).join(";")]
    .concat(linhas.map(l => l.map(escapa).join(";")))
    .join("\r\n");
  /* O caractere invisível do começo é o que faz o Excel entender os acentos. */
  const arquivo = new Blob(["﻿" + conteudo], { type:"text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(arquivo);
  link.download = nomeArquivo;
  link.click();
  URL.revokeObjectURL(link.href);
}

/* ============================================================
   MENU E NAVEGAÇÃO
   ============================================================ */
function montarMenu(){
  const grupos = [];
  ABAS.forEach(aba => {
    let g = grupos.find(x => x.nome === aba.grupo);
    if(!g){ g = { nome: aba.grupo, itens: [] }; grupos.push(g); }
    g.itens.push(aba);
  });
  pegar("#menuCorpo").innerHTML = grupos.map(g => `
    <div class="menu-titulo">${seguro(g.nome)}</div>
    ${g.itens.map(a => `
      <button class="menu-item" data-aba="${a.id}" aria-current="${estado.aba === a.id}">
        ${ICONE[a.id]}<span>${seguro(a.nome)}</span>
      </button>`).join("")}
  `).join("");

  pegarTodos(".menu-item").forEach(b => {
    b.addEventListener("click", () => {
      estado.aba = b.dataset.aba;
      fecharGaveta();
      desenhar();
    });
  });
}

function fecharGaveta(){
  pegar("#menuLateral").classList.remove("aberto");
  pegar("#tapaMenu").classList.remove("aberto");
}

/* ============================================================
   DESENHO GERAL
   ============================================================ */
function desenhar(){
  const aba = ABAS.find(a => a.id === estado.aba) || ABAS[0];
  pegar("#tituloAba").textContent = aba.nome;
  pegar("#subtituloAba").textContent = aba.sub;
  pegarTodos(".menu-item").forEach(b => b.setAttribute("aria-current", String(b.dataset.aba === estado.aba)));

  /* avisos de coisa que faltou no banco */
  pegar("#avisosFalta").innerHTML = estado.faltando.length
    ? `<div class="aviso-falta">O painel abriu, mas ${estado.faltando.join(", ")}. O resto continua funcionando. Rode o arquivo banco.sql no Supabase para resolver.</div>`
    : "";

  if(estado.aba === "portfolio")  desenharPortfolio();
  if(estado.aba === "marcas")     desenharMarcas();
  if(estado.aba === "cupons")     desenharCupons();
  if(estado.aba === "calendario") desenharCalendario();
  if(estado.aba === "campanhas")  desenharCampanhas();
  if(estado.aba === "checklist")  desenharChecklist();
}

/* ============================================================
   ABA 1: PORTFÓLIO
   ============================================================ */
function ultimosDias(quantos){
  const lista = [];
  for(let i = quantos - 1; i >= 0; i--){
    const d = new Date();
    d.setDate(d.getDate() - i);
    lista.push(d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"));
  }
  return lista;
}

function desenharPortfolio(){
  const visitas = estado.dados.visitas || [];
  const videos = estado.dados.videos || [];
  const dias = ultimosDias(14);

  const porDia = {};
  dias.forEach(d => porDia[d] = 0);
  let visitas14 = 0, visitasHoje = 0;
  const hoje = hojeISO();
  const origens = {};

  visitas.forEach(v => {
    const dia = String(v.data || "").slice(0,10);
    if(dia in porDia){ porDia[dia]++; visitas14++; }
    if(dia === hoje) visitasHoje++;
    const de = (v.origem || "direto").trim() || "direto";
    origens[de] = (origens[de] || 0) + 1;
  });

  const noAr = videos.filter(v => v.visivel !== false).length;

  const contaNicho = {};
  videos.forEach(v => { if(v.nicho) contaNicho[v.nicho] = (contaNicho[v.nicho] || 0) + 1; });
  const nichoForte = Object.keys(contaNicho).sort((a,b) => contaNicho[b] - contaNicho[a])[0] || "ainda não";

  const listaOrigens = Object.entries(origens).sort((a,b) => b[1] - a[1]);
  const origemTop = listaOrigens.length ? listaOrigens[0][0] : "ainda não";

  const maior = Math.max(1, ...dias.map(d => porDia[d]));   /* nunca divide por zero */

  pegar("#acoesTopo").innerHTML = `<button class="btn btn-principal" id="novoVideo">${ICONE.mais} Novo vídeo</button>`;

  pegar("#area").innerHTML = `
    <div class="faixa-numeros">
      <div class="numero"><b>${visitas14}</b><small>visitas em 14 dias</small></div>
      <div class="numero"><b>${visitasHoje}</b><small>visitas hoje</small></div>
      <div class="numero"><b>${noAr}</b><small>vídeos no ar</small></div>
      <div class="numero"><b style="font-size:1rem">${seguro(nichoForte)}</b><small>nicho mais forte</small></div>
      <div class="numero"><b style="font-size:1rem">${seguro(origemTop)}</b><small>de onde mais vêm</small></div>
    </div>

    <div class="colunas">
      <section class="cartao">
        <div class="cartao-topo"><h2>Visitas dos últimos 14 dias</h2></div>
        <div class="cartao-corpo">
          ${visitas14 === 0
            ? `<p class="recado">Aqui vai aparecer uma barrinha por dia assim que as pessoas começarem a visitar o seu portfólio. O registro já está ligado no site: cada visita entra sozinha.</p>`
            : `<div class="grafico">
                 ${dias.map(d => {
                   const q = porDia[d];
                   const altura = Math.round((q / maior) * 100);
                   return `<div class="barra" title="${dataBR(d)}: ${q} visita(s)">
                             <i style="height:${Math.max(altura,2)}%"></i>
                             <small>${d.slice(8,10)}</small>
                           </div>`;
                 }).join("")}
               </div>`}
        </div>
      </section>

      <section class="cartao">
        <div class="cartao-topo"><h2>Por onde chegaram</h2></div>
        <div class="cartao-corpo">
          ${listaOrigens.length
            ? `<ul class="origens">${listaOrigens.slice(0,8).map(([de,q]) => `<li><span>${seguro(de)}</span><b>${q}</b></li>`).join("")}</ul>`
            : `<p class="recado">Quando alguém chegar pelo Instagram, pelo Google ou por um link, a origem aparece aqui.</p>`}
        </div>
      </section>
    </div>

    <section class="cartao">
      <div class="cartao-topo">
        <h2>Meus vídeos</h2>
        <span style="font-size:.76rem;color:var(--tinta-suave)">Arraste pela alcinha para mudar a ordem no site.</span>
      </div>
      <div class="rolagem">
        ${videos.length ? `
        <table>
          <thead><tr>
            <th style="width:34px"></th><th>Título</th><th>Onde aparece</th><th>Nicho</th><th>Formato</th>
            <th>Marca</th><th>Destaque</th><th style="width:130px">Ações</th>
          </tr></thead>
          <tbody id="corpoVideos">
            ${videos.map((v,i) => `
              <tr draggable="true" data-id="${seguro(v.id)}" data-pos="${i}" class="${v.visivel === false ? "sumido" : ""}">
                <td class="alcinha">${ICONE.arrastar}</td>
                <td>${seguro(v.titulo)}</td>
                <td><span class="pilula ${v.secao === "trabalho" ? "p-editar" : "p-conteudo"}">${v.secao === "trabalho" ? "galeria" : "destaque"}</span></td>
                <td>${v.nicho ? `<span class="pilula p-funil">${seguro(v.nicho)}</span>` : ""}</td>
                <td>${seguro(v.formato)}</td>
                <td>${seguro(v.marca)}</td>
                <td>${seguro(v.destaque)}</td>
                <td>
                  <button class="icone-btn ver" data-id="${seguro(v.id)}" title="${v.visivel === false ? "Mostrar no site" : "Esconder do site"}">${v.visivel === false ? ICONE.olhoFechado : ICONE.olhoAberto}</button>
                  <button class="icone-btn editar" data-id="${seguro(v.id)}" title="Editar">${ICONE.lapis}</button>
                  <button class="icone-btn apagar" data-id="${seguro(v.id)}" title="Apagar">${ICONE.lixo}</button>
                </td>
              </tr>`).join("")}
          </tbody>
        </table>` : `<p class="vazio-tabela">Nenhum vídeo cadastrado ainda. Clique em "Novo vídeo" para começar. Enquanto esta lista estiver vazia, o seu site mostra os três vídeos fixos de sempre.</p>`}
      </div>
    </section>
  `;

  pegar("#novoVideo").addEventListener("click", () => formularioVideo(null));
  pegarTodos("#corpoVideos .editar").forEach(b => b.addEventListener("click", () => {
    formularioVideo(videos.find(v => String(v.id) === b.dataset.id));
  }));
  pegarTodos("#corpoVideos .apagar").forEach(b => b.addEventListener("click", async () => {
    const v = videos.find(x => String(x.id) === b.dataset.id);
    if(!v) return;
    if(!confirm('Apagar o vídeo "' + v.titulo + '"?')) return;
    if(await apagarLinha("videos", v.id)){ recado("Vídeo apagado."); await carregarTudo(); desenhar(); }
  }));
  pegarTodos("#corpoVideos .ver").forEach(b => b.addEventListener("click", async () => {
    const v = videos.find(x => String(x.id) === b.dataset.id);
    if(!v) return;
    if(await gravar("videos", { visivel: v.visivel === false }, v.id)){
      recado(v.visivel === false ? "Vídeo agora aparece no site." : "Vídeo escondido do site.");
      await carregarTudo(); desenhar();
    }
  }));

  ligarArrastar();
}

/* arrastar as linhas para mudar a ordem */
function ligarArrastar(){
  const corpo = pegar("#corpoVideos");
  if(!corpo) return;
  let origem = null;

  corpo.querySelectorAll("tr").forEach(linha => {
    linha.addEventListener("dragstart", (e) => {
      origem = linha;
      linha.style.opacity = ".4";
      e.dataTransfer.effectAllowed = "move";
    });
    linha.addEventListener("dragend", () => { linha.style.opacity = ""; });
    linha.addEventListener("dragover", (e) => {
      e.preventDefault();
      if(!origem || origem === linha) return;
      const meio = linha.getBoundingClientRect().top + linha.offsetHeight / 2;
      corpo.insertBefore(origem, e.clientY < meio ? linha : linha.nextSibling);
    });
    linha.addEventListener("drop", async (e) => {
      e.preventDefault();
      const ids = Array.from(corpo.querySelectorAll("tr")).map(l => l.dataset.id);
      let mudou = false;
      for(let i = 0; i < ids.length; i++){
        const v = estado.dados.videos.find(x => String(x.id) === ids[i]);
        if(v && numero(v.ordem) !== i){ await gravar("videos", { ordem: i }, v.id); mudou = true; }
      }
      if(mudou){ recado("Nova ordem salva."); await carregarTudo(); desenhar(); }
    });
  });
}

function formularioVideo(video){
  const v = video || {};
  abrirJanela(video ? "Editar vídeo" : "Novo vídeo", `
    <form id="formVideo">
      <div class="campos">
        <div class="campo largo"><label for="v-titulo">Título</label><input id="v-titulo" required value="${seguro(v.titulo)}"></div>
        <div class="campo largo"><label for="v-link">Link do vídeo</label><input id="v-link" placeholder="https://youtube.com/shorts/..." value="${seguro(v.link)}"></div>
        <div class="campo"><label for="v-secao">Onde aparece no site</label>
          <select id="v-secao">
            <option value="destaque" ${v.secao === "trabalho" ? "" : "selected"}>Destaque, os três cards grandes</option>
            <option value="trabalho" ${v.secao === "trabalho" ? "selected" : ""}>Galeria de trabalhos por nicho</option>
          </select>
        </div>
        <div class="campo"><label for="v-nicho">Nicho</label><input id="v-nicho" placeholder="beleza, skincare, moda..." value="${seguro(v.nicho)}"></div>
        <div class="campo"><label for="v-formato">Formato</label><input id="v-formato" placeholder="vídeo 9:16" value="${seguro(v.formato)}"></div>
        <div class="campo"><label for="v-marca">Marca</label><input id="v-marca" value="${seguro(v.marca)}"></div>
        <div class="campo"><label for="v-destaque">Destaque</label><input id="v-destaque" placeholder="2,4M views" value="${seguro(v.destaque)}"></div>
        <div class="campo largo"><label for="v-descricao">Linha de contexto</label><input id="v-descricao" placeholder="uma frase curta que aparece embaixo do título" value="${seguro(v.descricao)}"></div>
        <div class="campo"><label for="v-ordem">Ordem</label><input id="v-ordem" type="number" value="${numero(v.ordem)}"></div>
        <div class="campo"><label for="v-visivel">Aparece no site</label>
          <select id="v-visivel">
            <option value="sim" ${v.visivel === false ? "" : "selected"}>Sim</option>
            <option value="nao" ${v.visivel === false ? "selected" : ""}>Não</option>
          </select>
        </div>
      </div>
      <div class="acoes-janela">
        <button type="button" class="btn btn-simples" id="cancelar">Cancelar</button>
        <button type="submit" class="btn btn-principal">Salvar</button>
      </div>
    </form>
  `);
  pegar("#cancelar").addEventListener("click", fecharJanela);
  pegar("#formVideo").addEventListener("submit", async (e) => {
    e.preventDefault();
    const linha = {
      titulo:    pegar("#v-titulo").value.trim(),
      link:      pegar("#v-link").value.trim(),
      secao:     pegar("#v-secao").value,
      descricao: pegar("#v-descricao").value.trim(),
      nicho:    pegar("#v-nicho").value.trim(),
      formato:  pegar("#v-formato").value.trim(),
      marca:    pegar("#v-marca").value.trim(),
      destaque: pegar("#v-destaque").value.trim(),
      ordem:    numero(pegar("#v-ordem").value),
      visivel:  pegar("#v-visivel").value === "sim"
    };
    if(!linha.titulo){ recado("O título é obrigatório.", true); return; }
    if(await gravar("videos", linha, v.id)){
      fecharJanela(); recado("Vídeo salvo."); await carregarTudo(); desenhar();
    }
  });
}

/* ============================================================
   ABA 2: MARCAS
   ============================================================ */
function desenharMarcas(){
  const todas = estado.dados.marcas || [];
  const busca = estado.buscaMarcas.toLowerCase();

  const lista = todas.filter(m => {
    const combina = !busca ||
      String(m.nome||"").toLowerCase().includes(busca) ||
      String(m.instagram||"").toLowerCase().includes(busca) ||
      String(m.email||"").toLowerCase().includes(busca);
    const situacaoOk = estado.filtroSituacao === "Todas" || m.situacao === estado.filtroSituacao;
    return combina && situacaoOk;
  });

  pegar("#acoesTopo").innerHTML = `
    <button class="btn btn-simples" id="baixarMarcas">${ICONE.baixar} Baixar CSV</button>
    <button class="btn btn-principal" id="novaMarca">${ICONE.mais} Nova marca</button>`;

  pegar("#area").innerHTML = `
    <section class="cartao">
      <div class="cartao-topo">
        <div class="busca">${ICONE.lupa}<input id="buscaMarcas" placeholder="buscar por nome, @ ou e-mail" value="${seguro(estado.buscaMarcas)}"></div>
        <div class="grupo-filtro">
          ${["Todas"].concat(SITUACOES).map(s => `<button class="filtro" data-situacao="${s}" aria-pressed="${estado.filtroSituacao === s}">${s}</button>`).join("")}
        </div>
      </div>
      <div class="rolagem">
        ${lista.length ? `
        <table>
          <thead><tr>
            <th>Marca</th><th>Instagram</th><th>E-mail</th><th>Telefone</th>
            <th>Situação</th><th>Observação</th><th>Último contato</th>
          </tr></thead>
          <tbody>
            ${lista.map(m => `
              <tr class="linha-clicavel" data-id="${seguro(m.id)}">
                <td>${seguro(m.nome)}</td>
                <td>${m.instagram ? `<a href="https://instagram.com/${seguro(String(m.instagram).replace("@",""))}" target="_blank" rel="noopener" class="parar">${seguro(m.instagram)}</a>` : ""}</td>
                <td>${seguro(m.email)}</td>
                <td>${m.telefone ? `${seguro(m.telefone)} <button class="btn-mini zap parar" data-tel="${seguro(m.telefone)}">WhatsApp</button>` : ""}</td>
                <td><span class="pilula p-${String(m.situacao||"lead").toLowerCase()}">${seguro(m.situacao)}</span></td>
                <td style="max-width:240px">${seguro(m.obs)}</td>
                <td>${dataBR(m.ultimo_contato)}</td>
              </tr>`).join("")}
          </tbody>
        </table>` : `<p class="vazio-tabela">${todas.length ? "Nenhuma marca encontrada com esse filtro." : "Sua base está vazia. Clique em Nova marca aqui em cima, ou espere alguém preencher o formulário do seu site."}</p>`}
      </div>
    </section>
  `;

  const campoBusca = pegar("#buscaMarcas");
  campoBusca.addEventListener("input", () => {
    estado.buscaMarcas = campoBusca.value;
    desenharMarcas();
    const novo = pegar("#buscaMarcas");
    novo.focus(); novo.setSelectionRange(novo.value.length, novo.value.length);
  });
  pegarTodos("[data-situacao]").forEach(b => b.addEventListener("click", () => {
    estado.filtroSituacao = b.dataset.situacao; desenharMarcas();
  }));
  pegar("#novaMarca").addEventListener("click", () => formularioMarca(null));
  pegar("#baixarMarcas").addEventListener("click", () => {
    baixarCSV("minhas-marcas.csv",
      ["Marca","Instagram","E-mail","Telefone","Situação","Observação","Último contato"],
      lista.map(m => [m.nome, m.instagram, m.email, m.telefone, m.situacao, m.obs, dataBR(m.ultimo_contato)]));
  });
  pegarTodos("tbody .linha-clicavel").forEach(linha => linha.addEventListener("click", (e) => {
    if(e.target.closest(".parar")) return;
    formularioMarca(todas.find(m => String(m.id) === linha.dataset.id));
  }));
  pegarTodos(".zap").forEach(b => b.addEventListener("click", () => {
    const so = String(b.dataset.tel).replace(/\D/g, "");
    const numeroZap = so.length <= 11 ? "55" + so : so;
    window.open("https://wa.me/" + numeroZap, "_blank", "noopener");
  }));
}

function formularioMarca(marca){
  const m = marca || {};
  abrirJanela(marca ? "Editar marca" : "Nova marca", `
    <form id="formMarca">
      <div class="campos">
        <div class="campo largo"><label for="m-nome">Marca</label><input id="m-nome" required value="${seguro(m.nome)}"></div>
        <div class="campo"><label for="m-insta">Instagram</label><input id="m-insta" placeholder="@marca" value="${seguro(m.instagram)}"></div>
        <div class="campo"><label for="m-email">E-mail</label><input id="m-email" type="email" value="${seguro(m.email)}"></div>
        <div class="campo"><label for="m-tel">Telefone</label><input id="m-tel" placeholder="41900000000" value="${seguro(m.telefone)}"></div>
        <div class="campo"><label for="m-situacao">Situação</label>
          <select id="m-situacao">${SITUACOES.map(s => `<option ${m.situacao === s ? "selected" : ""}>${s}</option>`).join("")}</select>
        </div>
        <div class="campo largo"><label for="m-obs">Observação</label><textarea id="m-obs">${seguro(m.obs)}</textarea></div>
        <div class="campo"><label for="m-contato">Último contato</label><input id="m-contato" type="date" value="${m.ultimo_contato ? String(m.ultimo_contato).slice(0,10) : ""}"></div>
      </div>
      <div class="acoes-janela">
        ${marca ? `<button type="button" class="btn btn-simples apagar" id="apagarMarca">Apagar</button>` : ""}
        <button type="button" class="btn btn-simples" id="cancelar">Cancelar</button>
        <button type="submit" class="btn btn-principal">Salvar</button>
      </div>
    </form>
  `);
  pegar("#cancelar").addEventListener("click", fecharJanela);
  if(marca){
    pegar("#apagarMarca").addEventListener("click", async () => {
      if(!confirm('Apagar a marca "' + m.nome + '"?')) return;
      if(await apagarLinha("marcas", m.id)){ fecharJanela(); recado("Marca apagada."); await carregarTudo(); desenhar(); }
    });
  }
  pegar("#formMarca").addEventListener("submit", async (e) => {
    e.preventDefault();
    const linha = {
      nome: pegar("#m-nome").value.trim(),
      instagram: pegar("#m-insta").value.trim(),
      email: pegar("#m-email").value.trim(),
      telefone: pegar("#m-tel").value.trim(),
      situacao: pegar("#m-situacao").value,
      obs: pegar("#m-obs").value.trim(),
      ultimo_contato: pegar("#m-contato").value || null
    };
    if(!linha.nome){ recado("O nome da marca é obrigatório.", true); return; }
    if(await gravar("marcas", linha, m.id)){
      fecharJanela(); recado("Marca salva."); await carregarTudo(); desenhar();
    }
  });
}

/* ============================================================
   ABA: CUPONS E LINKS DE AFILIADA
   Pensada para uma coisa só: achar o cupom e copiar rápido.
   ============================================================ */

/* Copia um texto para a área de transferência e avisa na tela. */
async function copiar(texto, oque, cupom){
  if(!texto){ recado("Esse campo está vazio no cupom.", true); return; }
  let deu = false;
  try{
    await navigator.clipboard.writeText(texto);
    deu = true;
  }catch(e){
    /* navegador que não deixa copiar direto: usa um campo escondido */
    const campo = document.createElement("textarea");
    campo.value = texto;
    campo.style.position = "fixed"; campo.style.opacity = "0";
    document.body.appendChild(campo);
    campo.select();
    try{ deu = document.execCommand("copy"); }catch(e2){ deu = false; }
    campo.remove();
  }
  recado(deu ? oque + " copiado." : "Não consegui copiar. O texto é: " + texto, !deu);
  if(deu && cupom) contarCopia(cupom);
}

/* Conta quantas vezes você já usou cada cupom, para saber qual rende mais. */
async function contarCopia(cupom){
  const novas = numero(cupom.copias) + 1;
  cupom.copias = novas;
  const alvo = document.querySelector('[data-copias="' + cupom.id + '"]');
  if(alvo) alvo.textContent = novas === 1 ? "copiado 1 vez" : "copiado " + novas + " vezes";
  if(window.sb){
    try{ await window.sb.from("cupons").update({ copias: novas }).eq("id", cupom.id); }catch(e){}
  }
}

/* A mensagem pronta para mandar para alguém no zap ou no direct. */
function mensagemDoCupom(c){
  if(c.mensagem) return c.mensagem;
  let texto = "Oi! Se você for comprar na " + (c.marca || "marca") + ", usa o meu cupom " + (c.cupom || "");
  if(c.desconto) texto += " e ganha " + c.desconto;
  texto += ".";
  if(c.link) texto += " O link direto é " + c.link;
  return texto;
}

function situacaoValidade(c){
  if(!c.validade) return { classe:"", etiqueta:"sem prazo", vencido:false };
  const dias = diasEntre(String(c.validade).slice(0,10), hojeISO());
  if(dias < 0)  return { classe:"p-atrasado", etiqueta:"venceu em " + dataBR(c.validade), vencido:true };
  if(dias <= 7) return { classe:"p-perto", etiqueta: dias === 0 ? "vence hoje" : "vence em " + dias + " dia" + (dias === 1 ? "" : "s"), vencido:false };
  return { classe:"p-funil", etiqueta:"vale até " + dataBR(c.validade), vencido:false };
}

function desenharCupons(){
  const todos = estado.dados.cupons || [];
  const busca = estado.buscaCupons.toLowerCase();

  let lista = todos.filter(c => {
    const combina = !busca ||
      String(c.marca||"").toLowerCase().includes(busca) ||
      String(c.cupom||"").toLowerCase().includes(busca) ||
      String(c.obs||"").toLowerCase().includes(busca);
    const v = situacaoValidade(c);
    const filtroOk =
      estado.filtroCupons === "Todos" ||
      (estado.filtroCupons === "Ativos" && c.ativo !== false && !v.vencido) ||
      (estado.filtroCupons === "Vencidos" && (v.vencido || c.ativo === false)) ||
      (estado.filtroCupons === "Favoritos" && c.favorito);
    return combina && filtroOk;
  });

  /* os favoritos vêm primeiro, depois os mais copiados */
  lista = lista.slice().sort((a,b) => {
    if(!!b.favorito - !!a.favorito) return !!b.favorito - !!a.favorito;
    return numero(b.copias) - numero(a.copias);
  });

  const ativos = todos.filter(c => c.ativo !== false && !situacaoValidade(c).vencido).length;
  const vencendo = todos.filter(c => {
    if(!c.validade || c.ativo === false) return false;
    const d = diasEntre(String(c.validade).slice(0,10), hojeISO());
    return d >= 0 && d <= 7;
  }).length;
  const copiasTotais = todos.reduce((s,c) => s + numero(c.copias), 0);

  pegar("#acoesTopo").innerHTML = `<button class="btn btn-principal" id="novoCupom">${ICONE.mais} Novo cupom</button>`;

  pegar("#area").innerHTML = `
    <div class="faixa-numeros quatro">
      <div class="numero"><b>${todos.length}</b><small>cupons guardados</small></div>
      <div class="numero"><b>${ativos}</b><small>valendo agora</small></div>
      <div class="numero"><b>${vencendo}</b><small>vencem em 7 dias</small></div>
      <div class="numero"><b>${copiasTotais}</b><small>vezes que você copiou</small></div>
    </div>

    <section class="cartao">
      <div class="cartao-topo">
        <div class="busca">${ICONE.lupa}<input id="buscaCupons" placeholder="buscar marca ou código" value="${seguro(estado.buscaCupons)}"></div>
        <div class="grupo-filtro">
          ${["Todos","Ativos","Vencidos","Favoritos"].map(f => `<button class="filtro" data-fcupom="${f}" aria-pressed="${estado.filtroCupons === f}">${f}</button>`).join("")}
        </div>
      </div>
      <div class="cartao-corpo">
        ${lista.length ? `
        <div class="grid-cupons">
          ${lista.map(c => {
            const v = situacaoValidade(c);
            const morto = v.vencido || c.ativo === false;
            return `
            <article class="cupom ${c.favorito ? "destacado" : ""} ${morto ? "vencido" : ""}">
              <header class="cupom-topo">
                <div>
                  <b>${seguro(c.marca)}</b>
                  ${c.desconto ? `<small>${seguro(c.desconto)}</small>` : `<small>sem desconto anotado</small>`}
                </div>
                <button class="estrela-cupom" data-estrela="${seguro(c.id)}" title="Deixar no topo" style="border:0;background:none;font-size:1.1rem;color:${c.favorito ? "var(--rosa)" : "var(--rosa-dourado)"}">${c.favorito ? "★" : "☆"}</button>
              </header>

              <button class="codigo" data-cod="${seguro(c.id)}" title="Clique para copiar o código">${seguro(c.cupom) || "sem código"}</button>

              <div class="cupom-acoes">
                <button class="btn btn-simples" data-link="${seguro(c.id)}">${ICONE.link} Link</button>
                <button class="btn btn-simples" data-msg="${seguro(c.id)}">${ICONE.copiar} Mensagem</button>
              </div>

              ${c.obs ? `<p class="cupom-obs">${seguro(c.obs)}</p>` : ""}

              <footer class="cupom-rodape">
                <span class="pilula ${v.classe}">${v.etiqueta}</span>
                <span data-copias="${seguro(c.id)}">${numero(c.copias) === 1 ? "copiado 1 vez" : "copiado " + numero(c.copias) + " vezes"}</span>
                <button class="icone-btn" data-editar="${seguro(c.id)}" title="Editar">${ICONE.lapis}</button>
              </footer>
            </article>`;
          }).join("")}
        </div>` : `<p class="recado">${todos.length ? "Nenhum cupom com esse filtro." : "Nenhum cupom guardado ainda. Clique em Novo cupom e comece pela marca que você mais divulga."}</p>`}
      </div>
    </section>
  `;

  const campoBusca = pegar("#buscaCupons");
  campoBusca.addEventListener("input", () => {
    estado.buscaCupons = campoBusca.value;
    desenharCupons();
    const novo = pegar("#buscaCupons");
    novo.focus(); novo.setSelectionRange(novo.value.length, novo.value.length);
  });
  pegarTodos("[data-fcupom]").forEach(b => b.addEventListener("click", () => { estado.filtroCupons = b.dataset.fcupom; desenharCupons(); }));
  pegar("#novoCupom").addEventListener("click", () => formularioCupom(null));

  const acha = (id) => todos.find(c => String(c.id) === id);

  pegarTodos("[data-cod]").forEach(b => b.addEventListener("click", () => {
    const c = acha(b.dataset.cod); if(c) copiar(c.cupom, "Código", c);
  }));
  pegarTodos("[data-link]").forEach(b => b.addEventListener("click", () => {
    const c = acha(b.dataset.link); if(c) copiar(c.link, "Link", c);
  }));
  pegarTodos("[data-msg]").forEach(b => b.addEventListener("click", () => {
    const c = acha(b.dataset.msg); if(c) copiar(mensagemDoCupom(c), "Mensagem", c);
  }));
  pegarTodos("[data-editar]").forEach(b => b.addEventListener("click", () => formularioCupom(acha(b.dataset.editar))));
  pegarTodos("[data-estrela]").forEach(b => b.addEventListener("click", async () => {
    const c = acha(b.dataset.estrela); if(!c) return;
    if(await gravar("cupons", { favorito: !c.favorito }, c.id)){ await carregarTudo(); desenhar(); }
  }));
}

function formularioCupom(cupom){
  const c = cupom || {};
  abrirJanela(cupom ? "Editar cupom" : "Novo cupom", `
    <form id="formCupom">
      <div class="campos">
        <div class="campo"><label for="p-marca">Marca</label><input id="p-marca" required value="${seguro(c.marca)}"></div>
        <div class="campo"><label for="p-cupom">Código do cupom</label><input id="p-cupom" placeholder="EMY10" value="${seguro(c.cupom)}"></div>
        <div class="campo"><label for="p-desconto">Desconto</label><input id="p-desconto" placeholder="10% de desconto" value="${seguro(c.desconto)}"></div>
        <div class="campo"><label for="p-validade">Vale até</label><input id="p-validade" type="date" value="${c.validade ? String(c.validade).slice(0,10) : ""}"></div>
        <div class="campo largo"><label for="p-link">Link de afiliada</label><input id="p-link" placeholder="https://..." value="${seguro(c.link)}"></div>
        <div class="campo largo"><label for="p-mensagem">Mensagem pronta (deixe vazio que eu monto sozinha)</label><textarea id="p-mensagem" placeholder="Ex: Corre que na Marca X o meu cupom EMY10 dá 10% de desconto">${seguro(c.mensagem)}</textarea></div>
        <div class="campo largo"><label for="p-obs">Observação</label><input id="p-obs" placeholder="comissão, regras, onde vale" value="${seguro(c.obs)}"></div>
        <div class="campo"><label for="p-ativo">Ainda está valendo</label>
          <select id="p-ativo">
            <option value="sim" ${c.ativo === false ? "" : "selected"}>Sim</option>
            <option value="nao" ${c.ativo === false ? "selected" : ""}>Não</option>
          </select>
        </div>
      </div>
      <div class="acoes-janela">
        ${cupom ? `<button type="button" class="btn btn-simples apagar" id="apagarCupom">Apagar</button>` : ""}
        <button type="button" class="btn btn-simples" id="cancelar">Cancelar</button>
        <button type="submit" class="btn btn-principal">Salvar</button>
      </div>
    </form>
  `);
  pegar("#cancelar").addEventListener("click", fecharJanela);
  if(cupom){
    pegar("#apagarCupom").addEventListener("click", async () => {
      if(!confirm('Apagar o cupom da marca "' + c.marca + '"?')) return;
      if(await apagarLinha("cupons", c.id)){ fecharJanela(); recado("Cupom apagado."); await carregarTudo(); desenhar(); }
    });
  }
  pegar("#formCupom").addEventListener("submit", async (e) => {
    e.preventDefault();
    const linha = {
      marca: pegar("#p-marca").value.trim(),
      cupom: pegar("#p-cupom").value.trim(),
      desconto: pegar("#p-desconto").value.trim(),
      link: pegar("#p-link").value.trim(),
      mensagem: pegar("#p-mensagem").value.trim(),
      obs: pegar("#p-obs").value.trim(),
      validade: pegar("#p-validade").value || null,
      ativo: pegar("#p-ativo").value === "sim"
    };
    if(!linha.marca){ recado("O nome da marca é obrigatório.", true); return; }
    if(!linha.cupom && !linha.link){ recado("Preencha ao menos o código do cupom ou o link.", true); return; }
    if(await gravar("cupons", linha, c.id)){
      fecharJanela(); recado("Cupom salvo."); await carregarTudo(); desenhar();
    }
  });
}

/* ============================================================
   ABA 3: CALENDÁRIO
   ============================================================ */
function itensDoCalendario(){
  const itens = (estado.dados.calendario || []).map(c => ({
    id: c.id, titulo: c.titulo, marca: c.marca, tipo: c.tipo || "gravar",
    data: String(c.data || "").slice(0,10), status: c.status || "a fazer", daAgenda: true
  }));
  /* os prazos das campanhas entram sozinhos, sem você digitar duas vezes */
  (estado.dados.campanhas || []).forEach(c => {
    if(!c.prazo) return;
    itens.push({
      id: "campanha-" + c.id, titulo: "Prazo: " + c.campanha, marca: c.cliente,
      tipo: "prazo", data: String(c.prazo).slice(0,10),
      status: c.status === "Entregue" ? "feito" : "a fazer", daAgenda: false
    });
  });
  return itens;
}

function desenharCalendario(){
  const base = new Date(estado.mes.getFullYear(), estado.mes.getMonth(), 1);
  const ano = base.getFullYear(), mes = base.getMonth();
  const hoje = hojeISO();

  const filtro = estado.filtroAgenda;
  const todos = itensDoCalendario().filter(i => filtro === "Todos" || i.tipo === filtro.toLowerCase());

  const porDia = {};
  todos.forEach(i => { (porDia[i.data] = porDia[i.data] || []).push(i); });

  /* a grade começa na segunda-feira */
  const primeiro = new Date(ano, mes, 1);
  let recuo = primeiro.getDay() - 1; if(recuo < 0) recuo = 6;
  const inicio = new Date(ano, mes, 1 - recuo);

  const celulas = [];
  for(let i = 0; i < 42; i++){
    const d = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i);
    const iso = d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
    celulas.push({ iso, dia: d.getDate(), fora: d.getMonth() !== mes, hoje: iso === hoje });
  }

  const atrasados = itensDoCalendario()
    .filter(i => i.status !== "feito" && i.data && i.data < hoje)
    .sort((a,b) => a.data < b.data ? 1 : -1);

  const nomeMes = base.toLocaleDateString("pt-BR", { month:"long", year:"numeric" });

  pegar("#acoesTopo").innerHTML = `<button class="btn btn-principal" id="novoItem">${ICONE.mais} Novo item</button>`;

  pegar("#area").innerHTML = `
    <section class="cartao">
      <div class="cartao-topo">
        <div class="mes-topo">
          <button class="icone-btn" id="mesAnterior" aria-label="Mês anterior">${ICONE.seta}</button>
          <span class="mes-nome">${seguro(nomeMes)}</span>
          <button class="icone-btn" id="mesSeguinte" aria-label="Próximo mês" style="transform:rotate(180deg)">${ICONE.seta}</button>
          <button class="btn-mini" id="esteMes">Este mês</button>
        </div>
        <div class="grupo-filtro">
          ${["Todos","Gravar","Editar","Postar","Prazo"].map(t => `<button class="filtro" data-tipo="${t}" aria-pressed="${estado.filtroAgenda === t}">${t}</button>`).join("")}
        </div>
      </div>
      <div class="cartao-corpo">
        <div class="grade">
          ${["seg","ter","qua","qui","sex","sáb","dom"].map(d => `<div class="cabeca">${d}</div>`).join("")}
          ${celulas.map(c => {
            const lista = porDia[c.iso] || [];
            const mostrar = lista.slice(0,3);
            const sobra = lista.length - mostrar.length;
            return `<div class="dia ${c.fora ? "fora" : ""} ${c.hoje ? "hoje" : ""}" data-dia="${c.iso}">
              <span class="num">${c.dia}</span>
              <button class="mais-dia" data-novo="${c.iso}" title="Adicionar neste dia">+</button>
              ${mostrar.map(i => `<button class="evento pilula p-${i.tipo} ${i.status === "feito" ? "feito" : ""}" data-item="${seguro(i.id)}">${seguro(i.titulo)}</button>`).join("")}
              ${sobra > 0 ? `<button class="mais-itens" data-ver="${c.iso}">+${sobra} mais</button>` : ""}
            </div>`;
          }).join("")}
        </div>
      </div>
    </section>

    <section class="cartao">
      <div class="cartao-topo"><h2>Ficou pra trás</h2></div>
      <div class="cartao-corpo">
        ${atrasados.length ? `
          <ul class="atrasados">
            ${atrasados.map(i => {
              const dias = Math.abs(diasEntre(hoje, i.data));
              return `<li>
                <span><span class="pilula p-${i.tipo}">${seguro(i.tipo)}</span> ${seguro(i.titulo)}${i.marca ? " · " + seguro(i.marca) : ""}</span>
                <span style="color:var(--vermelho); font-size:.78rem">há ${dias} dia${dias === 1 ? "" : "s"}</span>
              </li>`;
            }).join("")}
          </ul>` : `<p class="recado">Nada atrasado por aqui. Tudo em dia.</p>`}
      </div>
    </section>
  `;

  pegar("#mesAnterior").addEventListener("click", () => { estado.mes = new Date(ano, mes - 1, 1); desenharCalendario(); });
  pegar("#mesSeguinte").addEventListener("click", () => { estado.mes = new Date(ano, mes + 1, 1); desenharCalendario(); });
  pegar("#esteMes").addEventListener("click", () => { estado.mes = new Date(); desenharCalendario(); });
  pegar("#novoItem").addEventListener("click", () => formularioAgenda(null, hoje));
  pegarTodos("[data-tipo]").forEach(b => b.addEventListener("click", () => { estado.filtroAgenda = b.dataset.tipo; desenharCalendario(); }));
  pegarTodos("[data-novo]").forEach(b => b.addEventListener("click", (e) => { e.stopPropagation(); formularioAgenda(null, b.dataset.novo); }));
  pegarTodos(".dia").forEach(d => d.addEventListener("click", (e) => {
    if(e.target.closest("button")) return;
    formularioAgenda(null, d.dataset.dia);
  }));
  pegarTodos("[data-ver]").forEach(b => b.addEventListener("click", (e) => { e.stopPropagation(); verDia(b.dataset.ver, porDia[b.dataset.ver] || []); }));
  pegarTodos("[data-item]").forEach(b => b.addEventListener("click", (e) => {
    e.stopPropagation();
    const id = b.dataset.item;
    if(String(id).startsWith("campanha-")){
      recado("Este prazo vem da aba Campanhas. Edite por lá.");
      return;
    }
    formularioAgenda(estado.dados.calendario.find(c => String(c.id) === id), null);
  }));
}

function verDia(iso, lista){
  abrirJanela("Dia " + dataBR(iso), `
    <ul class="atrasados">
      ${lista.map(i => `<li>
        <span><span class="pilula p-${i.tipo}">${seguro(i.tipo)}</span> ${seguro(i.titulo)}${i.marca ? " · " + seguro(i.marca) : ""}</span>
        <span style="font-size:.76rem;color:var(--tinta-suave)">${seguro(i.status)}</span>
      </li>`).join("")}
    </ul>
    <div class="acoes-janela"><button class="btn btn-principal" id="novoNesteDia">Adicionar neste dia</button></div>
  `);
  pegar("#novoNesteDia").addEventListener("click", () => formularioAgenda(null, iso));
}

function formularioAgenda(item, dataSugerida){
  const c = item || {};
  const data = c.data ? String(c.data).slice(0,10) : (dataSugerida || hojeISO());
  abrirJanela(item ? "Editar item" : "Novo item", `
    <form id="formAgenda">
      <div class="campos">
        <div class="campo largo"><label for="c-titulo">O que é</label><input id="c-titulo" required value="${seguro(c.titulo)}"></div>
        <div class="campo"><label for="c-marca">Marca</label><input id="c-marca" value="${seguro(c.marca)}"></div>
        <div class="campo"><label for="c-tipo">Tipo</label>
          <select id="c-tipo">${TIPOS_AGENDA.map(t => `<option ${c.tipo === t ? "selected" : ""}>${t}</option>`).join("")}</select>
        </div>
        <div class="campo"><label for="c-data">Data</label><input id="c-data" type="date" value="${data}" required></div>
        <div class="campo"><label for="c-status">Status</label>
          <select id="c-status">
            <option ${c.status === "feito" ? "" : "selected"}>a fazer</option>
            <option ${c.status === "feito" ? "selected" : ""}>feito</option>
          </select>
        </div>
      </div>
      <div class="acoes-janela">
        ${item ? `<button type="button" class="btn btn-simples apagar" id="apagarItem">Apagar</button>` : ""}
        <button type="button" class="btn btn-simples" id="cancelar">Cancelar</button>
        <button type="submit" class="btn btn-principal">Salvar</button>
      </div>
    </form>
  `);
  pegar("#cancelar").addEventListener("click", fecharJanela);
  if(item){
    pegar("#apagarItem").addEventListener("click", async () => {
      if(!confirm("Apagar este item do calendário?")) return;
      if(await apagarLinha("calendario", c.id)){ fecharJanela(); recado("Item apagado."); await carregarTudo(); desenhar(); }
    });
  }
  pegar("#formAgenda").addEventListener("submit", async (e) => {
    e.preventDefault();
    const linha = {
      titulo: pegar("#c-titulo").value.trim(),
      marca: pegar("#c-marca").value.trim(),
      tipo: pegar("#c-tipo").value,
      data: pegar("#c-data").value,
      status: pegar("#c-status").value
    };
    if(!linha.titulo || !linha.data){ recado("Escreva o que é e escolha a data.", true); return; }
    if(await gravar("calendario", linha, c.id)){
      fecharJanela(); recado("Item salvo."); await carregarTudo(); desenhar();
    }
  });
}

/* ============================================================
   ABA 4: CAMPANHAS
   ============================================================ */
function avisoPrazo(c){
  if(!c.prazo || c.status === "Entregue") return "";
  const dias = diasEntre(String(c.prazo).slice(0,10), hojeISO());
  if(dias < 0) return `<span class="pilula p-atrasado">atrasado ${Math.abs(dias)} dia${Math.abs(dias) === 1 ? "" : "s"}</span>`;
  if(dias <= 3) return `<span class="pilula p-perto">${dias === 0 ? "vence hoje" : "faltam " + dias + " dia" + (dias === 1 ? "" : "s")}</span>`;
  return "";
}

function desenharCampanhas(){
  const todas = estado.dados.campanhas || [];
  const busca = estado.buscaCampanhas.toLowerCase();

  let lista = todas.filter(c => {
    const combina = !busca ||
      String(c.campanha||"").toLowerCase().includes(busca) ||
      String(c.cliente||"").toLowerCase().includes(busca);
    const filtroOk =
      estado.filtroCampanhas === "Todas" ||
      (estado.filtroCampanhas === "Ativas" && c.ativa !== false) ||
      (estado.filtroCampanhas === "Finalizadas" && c.ativa === false);
    return combina && filtroOk;
  });

  /* ordenação: clicar no cabeçalho ordena, clicar de novo inverte */
  const campo = estado.ordem.campo, sentido = estado.ordem.sentido;
  lista = lista.slice().sort((a,b) => {
    let x, y;
    if(campo === "status"){ x = FUNIL.indexOf(a.status); y = FUNIL.indexOf(b.status); }
    else if(campo === "valor" || campo === "qtd"){ x = numero(a[campo]); y = numero(b[campo]); }
    else if(campo === "favorita"){ x = a.favorita ? 1 : 0; y = b.favorita ? 1 : 0; }
    else if(campo === "prazo"){ x = a.prazo || "9999-12-31"; y = b.prazo || "9999-12-31"; }
    else { x = String(a[campo] || "").toLowerCase(); y = String(b[campo] || "").toLowerCase(); }
    if(x < y) return -1 * sentido;
    if(x > y) return 1 * sentido;
    return 0;
  });

  const total = todas.length;
  const ativas = todas.filter(c => c.ativa !== false).length;
  const valorTotal = todas.reduce((s,c) => s + numero(c.valor), 0);
  const totalVideos = todas.reduce((s,c) => s + numero(c.qtd), 0);
  const ticket = totalVideos > 0 ? valorTotal / totalVideos : 0;     /* nunca divide por zero */
  const recebido = todas.filter(c => c.pagamento === "pago").reduce((s,c) => s + numero(c.valor), 0);
  const aReceber = valorTotal - recebido;

  const colunas = [
    { campo:"favorita", nome:"", largura:"36px" },
    { campo:"campanha", nome:"Campanha" },
    { campo:"cliente",  nome:"Cliente" },
    { campo:"tipo",     nome:"Tipo" },
    { campo:"status",   nome:"Status" },
    { campo:"qtd",      nome:"Qtd" },
    { campo:"valor",    nome:"Valor" },
    { campo:"prazo",    nome:"Prazo" },
    { campo:"pagamento",nome:"Pagamento" }
  ];

  pegar("#acoesTopo").innerHTML = `
    <button class="btn btn-simples" id="baixarCampanhas">${ICONE.baixar} Baixar CSV</button>
    <button class="btn btn-principal" id="novaCampanha">${ICONE.mais} Nova campanha</button>`;

  pegar("#area").innerHTML = `
    <div class="faixa-numeros quatro">
      <div class="numero"><b>${total}</b><small>campanhas</small></div>
      <div class="numero"><b>${ativas}</b><small>ativas agora</small></div>
      <div class="numero"><b>${moeda(valorTotal)}</b><small>valor total</small><i>${totalVideos > 0 ? moeda(ticket) + " por vídeo" : "ainda sem vídeo contratado"}</i></div>
      <div class="numero"><b>${moeda(aReceber)}</b><small>a receber</small><i>${moeda(recebido)} já recebido</i></div>
    </div>

    <section class="cartao">
      <div class="cartao-topo">
        <div class="busca">${ICONE.lupa}<input id="buscaCampanhas" placeholder="buscar campanha ou cliente" value="${seguro(estado.buscaCampanhas)}"></div>
        <div class="grupo-filtro">
          ${["Todas","Ativas","Finalizadas"].map(f => `<button class="filtro" data-filtro="${f}" aria-pressed="${estado.filtroCampanhas === f}">${f}</button>`).join("")}
        </div>
      </div>
      <div class="rolagem">
        ${lista.length ? `
        <table>
          <thead><tr>
            ${colunas.map(c => `
              <th class="ordenavel" data-campo="${c.campo}" ${c.largura ? `style="width:${c.largura}"` : ""}
                  ${campo === c.campo ? `aria-sort="${sentido === 1 ? "ascending" : "descending"}"` : ""}>
                ${c.nome}<span class="sinal">${campo === c.campo ? (sentido === 1 ? "↑" : "↓") : "↕"}</span>
              </th>`).join("")}
          </tr></thead>
          <tbody>
            ${lista.map(c => `
              <tr class="linha-clicavel ${c.favorita ? "destacada" : ""}" data-id="${seguro(c.id)}">
                <td><button class="icone-btn estrela parar" data-id="${seguro(c.id)}" title="Destacar" style="border:0;background:none;color:${c.favorita ? "var(--rosa)" : "var(--rosa-dourado)"}">${c.favorita ? "★" : "☆"}</button></td>
                <td>${seguro(c.campanha)}</td>
                <td>${seguro(c.cliente)}</td>
                <td><span class="pilula ${c.tipo === "Publicidade" ? "p-publicidade" : "p-conteudo"}">${seguro(c.tipo)}</span></td>
                <td><span class="pilula p-funil">${seguro(c.status)}</span></td>
                <td>${numero(c.qtd)}</td>
                <td>${moeda(c.valor)}</td>
                <td>${dataBR(c.prazo)} ${avisoPrazo(c)}</td>
                <td><span class="pilula ${c.pagamento === "pago" ? "p-pago" : "p-pendente"}">${seguro(c.pagamento)}</span></td>
              </tr>`).join("")}
          </tbody>
        </table>` : `<p class="vazio-tabela">${total ? "Nenhuma campanha com esse filtro." : "Nenhuma campanha cadastrada ainda."}</p>`}
      </div>
    </section>
  `;

  const campoBusca = pegar("#buscaCampanhas");
  campoBusca.addEventListener("input", () => {
    estado.buscaCampanhas = campoBusca.value;
    desenharCampanhas();
    const novo = pegar("#buscaCampanhas");
    novo.focus(); novo.setSelectionRange(novo.value.length, novo.value.length);
  });
  pegarTodos("[data-filtro]").forEach(b => b.addEventListener("click", () => { estado.filtroCampanhas = b.dataset.filtro; desenharCampanhas(); }));
  pegarTodos("th[data-campo]").forEach(th => th.addEventListener("click", () => {
    if(estado.ordem.campo === th.dataset.campo) estado.ordem.sentido *= -1;
    else { estado.ordem.campo = th.dataset.campo; estado.ordem.sentido = 1; }
    desenharCampanhas();
  }));
  pegar("#novaCampanha").addEventListener("click", () => formularioCampanha(null));
  pegar("#baixarCampanhas").addEventListener("click", () => {
    baixarCSV("minhas-campanhas.csv",
      ["Campanha","Cliente","Tipo","Status","Qtd","Valor","Prazo","Pagamento","Ativa"],
      lista.map(c => [c.campanha, c.cliente, c.tipo, c.status, numero(c.qtd), numero(c.valor).toFixed(2).replace(".", ","), dataBR(c.prazo), c.pagamento, c.ativa === false ? "não" : "sim"]));
  });
  pegarTodos(".estrela").forEach(b => b.addEventListener("click", async (e) => {
    e.stopPropagation();
    const c = todas.find(x => String(x.id) === b.dataset.id);
    if(!c) return;
    if(await gravar("campanhas", { favorita: !c.favorita }, c.id)){ await carregarTudo(); desenhar(); }
  }));
  pegarTodos("tbody .linha-clicavel").forEach(linha => linha.addEventListener("click", (e) => {
    if(e.target.closest(".parar")) return;
    formularioCampanha(todas.find(c => String(c.id) === linha.dataset.id));
  }));
}

function formularioCampanha(campanha){
  const c = campanha || {};
  abrirJanela(campanha ? "Editar campanha" : "Nova campanha", `
    <form id="formCampanha">
      <div class="campos">
        <div class="campo largo"><label for="k-campanha">Campanha</label><input id="k-campanha" required value="${seguro(c.campanha)}"></div>
        <div class="campo"><label for="k-cliente">Cliente</label><input id="k-cliente" value="${seguro(c.cliente)}"></div>
        <div class="campo"><label for="k-tipo">Tipo</label>
          <select id="k-tipo">
            <option ${c.tipo === "Publicidade" ? "" : "selected"}>Conteúdo</option>
            <option ${c.tipo === "Publicidade" ? "selected" : ""}>Publicidade</option>
          </select>
        </div>
        <div class="campo"><label for="k-status">Status</label>
          <select id="k-status">${FUNIL.map(s => `<option ${c.status === s ? "selected" : ""}>${s}</option>`).join("")}</select>
        </div>
        <div class="campo"><label for="k-qtd">Quantidade de vídeos</label><input id="k-qtd" type="number" min="0" value="${c.qtd == null ? 1 : numero(c.qtd)}"></div>
        <div class="campo"><label for="k-valor">Valor total</label><input id="k-valor" type="number" step="0.01" min="0" value="${numero(c.valor)}"></div>
        <div class="campo"><label for="k-prazo">Prazo</label><input id="k-prazo" type="date" value="${c.prazo ? String(c.prazo).slice(0,10) : ""}"></div>
        <div class="campo"><label for="k-pagamento">Pagamento</label>
          <select id="k-pagamento">
            <option ${c.pagamento === "pago" ? "" : "selected"}>pendente</option>
            <option ${c.pagamento === "pago" ? "selected" : ""}>pago</option>
          </select>
        </div>
        <div class="campo"><label for="k-ativa">Ativa</label>
          <select id="k-ativa">
            <option value="sim" ${c.ativa === false ? "" : "selected"}>Sim</option>
            <option value="nao" ${c.ativa === false ? "selected" : ""}>Não</option>
          </select>
        </div>
      </div>
      <div class="acoes-janela">
        ${campanha ? `<button type="button" class="btn btn-simples apagar" id="apagarCampanha">Apagar</button>` : ""}
        <button type="button" class="btn btn-simples" id="cancelar">Cancelar</button>
        <button type="submit" class="btn btn-principal">Salvar</button>
      </div>
    </form>
  `);
  pegar("#cancelar").addEventListener("click", fecharJanela);
  if(campanha){
    pegar("#apagarCampanha").addEventListener("click", async () => {
      if(!confirm('Apagar a campanha "' + c.campanha + '"?')) return;
      if(await apagarLinha("campanhas", c.id)){ fecharJanela(); recado("Campanha apagada."); await carregarTudo(); desenhar(); }
    });
  }
  pegar("#formCampanha").addEventListener("submit", async (e) => {
    e.preventDefault();
    const linha = {
      campanha: pegar("#k-campanha").value.trim(),
      cliente: pegar("#k-cliente").value.trim(),
      tipo: pegar("#k-tipo").value,
      status: pegar("#k-status").value,
      qtd: numero(pegar("#k-qtd").value),
      valor: numero(pegar("#k-valor").value),
      prazo: pegar("#k-prazo").value || null,
      pagamento: pegar("#k-pagamento").value,
      ativa: pegar("#k-ativa").value === "sim"
    };
    if(!linha.campanha){ recado("O nome da campanha é obrigatório.", true); return; }
    if(await gravar("campanhas", linha, c.id)){
      fecharJanela(); recado("Campanha salva."); await carregarTudo(); desenhar();
    }
  });
}

/* ============================================================
   ABA 5: CHECKLIST DO PORTFÓLIO
   Todo o conteúdo vem do arquivo js/biblioteca.js, sem mudar nada.
   ============================================================ */
const SUBABAS = [
  { id:"checklist",   nome:"Checklist do portfólio" },
  { id:"referencias", nome:"Referências de vídeo" },
  { id:"roteiros",    nome:"Roteiros" },
  { id:"ideias",      nome:"Ideias por nicho" },
  { id:"revisao",     nome:"Revisar meu roteiro" }
];

async function marcarItem(chave, marcado){
  estado.dados.marcados[chave] = marcado;
  if(!window.sb) return;
  try{
    const { error } = await window.sb.from("marcados").upsert({ chave, marcado }, { onConflict:"chave" });
    if(error) recado("Marquei aqui na tela, mas não consegui salvar no banco.", true);
  }catch(e){
    recado("Marquei aqui na tela, mas não consegui salvar no banco.", true);
  }
}

function desenharChecklist(){
  pegar("#acoesTopo").innerHTML = "";
  const B = window.Biblioteca;

  if(!B){
    pegar("#area").innerHTML = `<p class="recado">Não encontrei o arquivo js/biblioteca.js. Assim que ele estiver publicado junto com o painel, o conteúdo aparece aqui.</p>`;
    return;
  }

  const abas = `<div class="subabas">${SUBABAS.map(s => `<button class="subaba" data-sub="${s.id}" aria-pressed="${estado.subaba === s.id}">${s.nome}</button>`).join("")}</div>`;
  let corpo = "";

  if(estado.subaba === "checklist")   corpo = blocoChecklist(B.CHECKLIST || []);
  if(estado.subaba === "referencias") corpo = blocoReferencias(B.REFERENCIAS || []);
  if(estado.subaba === "roteiros")    corpo = blocoRoteiros(B.TIPOS || []);
  if(estado.subaba === "ideias")      corpo = blocoIdeias(B.NICHOS || []);
  if(estado.subaba === "revisao")     corpo = blocoRevisao(B.REVISAO || []);

  pegar("#area").innerHTML = abas + corpo;

  pegarTodos("[data-sub]").forEach(b => b.addEventListener("click", () => { estado.subaba = b.dataset.sub; desenharChecklist(); }));

  pegarTodos(".secao-topo").forEach(b => b.addEventListener("click", () => {
    const id = b.dataset.secao;
    estado.secoesAbertas[id] = !estado.secoesAbertas[id];
    desenharChecklist();
  }));

  pegarTodos(".item-check input").forEach(caixa => caixa.addEventListener("change", async () => {
    await marcarItem(caixa.dataset.chave, caixa.checked);
    desenharChecklist();
  }));

  pegarTodos("[data-ref]").forEach(b => b.addEventListener("click", () => {
    const ref = (window.Biblioteca.REFERENCIAS || []).find(r => r.id === b.dataset.ref);
    if(ref) verReferencia(ref);
  }));
}

function blocoChecklist(secoes){
  let totalItens = 0, totalPronto = 0;
  secoes.forEach((s,si) => (s.itens || []).forEach((it,ii) => {
    totalItens++;
    if(estado.dados.marcados["c" + si + "-" + ii]) totalPronto++;
  }));
  const geral = totalItens > 0 ? Math.round((totalPronto / totalItens) * 100) : 0;

  return `
    <section class="cartao">
      <div class="cartao-topo">
        <h2>${totalPronto} de ${totalItens} itens prontos</h2>
        <span style="font-size:.8rem;color:var(--magenta)">${geral}%</span>
      </div>
      <div class="cartao-corpo"><div class="progresso"><i style="width:${geral}%"></i></div></div>
    </section>
    ${secoes.map((s,si) => {
      const itens = s.itens || [];
      const prontos = itens.filter((it,ii) => estado.dados.marcados["c" + si + "-" + ii]).length;
      const pct = itens.length > 0 ? Math.round((prontos / itens.length) * 100) : 0;
      const aberta = !!estado.secoesAbertas["c" + si];
      return `
      <div class="secao-check">
        <button class="secao-topo" data-secao="c${si}" aria-expanded="${aberta}">
          <span style="font-size:1.3rem">${seguro(s.emoji)}</span>
          <span style="flex:1">
            <h3>${seguro(s.nome)}</h3>
            <small>${seguro(s.resumo)}</small>
          </span>
          <span class="barra-mini">
            <span class="progresso"><i style="width:${pct}%"></i></span>
            <small style="font-size:.68rem;color:var(--tinta-suave)">${prontos}/${itens.length}</small>
          </span>
        </button>
        ${aberta ? `
        <div class="secao-corpo">
          <p class="porque">${seguro(s.porque)}</p>
          ${itens.map((it,ii) => {
            const chave = "c" + si + "-" + ii;
            const feito = !!estado.dados.marcados[chave];
            return `<label class="item-check ${feito ? "pronto" : ""}">
              <input type="checkbox" data-chave="${chave}" ${feito ? "checked" : ""}>
              <span><b>${seguro(it.t)}</b><small>${seguro(it.d)}</small></span>
            </label>`;
          }).join("")}
        </div>` : ""}
      </div>`;
    }).join("")}
  `;
}

function blocoReferencias(refs){
  return `
    <section class="cartao">
      <div class="cartao-topo"><h2>Referências de vídeo</h2><span style="font-size:.78rem;color:var(--tinta-suave)">Clique em um cartão para ver a ficha completa.</span></div>
      <div class="cartao-corpo">
        <div class="cartoes-ref">
          ${refs.map(r => `
            <button class="ref" data-ref="${seguro(r.id)}">
              <span class="ref-capa" style="background:linear-gradient(160deg,#ffd9ea,#ffe8f3)">${seguro(r.emoji)}</span>
              <span class="ref-info">
                <b>${seguro(r.titulo)}</b>
                <small>${seguro(r.estilo)} · ${seguro(r.duracao)}<br>${seguro(r.marca)}</small>
              </span>
            </button>`).join("")}
        </div>
      </div>
    </section>`;
}

function verReferencia(r){
  abrirJanela(r.titulo, `
    <p style="margin-top:0"><span class="pilula p-funil">${seguro(r.estilo)}</span> <span class="pilula p-prazo">${seguro(r.duracao)}</span> <span class="pilula p-lead">${seguro(r.audiencia)}</span></p>
    <p class="porque"><b>Gancho:</b> ${seguro(r.gancho)}</p>
    <h3 style="font-size:.9rem;margin-top:16px">Por que funciona</h3><p>${seguro(r.porque)}</p>
    <h3 style="font-size:.9rem;margin-top:14px">O diferencial</h3><p>${seguro(r.diferencial)}</p>
    <h3 style="font-size:.9rem;margin-top:14px">Erro comum</h3><p>${seguro(r.erro)}</p>
    <h3 style="font-size:.9rem;margin-top:14px">Roteiro</h3>
    ${(r.roteiro || []).map(b => `<div class="bloco-tempo"><span class="tempo">${seguro(b.t)}</span><span class="texto">${b.o}</span></div>`).join("")}
    <div class="acoes-janela">
      <button type="button" class="btn btn-simples" id="cancelar">Fechar</button>
      ${r.youtube ? `<a class="btn btn-principal" href="${seguro(r.youtube)}" target="_blank" rel="noopener">Assistir</a>` : ""}
    </div>
  `, true);
  pegar("#cancelar").addEventListener("click", fecharJanela);
}

function blocoRoteiros(tipos){
  return tipos.map((t,i) => {
    const aberta = !!estado.secoesAbertas["t" + i];
    return `
    <div class="secao-check">
      <button class="secao-topo" data-secao="t${i}" aria-expanded="${aberta}">
        <span style="font-size:1.3rem">${seguro(t.emoji)}</span>
        <span style="flex:1"><h3>${seguro(t.nome)}</h3><small>${seguro(t.duracao)}</small></span>
      </button>
      ${aberta ? `
      <div class="secao-corpo">
        <p class="porque"><b>Quando usar:</b> ${seguro(t.porque)}</p>
        ${(t.beats || []).map(b => `<div class="bloco-tempo"><span class="tempo">${seguro(b.t)}</span><span class="texto">${b.o}</span></div>`).join("")}
        ${(t.erros || []).length ? `<h4 style="font-size:.82rem;margin-top:14px">Erros comuns</h4><ul class="lista-simples">${t.erros.map(e => `<li>${seguro(e)}</li>`).join("")}</ul>` : ""}
      </div>` : ""}
    </div>`;
  }).join("");
}

function blocoIdeias(nichos){
  return nichos.map((n,i) => {
    const aberta = !!estado.secoesAbertas["n" + i];
    return `
    <div class="secao-check">
      <button class="secao-topo" data-secao="n${i}" aria-expanded="${aberta}">
        <span style="font-size:1.3rem">${seguro(n.emoji)}</span>
        <span style="flex:1"><h3>${seguro(n.nome)}</h3><small>${(n.ideias || []).length} ideias com gancho pronto</small></span>
      </button>
      ${aberta ? `
      <div class="secao-corpo">
        ${(n.ideias || []).map(idi => `<div class="ideia"><b>${seguro(idi.t)}</b><small>Gancho: ${seguro(idi.gancho)}</small></div>`).join("")}
      </div>` : ""}
    </div>`;
  }).join("");
}

function blocoRevisao(blocos){
  return `
    <section class="cartao">
      <div class="cartao-topo"><h2>Cole aqui o seu roteiro</h2></div>
      <div class="cartao-corpo">
        <textarea class="roteiro" id="meuRoteiro" placeholder="Cole o roteiro que você escreveu e vá conferindo os blocos abaixo."></textarea>
      </div>
    </section>
    ${blocos.map((b,bi) => `
      <section class="cartao">
        <div class="cartao-topo"><h2>${seguro(b.emoji)} ${seguro(b.bloco)}</h2></div>
        <div class="cartao-corpo">
          ${(b.itens || []).map((it,ii) => {
            const chave = "r" + bi + "-" + ii;
            const feito = !!estado.dados.marcados[chave];
            return `<label class="item-check ${feito ? "pronto" : ""}">
              <input type="checkbox" data-chave="${chave}" ${feito ? "checked" : ""}>
              <span><b>${seguro(it.t)}</b><small>${seguro(it.d)}</small></span>
            </label>`;
          }).join("")}
        </div>
      </section>`).join("")}
  `;
}

/* ============================================================
   PORTA DE ENTRADA: confere a sessão antes de mostrar qualquer coisa
   ============================================================ */
async function comecar(){
  if(!window.sb){
    pegar("#verificando").innerHTML = "Não consegui falar com o banco. Recarregue a página em instantes.";
    return;
  }
  let sessao = null;
  try{
    const { data } = await window.sb.auth.getSession();
    sessao = data ? data.session : null;
  }catch(e){ sessao = null; }

  if(!sessao){
    window.location.replace("/login/");
    return;
  }

  estado.email = (sessao.user && sessao.user.email) || "";
  pegar("#meuEmail").textContent = estado.email;

  await carregarTudo();

  pegar("#verificando").remove();
  pegar("#app").hidden = false;

  montarMenu();
  desenhar();
}

/* botões que existem o tempo todo */
document.addEventListener("DOMContentLoaded", () => {
  pegar("#fecharJanela").addEventListener("click", fecharJanela);
  pegar("#fundoJanela").addEventListener("click", (e) => { if(e.target.id === "fundoJanela") fecharJanela(); });
  document.addEventListener("keydown", (e) => { if(e.key === "Escape") fecharJanela(); });

  pegar("#abrirMenu").addEventListener("click", () => {
    pegar("#menuLateral").classList.add("aberto");
    pegar("#tapaMenu").classList.add("aberto");
  });
  pegar("#tapaMenu").addEventListener("click", fecharGaveta);

  pegar("#botaoSair").addEventListener("click", async () => {
    try{ await window.sb.auth.signOut(); }catch(e){}
    window.location.replace("/login/");
  });

  comecar();
});
