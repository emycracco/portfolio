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
  subir:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V5M8 9l4-4 4 4M4 19h16"/></svg>',
  baixar:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v10M8 11l4 4 4-4M4 19h16"/></svg>',
  lupa:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/></svg>',
  olhoAberto:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.6"/></svg>',
  olhoFechado:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 5l16 14M6.7 7.7C3.9 9.3 2 12 2 12s3.6 6 10 6c1.8 0 3.4-.5 4.7-1.2M10 6.2c.6-.1 1.3-.2 2-.2 6.4 0 10 6 10 6s-1 1.6-2.8 3.1"/></svg>',
  lapis:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="M14.5 6.5l3 3"/></svg>',
  lixo:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 7V5h4v2M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>',
  arrastar:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01"/></svg>',
  seta:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
  conteudo:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/></svg>',
  reciclar:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9a8 8 0 0 1 13.3-3.5L20 8"/><path d="M20 4v4h-4"/><path d="M20 15a8 8 0 0 1-13.3 3.5L4 16"/><path d="M4 20v-4h4"/></svg>',
  cupons:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 9V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v2a2.5 2.5 0 0 1 0 6v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2a2.5 2.5 0 0 1 0-6Z"/><path d="M13 7v2M13 14v3"/></svg>',
  copiar:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 6H6a2 2 0 0 0-2 2v9"/></svg>',
  link:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a4 4 0 0 0 5.7 0l3-3a4 4 0 1 0-5.7-5.7L11.3 6"/><path d="M14 11a4 4 0 0 0-5.7 0l-3 3a4 4 0 1 0 5.7 5.7l1.7-1.7"/></svg>',
  prospeccao:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5 12 13l8.5-6.5"/></svg>',
  aviao:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3 10.5 13.5M21 3l-6.5 18-4-8-8-4L21 3Z"/></svg>',
  zap:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 0 1-11.9 7L4 20l1.1-4A8 8 0 1 1 20 12Z"/></svg>'
};

/* ------------------------------------------------------------
   ESTADO: tudo o que o painel guarda enquanto está aberto
   ------------------------------------------------------------ */
const ABAS = [
  { id:"portfolio",  grupo:"meu site",     nome:"Portfólio",  sub:"Como o seu site está indo." },
  { id:"marcas",     grupo:"meu site",     nome:"Marcas",     sub:"A sua base de contatos de empresa." },
  { id:"cupons",     grupo:"meu site",     nome:"Cupons",     sub:"Seus cupons e links de afiliada, prontos para enviar." },
  { id:"prospeccao", grupo:"meu site",     nome:"Prospecção", sub:"Mandar a sua apresentação para várias marcas de uma vez." },
  { id:"conteudo",   grupo:"minha rotina", nome:"Conteúdo",   sub:"A sua semana de postagens, canal por canal." },
  { id:"calendario", grupo:"minha rotina", nome:"Calendário", sub:"O mês inteiro de gravar, editar e postar." },
  { id:"campanhas",  grupo:"minha rotina", nome:"Campanhas",  sub:"Trabalhos, valores e prazos." },
  { id:"checklist",  grupo:"minha rotina", nome:"Checklist",  sub:"O que ainda falta no seu portfólio." }
];

const FUNIL = ["Briefing", "Roteiro", "Aprovação Roteiro", "Gravação", "Edição", "Aprovado", "Entregue"];

/* Os seus canais, na ordem em que aparecem na grade da semana.
   "meta" é quantos vídeos por dia você combinou consigo mesma.
   "fonte" marca o canal de onde sai o conteúdo original. */
const CANAIS = [
  { id:"tiktok",         nome:"TikTok Shop",   curto:"TikTok",      meta:4, fonte:true,  cor:"p-editar" },
  { id:"instagram_shop", nome:"Insta shop",    curto:"Insta shop",  meta:1, fonte:false, cor:"p-conteudo" },
  { id:"shopee",         nome:"Shopee Vídeos", curto:"Shopee",      meta:2, fonte:false, cor:"p-pago" },
  { id:"instagram",      nome:"Insta pessoal", curto:"Insta",       meta:0, fonte:false, cor:"p-funil" }
];
const ETAPAS = ["ideia", "gravado", "editado", "postado"];
const TIPOS_CONTEUDO = ["review", "unboxing", "rotina", "tutorial", "antes e depois", "oferta do dia", "trend", "resposta a comentário", "bastidores", "vitrine"];
const SITUACOES = ["Lead", "Conversando", "Cliente", "Parada"];
/* sugestões de nicho, só para facilitar o preenchimento.
   Você pode escrever qualquer outro, o campo é livre. */
const NICHOS_SUGERIDOS = ["moda fitness", "suplementos", "cosméticos", "skincare", "moda", "beleza", "tech", "casa", "pet", "alimentação"];
const TIPOS_AGENDA = ["gravar", "editar", "postar"];

const estado = {
  aba: "portfolio",
  email: "",
  faltando: [],
  sessaoExpirou: false,
  dados: { videos:[], marcas:[], calendario:[], campanhas:[], marcados:{}, visitas:[], cupons:[], conteudos:[], email_envios:[], email_optout:[] },

  /* --- a aba Prospecção --- */
  prosp: {
    publico: "selecionadas",   /* para quem vai: selecionadas, teste, todas ou uma situação */
    modo: "texto",             /* como escrever: texto fácil ou HTML */
    entrega: "resend",         /* resend (manda sozinho) ou rascunho (plano B pelo Gmail) */
    assunto: "",
    texto: "",
    html: "",
    botaoTexto: "",
    botaoLink: "",
    pularRepetidos: true,
    buscaHistorico: "",
    enviando: false,
    progresso: null,           /* { feitos, total } enquanto dispara */
    resumo: null,              /* { enviados, falhas, pulados, cotaAcabou } no fim */
    filaRascunho: null,        /* a fila do plano B */
    posicaoFila: 0
  },
  semana: new Date(), filtroConteudo: "Todos",
  buscaCupons: "", filtroCupons: "Todos",
  buscaMarcas: "", filtroSituacao: "Todas", filtroNicho: "Todos", soFavoritas: false,
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
  /* sessão vencida é outro assunto: não adianta falar de tabela */
  if(texto.includes("jwt") || texto.includes("expired") || texto.includes("invalid token")){
    estado.sessaoExpirou = true;
    return;
  }
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

/* Faz uma leitura só, sem avisar nada. */
async function tentarLer(tabela, campoOrdem, crescente){
  let consulta = window.sb.from(tabela).select("*");
  if(campoOrdem) consulta = consulta.order(campoOrdem, { ascending: crescente !== false });
  return await consulta;
}

/* Lê a tabela e, se falhar, espera um pouco e tenta de novo.
   Internet oscila, e uma falha de um segundo não é motivo para
   encher a tela de aviso. Só avisa se falhar nas duas vezes. */
async function lerTabela(tabela, campoOrdem, crescente){
  if(!window.sb){ anotarFalta(tabela, "sem conexão"); return []; }
  for(let tentativa = 1; tentativa <= 2; tentativa++){
    try{
      const { data, error } = await tentarLer(tabela, campoOrdem, crescente);
      if(!error) return data || [];

      const texto = String(error.message || "").toLowerCase();
      const semJeito = texto.includes("does not exist") || texto.includes("not find the table") ||
                       texto.includes("schema cache") || texto.includes("column");
      /* erro de tabela faltando não melhora tentando de novo */
      if(semJeito || tentativa === 2){ anotarFalta(tabela, error.message); return []; }
    }catch(e){
      if(tentativa === 2){ anotarFalta(tabela, e && e.message); return []; }
    }
    await new Promise(r => setTimeout(r, 700));
  }
  return [];
}

/* Quando o banco reclama de uma coluna que ainda não existe,
   ele diz o nome dela na mensagem. Esta função pega esse nome. */
function colunaQueFaltou(mensagem){
  const texto = String(mensagem || "");
  const achou = texto.match(/Could not find the '([^']+)' column/i)
             || texto.match(/column "([^"]+)" of relation/i)
             || texto.match(/column ([a-z_]+) does not exist/i);
  return achou ? achou[1] : null;
}

/* Grava tirando do caminho as colunas que ainda não existem no banco,
   em vez de perder tudo. Devolve também quais colunas ficaram de fora. */
async function gravarTolerante(tabela, linhas, id){
  let dados = Array.isArray(linhas)
    ? linhas.map(l => Object.assign({}, l))
    : Object.assign({}, linhas);
  const deixadasDeFora = [];

  for(let tentativa = 0; tentativa < 5; tentativa++){
    const resposta = id
      ? await window.sb.from(tabela).update(dados).eq("id", id)
      : await window.sb.from(tabela).insert(dados);

    if(!resposta.error) return { ok:true, deixadasDeFora };

    const coluna = colunaQueFaltou(resposta.error.message);
    if(!coluna) return { ok:false, erro:resposta.error.message, deixadasDeFora };

    deixadasDeFora.push(coluna);
    if(Array.isArray(dados)) dados = dados.map(l => { const copia = Object.assign({}, l); delete copia[coluna]; return copia; });
    else { dados = Object.assign({}, dados); delete dados[coluna]; }
  }
  return { ok:false, erro:"não consegui ajustar as colunas", deixadasDeFora };
}

async function gravar(tabela, linha, id){
  if(!window.sb){ recado("Sem conexão com o banco.", true); return false; }
  try{
    const r = await gravarTolerante(tabela, linha, id);
    if(!r.ok){ recado("Não consegui salvar: " + r.erro, true); return false; }
    if(r.deixadasDeFora.length){
      recado("Salvei, mas " + r.deixadasDeFora.join(" e ") + " não existe no banco ainda. Rode o banco.sql no Supabase.", true);
    }
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
  estado.sessaoExpirou = false;
  const [videos, marcas, calendario, campanhas, marcados, visitas, cupons, conteudos, envios, optout] = await Promise.all([
    lerTabela("videos", "ordem", true),
    lerTabela("marcas", "criado_em", false),
    lerTabela("calendario", "data", true),
    lerTabela("campanhas", "criado_em", false),
    lerTabela("marcados"),
    lerTabela("visitas", "data", false),
    lerTabela("cupons", "criado_em", false),
    lerTabela("conteudos", "data", true),
    lerTabela("email_envios", "criado_em", false),
    lerTabela("email_optout", "criado_em", false)
  ]);
  estado.dados.email_envios = envios;
  estado.dados.email_optout = optout;
  estado.dados.cupons = cupons;
  estado.dados.conteudos = conteudos;
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
  if(estado.sessaoExpirou){
    pegar("#avisosFalta").innerHTML = `<div class="aviso-falta">A sua sessão expirou, por isso alguns dados não carregaram.
      <button class="btn-mini" id="entrarDeNovo" style="margin-left:8px">Entrar de novo</button></div>`;
    const botao = pegar("#entrarDeNovo");
    if(botao) botao.addEventListener("click", () => window.location.replace("/login/"));
  } else {
    pegar("#avisosFalta").innerHTML = estado.faltando.length
      ? `<div class="aviso-falta">O painel abriu, mas ${estado.faltando.join(", ")}. O resto continua funcionando. Se a tabela ainda não existir, rode o arquivo banco.sql no Supabase. Se foi só a internet oscilando, recarregue a página.</div>`
      : "";
  }

  if(estado.aba === "portfolio")  desenharPortfolio();
  if(estado.aba === "marcas")     desenharMarcas();
  if(estado.aba === "cupons")     desenharCupons();
  if(estado.aba === "prospeccao") desenharProspeccao();
  if(estado.aba === "conteudo")   desenharConteudo();
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

/* "agora mesmo", "há 12 minutos", "ontem": mais fácil de ler
   do que uma data seca quando o que importa é a novidade. */
function quandoChegou(iso){
  const q = Date.parse(iso || "");
  if(!Number.isFinite(q)) return "";
  const seg = Math.max(0, Math.round((Date.now() - q) / 1000));
  if(seg < 60)    return "agora mesmo";
  const min = Math.round(seg / 60);
  if(min < 60)    return "há " + min + (min === 1 ? " minuto" : " minutos");
  const h = Math.round(min / 60);
  if(h < 24)      return "há " + h + (h === 1 ? " hora" : " horas");
  const d = Math.round(h / 24);
  if(d === 1)     return "ontem";
  if(d < 30)      return "há " + d + " dias";
  return dataBR(iso);
}

/* Enquanto você estiver na aba Portfólio, o painel confere o banco
   sozinho de tempo em tempo, para um contato novo aparecer sem
   você precisar recarregar a página. */
let relogioLeads = null;
function ligarAtualizacaoAutomatica(){
  clearInterval(relogioLeads);
  relogioLeads = setInterval(async () => {
    if(estado.aba !== "portfolio") return;            /* só nesta aba */
    if(document.hidden) return;                       /* aba do navegador em segundo plano */
    if(pegar("#fundoJanela").classList.contains("aberto")) return;  /* não mexe com formulário aberto */
    const antes = (estado.dados.marcas || []).length;
    await carregarTudo();
    const depois = (estado.dados.marcas || []).length;
    desenharPortfolio();
    if(depois > antes) recado("Chegou contato novo pelo site.");
  }, 45000);
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

  /* ---- QUEM PREENCHEU O FORMULÁRIO DO SITE ----
     Só entram as marcas com origem "site", para não misturar
     com os leads que vieram da planilha importada.
     Se a coluna origem ainda não existir no banco, a lista fica
     vazia e o aviso explica o que fazer, sem quebrar nada. */
  const temColunaOrigem = (estado.dados.marcas || []).some(m => "origem" in m);
  const leadsDoSite = (estado.dados.marcas || [])
    .filter(m => String(m.origem || "").toLowerCase() === "site")
    .sort((a,b) => String(b.criado_em || "").localeCompare(String(a.criado_em || "")));

  /* "novo" é o que chegou nas últimas 24 horas */
  const agora = Date.now();
  const ehNovo = (m) => {
    const q = Date.parse(m.criado_em || "");
    return Number.isFinite(q) && (agora - q) < 24 * 60 * 60 * 1000;
  };
  const novos = leadsDoSite.filter(ehNovo).length;

  pegar("#acoesTopo").innerHTML = `<button class="btn btn-principal" id="novoVideo">${ICONE.mais} Novo vídeo</button>`;

  pegar("#area").innerHTML = `
    <div class="faixa-numeros">
      <div class="numero"><b>${visitas14}</b><small>visitas em 14 dias</small></div>
      <div class="numero"><b>${visitasHoje}</b><small>visitas hoje</small></div>
      <div class="numero"><b>${noAr}</b><small>vídeos no ar</small></div>
      <div class="numero"><b style="font-size:1rem">${seguro(nichoForte)}</b><small>nicho mais forte</small></div>
      <div class="numero"><b style="font-size:1rem">${seguro(origemTop)}</b><small>de onde mais vêm</small></div>
    </div>

    <section class="cartao cartao-leads">
      <div class="cartao-topo">
        <h2>Quem preencheu o formulário do site
          ${novos ? `<span class="selo-novo">${novos} ${novos === 1 ? "novo" : "novos"}</span>` : ""}
        </h2>
        <span class="atualiza-sozinho" id="avisoAtualiza">confere sozinho a cada 45 segundos</span>
      </div>
      <div class="rolagem">
        ${leadsDoSite.length ? `
        <table>
          <thead><tr><th>Quando</th><th>Nome</th><th>E-mail</th><th>Mensagem</th><th>Situação</th></tr></thead>
          <tbody>
            ${leadsDoSite.slice(0, 25).map(m => `
              <tr class="linha-clicavel lead-site ${ehNovo(m) ? "chegou-agora" : ""}" data-id="${seguro(m.id)}">
                <td style="white-space:nowrap">${quandoChegou(m.criado_em)}</td>
                <td><b>${seguro(m.nome)}</b></td>
                <td>${m.email ? `<a href="mailto:${seguro(m.email)}" class="parar">${seguro(m.email)}</a>` : ""}</td>
                <td style="max-width:360px">${seguro(m.obs)}</td>
                <td><span class="pilula p-${String(m.situacao||"lead").toLowerCase()}">${seguro(m.situacao)}</span></td>
              </tr>`).join("")}
          </tbody>
        </table>` : `<p class="vazio-tabela">${temColunaOrigem
            ? "Ninguém preencheu o formulário ainda. Quando alguém preencher, aparece aqui na hora, antes de você precisar abrir a aba Marcas."
            : "Falta rodar uma linha de SQL no Supabase para separar os contatos do site dos leads da planilha. Peça para o Claude."}</p>`}
      </div>
    </section>

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

  /* clicar no contato abre a ficha dele, igual na aba Marcas */
  pegarTodos(".lead-site").forEach(linha => linha.addEventListener("click", (e) => {
    if(e.target.closest(".parar")) return;
    const m = (estado.dados.marcas || []).find(x => String(x.id) === linha.dataset.id);
    if(m) formularioMarca(m);
  }));
  ligarAtualizacaoAutomatica();

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
      String(m.email||"").toLowerCase().includes(busca) ||
      String(m.nicho||"").toLowerCase().includes(busca);
    const situacaoOk = estado.filtroSituacao === "Todas" || m.situacao === estado.filtroSituacao;
    const nichoOk = estado.filtroNicho === "Todos" ||
      (estado.filtroNicho === "sem nicho" ? !m.nicho : m.nicho === estado.filtroNicho);
    const favoritaOk = !estado.soFavoritas || m.favorita;
    return combina && situacaoOk && nichoOk && favoritaOk;
  })
  /* as favoritas ficam sempre no topo da lista */
  .sort((a,b) => (b.favorita ? 1 : 0) - (a.favorita ? 1 : 0));

  /* a lista de nichos sai das próprias marcas cadastradas */
  const nichosNaBase = [...new Set(todas.map(m => m.nicho).filter(Boolean))].sort();
  const temSemNicho = todas.some(m => !m.nicho);

  pegar("#acoesTopo").innerHTML = `
    <button class="btn btn-simples" id="importarMarcas">${ICONE.subir} Importar planilha</button>
    <input type="file" id="arquivoCSV" accept=".csv,text/csv,text/plain" hidden>
    <button class="btn btn-simples" id="baixarMarcas">${ICONE.baixar} Baixar CSV</button>
    <button class="btn btn-principal" id="novaMarca">${ICONE.mais} Nova marca</button>`;

  pegar("#area").innerHTML = `
    <section class="cartao">
      <div class="cartao-topo">
        <div class="busca">${ICONE.lupa}<input id="buscaMarcas" placeholder="buscar por nome, @ ou e-mail" value="${seguro(estado.buscaMarcas)}"></div>
        <div class="grupo-filtro">
          <button class="filtro" id="soFavoritas" aria-pressed="${estado.soFavoritas}" title="Mostrar só as favoritas">★ favoritas</button>
          ${["Todas"].concat(SITUACOES).map(s => `<button class="filtro" data-situacao="${s}" aria-pressed="${estado.filtroSituacao === s}">${s}</button>`).join("")}
        </div>
        ${(nichosNaBase.length || temSemNicho) ? `
        <select class="filtro" id="filtroNicho" style="padding:6px 12px">
          <option value="Todos">todos os nichos</option>
          ${nichosNaBase.map(n => `<option value="${seguro(n)}" ${estado.filtroNicho === n ? "selected" : ""}>${seguro(n)}</option>`).join("")}
          ${temSemNicho ? `<option value="sem nicho" ${estado.filtroNicho === "sem nicho" ? "selected" : ""}>sem nicho</option>` : ""}
        </select>` : ""}
      </div>
      ${(() => {
        /* resumo da seleção, para você saber quantas vão receber o próximo disparo */
        const selecionadas = todas.filter(m => m.selecionada && m.email).length;
        const visiveisComEmail = lista.filter(m => m.email).length;
        return `
        <div class="barra-selecao">
          <span class="conta-selecao">
            <b>${selecionadas}</b> ${selecionadas === 1 ? "marca selecionada" : "marcas selecionadas"} para a Prospecção
          </span>
          ${visiveisComEmail ? `<button class="btn-mini" id="selecionarVisiveis">selecionar as ${visiveisComEmail} que aparecem aqui</button>` : ""}
          ${selecionadas ? `<button class="btn-mini" id="limparSelecao">limpar seleção</button>` : ""}
          ${selecionadas ? `<button class="btn-mini" id="irProspeccao">ir para a Prospecção</button>` : ""}
        </div>`;
      })()}
      <div class="rolagem">
        ${lista.length ? `
        <table>
          <thead><tr>
            <th style="width:30px" title="Marcar para o próximo disparo"></th>
            <th style="width:34px"></th>
            <th>Marca</th><th>Nicho</th><th>Instagram</th><th>E-mail</th><th>Telefone</th>
            <th>Situação</th><th>Observação</th><th>Último contato</th>
          </tr></thead>
          <tbody>
            ${lista.map(m => `
              <tr class="linha-clicavel ${m.favorita ? "destacada" : ""}" data-id="${seguro(m.id)}">
                <td><input type="checkbox" class="caixa-marca parar" data-selecionar="${seguro(m.id)}"
                      ${m.selecionada ? "checked" : ""} ${m.email ? "" : "disabled"}
                      title="${m.email ? "Marcar para o próximo disparo" : "Esta marca não tem e-mail cadastrado"}"></td>
                <td><button class="estrela-marca parar" data-estrela="${seguro(m.id)}" title="${m.favorita ? "Tirar dos favoritos" : "Fixar no topo"}" style="border:0;background:none;font-size:1.05rem;color:${m.favorita ? "var(--rosa)" : "var(--rosa-dourado)"}">${m.favorita ? "★" : "☆"}</button></td>
                <td>${seguro(m.nome)}</td>
                <td>${m.nicho ? `<span class="pilula p-funil">${seguro(m.nicho)}</span>` : ""}</td>
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
  const seletorNicho = pegar("#filtroNicho");
  if(seletorNicho) seletorNicho.addEventListener("change", () => {
    estado.filtroNicho = seletorNicho.value; desenharMarcas();
  });
  pegar("#soFavoritas").addEventListener("click", () => {
    estado.soFavoritas = !estado.soFavoritas; desenharMarcas();
  });
  pegarTodos("[data-estrela]").forEach(b => b.addEventListener("click", async (e) => {
    e.stopPropagation();
    const m = todas.find(x => String(x.id) === b.dataset.estrela);
    if(!m) return;
    if(await gravar("marcas", { favorita: !m.favorita }, m.id)){ await carregarTudo(); desenhar(); }
  }));

  /* ---- caixinhas de seleção para o disparo ----
     A marca fica salva no banco, então você pode marcar hoje
     e disparar amanhã sem perder nada. */
  pegarTodos("[data-selecionar]").forEach(caixa => caixa.addEventListener("click", async (e) => {
    e.stopPropagation();
    const m = todas.find(x => String(x.id) === caixa.dataset.selecionar);
    if(!m) return;
    const novo = caixa.checked;
    if(await gravar("marcas", { selecionada: novo }, m.id)){
      m.selecionada = novo;
      desenharMarcas();
    } else {
      caixa.checked = !novo;   /* se não gravou, a caixinha volta ao que era */
    }
  }));

  const btnVisiveis = pegar("#selecionarVisiveis");
  if(btnVisiveis) btnVisiveis.addEventListener("click", async () => {
    const alvos = lista.filter(m => m.email && !m.selecionada);
    if(!alvos.length){ recado("Todas as que aparecem aqui já estão selecionadas."); return; }
    btnVisiveis.disabled = true;
    for(const m of alvos){
      if(await gravar("marcas", { selecionada: true }, m.id)) m.selecionada = true;
    }
    await carregarTudo();
    desenharMarcas();
    recado(alvos.length + (alvos.length === 1 ? " marca selecionada." : " marcas selecionadas."));
  });

  const btnLimpar = pegar("#limparSelecao");
  if(btnLimpar) btnLimpar.addEventListener("click", async () => {
    const alvos = todas.filter(m => m.selecionada);
    btnLimpar.disabled = true;
    for(const m of alvos){
      if(await gravar("marcas", { selecionada: false }, m.id)) m.selecionada = false;
    }
    await carregarTudo();
    desenharMarcas();
  });

  const btnIr = pegar("#irProspeccao");
  if(btnIr) btnIr.addEventListener("click", () => {
    estado.aba = "prospeccao";
    estado.prosp.publico = "selecionadas";
    desenhar();
  });
  pegar("#novaMarca").addEventListener("click", () => formularioMarca(null));

  /* importar planilha de leads */
  pegar("#importarMarcas").addEventListener("click", () => pegar("#arquivoCSV").click());
  pegar("#arquivoCSV").addEventListener("change", async (e) => {
    const arquivo = e.target.files && e.target.files[0];
    e.target.value = "";                       /* permite escolher o mesmo arquivo de novo */
    if(!arquivo) return;
    try{
      const texto = await lerArquivoTexto(arquivo);
      const linhas = lerCSV(texto);
      if(linhas.length < 2){ recado("A planilha parece vazia ou só tem o cabeçalho.", true); return; }
      janelaImportar(linhas, arquivo.name);
    }catch(erro){
      recado("Não consegui ler esse arquivo. Salve como CSV e tente de novo.", true);
    }
  });

  pegar("#baixarMarcas").addEventListener("click", () => {
    baixarCSV("minhas-marcas.csv",
      ["Marca","Nicho","Instagram","E-mail","Telefone","Situação","Observação","Último contato"],
      lista.map(m => [m.nome, m.nicho, m.instagram, m.email, m.telefone, m.situacao, m.obs, dataBR(m.ultimo_contato)]));
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

/* ============================================================
   IMPORTAR PLANILHA DE LEADS PARA A ABA MARCAS
   Lê o CSV, adivinha as colunas, mostra a prévia e só então grava.
   ============================================================ */

/* Tira acento e deixa minúsculo, para comparar nomes de coluna. */
function simplificar(texto){
  return String(texto || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/* Lê o arquivo tentando UTF-8 e, se vier com caractere estranho,
   tenta de novo no formato que o Excel do Windows costuma salvar. */
function lerArquivoTexto(arquivo){
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onerror = reject;
    leitor.onload = () => {
      const bytes = new Uint8Array(leitor.result);
      let texto = new TextDecoder("utf-8").decode(bytes);
      if(texto.includes("�")){
        try{ texto = new TextDecoder("windows-1252").decode(bytes); }catch(e){}
      }
      resolve(texto);
    };
    leitor.readAsArrayBuffer(arquivo);
  });
}

/* Transforma o texto do CSV em linhas e colunas.
   Entende ponto e vírgula ou vírgula, aspas e quebra de linha dentro do campo. */
function lerCSV(texto){
  texto = String(texto || "").replace(/^﻿/, "");
  const primeira = texto.split(/\r?\n/)[0] || "";
  const separador = (primeira.split(";").length > primeira.split(",").length) ? ";" : ",";

  const linhas = [];
  let campo = "", linha = [], dentroDeAspas = false;

  for(let i = 0; i < texto.length; i++){
    const c = texto[i];
    if(dentroDeAspas){
      if(c === '"'){
        if(texto[i+1] === '"'){ campo += '"'; i++; }
        else dentroDeAspas = false;
      } else campo += c;
    } else {
      if(c === '"') dentroDeAspas = true;
      else if(c === separador){ linha.push(campo); campo = ""; }
      else if(c === "\n"){ linha.push(campo); linhas.push(linha); linha = []; campo = ""; }
      else if(c !== "\r") campo += c;
    }
  }
  if(campo !== "" || linha.length){ linha.push(campo); linhas.push(linha); }

  return linhas
    .map(l => l.map(c => String(c).trim()))
    .filter(l => l.some(c => c !== ""));
}

/* Os campos da sua base e as palavras que ajudam a reconhecer a coluna. */
const CAMPOS_MARCA = [
  { campo:"nome",           rotulo:"Marca",
    exatas:["marca","nome","nome da marca","empresa","loja","cliente"],
    pistas:["marca","nome","empresa","loja"] },
  { campo:"instagram",      rotulo:"Instagram",
    exatas:["instagram","insta","@","@ do perfil","perfil","usuario","arroba"],
    pistas:["instagram","insta","perfil","arroba","usuario","@"] },
  { campo:"email",          rotulo:"E-mail",
    exatas:["email","e-mail","mail"],
    pistas:["email","e-mail","mail"] },
  { campo:"telefone",       rotulo:"Telefone",
    exatas:["telefone","whatsapp","whats","celular","fone"],
    pistas:["telefone","whats","celular","fone","tel","contato"] },
  { campo:"situacao",       rotulo:"Situação",
    exatas:["situacao","status","etapa","estagio"],
    pistas:["situacao","status","etapa","estagio"] },
  { campo:"nicho",          rotulo:"Nicho",
    exatas:["nicho","segmento","categoria","area","tipo"],
    pistas:["nicho","segmento","categoria"] },
  { campo:"obs",            rotulo:"Observação",
    exatas:["obs","observacao","observacoes","nota","notas","comentario"],
    pistas:["obs","observa","nota","anota","comentario","descricao","detalhe","sobre"] },
  { campo:"ultimo_contato", rotulo:"Último contato",
    exatas:["ultimo contato","data","data do contato"],
    pistas:["ultimo contato","data","quando"] }
];

/* Escolhe a coluna de cada campo dando preferência para o título
   que bate exatamente, e nunca usa a mesma coluna em dois campos. */
function adivinharColunas(cabecalhos){
  const titulos = cabecalhos.map(simplificar);
  const escolha = {};
  const usadas = new Set();

  const tentar = (campoInfo, modo) => {
    if(escolha[campoInfo.campo] >= 0) return;
    for(let i = 0; i < titulos.length; i++){
      if(usadas.has(i)) continue;
      const t = titulos[i];
      const bate = modo === "exata"
        ? campoInfo.exatas.some(p => t === simplificar(p))
        : campoInfo.pistas.some(p => t.includes(simplificar(p)));
      if(bate){ escolha[campoInfo.campo] = i; usadas.add(i); return; }
    }
  };

  CAMPOS_MARCA.forEach(c => { escolha[c.campo] = -1; });
  CAMPOS_MARCA.forEach(c => tentar(c, "exata"));
  CAMPOS_MARCA.forEach(c => tentar(c, "parecida"));

  /* Se a planilha não tiver coluna de nome, o @ do perfil vira o nome,
     que é como a marca é conhecida mesmo. Em último caso, a primeira coluna livre. */
  if(escolha.nome < 0){
    if(escolha.instagram >= 0) escolha.nome = escolha.instagram;
    else {
      for(let i = 0; i < titulos.length; i++){
        if(!usadas.has(i)){ escolha.nome = i; usadas.add(i); break; }
      }
    }
  }
  return escolha;
}

/* Aceita 2026-10-02 e 02/10/2026. Qualquer outra coisa vira vazio. */
function dataParaBanco(valor){
  const t = String(valor || "").trim();
  if(!t) return null;
  if(/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const br = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if(br){
    const ano = br[3].length === 2 ? "20" + br[3] : br[3];
    return ano + "-" + br[2].padStart(2,"0") + "-" + br[1].padStart(2,"0");
  }
  return null;
}

function arrumarSituacao(valor){
  const t = simplificar(valor);
  if(t.includes("client")) return "Cliente";
  if(t.includes("convers") || t.includes("negoc") || t.includes("andamento")) return "Conversando";
  if(t.includes("parad") || t.includes("perdid") || t.includes("sem retorno")) return "Parada";
  return "Lead";
}

function arrumarInstagram(valor){
  let t = String(valor || "").trim();
  if(!t) return "";
  t = t.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/+$/, "").split("?")[0];
  if(!t) return "";
  return t.startsWith("@") ? t : "@" + t;
}

function janelaImportar(linhas, nomeArquivo){
  const cabecalhos = linhas[0];
  const dados = linhas.slice(1);

  /* o painel chuta o de para das colunas */
  const escolha = adivinharColunas(cabecalhos);

  function opcoes(selecionado){
    return `<option value="-1">a planilha não tem</option>` +
      cabecalhos.map((h,i) => `<option value="${i}" ${selecionado === i ? "selected" : ""}>${seguro(h || ("coluna " + (i+1)))}</option>`).join("");
  }

  abrirJanela("Importar planilha", `
    <p class="porque">Li <b>${dados.length}</b> linha${dados.length === 1 ? "" : "s"} do arquivo ${seguro(nomeArquivo)}.
    Confira de onde vem cada informação e veja a prévia antes de importar.</p>

    <p id="resumoColunas" style="font-size:.84rem; line-height:1.6; margin:0 0 10px"></p>
    <button type="button" class="btn-mini" id="mudarColunas">Mudar de onde vem cada informação</button>

    <div class="campos" id="deParaCampos" hidden style="margin-top:12px">
      ${CAMPOS_MARCA.map(c => `
        <div class="campo">
          <label for="de-${c.campo}">${c.rotulo}${c.campo === "nome" ? " (obrigatório)" : ""}</label>
          <select id="de-${c.campo}" data-campo="${c.campo}">${opcoes(escolha[c.campo])}</select>
        </div>`).join("")}
    </div>

    <div class="campo" style="margin-top:4px">
      <label for="nichoPadrao">Nicho para todas as linhas desta planilha</label>
      <input id="nichoPadrao" list="listaNichosImportar" placeholder="ex: moda fitness">
      <datalist id="listaNichosImportar">
        ${[...new Set(NICHOS_SUGERIDOS.concat((estado.dados.marcas||[]).map(x => x.nicho).filter(Boolean)))]
          .map(n => `<option value="${seguro(n)}">`).join("")}
      </datalist>
      <small style="font-size:.72rem; color:var(--tinta-suave)">usado só nas linhas que não tiverem nicho na planilha</small>
    </div>

    <label class="item-check" style="margin-top:14px">
      <input type="checkbox" id="pularRepetidas" checked>
      <span><b>Pular quem já está na minha base</b><small>compara pelo e-mail, pelo @ do Instagram e pelo nome</small></span>
    </label>

    <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; margin:18px 0 8px">
      <h3 style="font-size:.86rem" id="tituloPrevia">Como vai entrar na sua base</h3>
      <div class="grupo-filtro">
        <button type="button" class="filtro" id="verMapeado" aria-pressed="true">Como vai entrar</button>
        <button type="button" class="filtro" id="verOriginal" aria-pressed="false">Planilha original</button>
      </div>
    </div>
    <p id="resumoPrevia" style="font-size:.78rem; color:var(--tinta-suave); margin:0 0 8px"></p>
    <div class="planilha-previa"><table id="previaImportacao"></table></div>

    <div class="acoes-janela">
      <button type="button" class="btn btn-simples" id="cancelar">Cancelar</button>
      <button type="button" class="btn btn-principal" id="confirmarImportar">Importar</button>
    </div>
  `, true);
  pegar("#janela").classList.add("enorme");

  function montarLinha(linha){
    const pega = (campo) => {
      const i = Number(pegar("#de-" + campo).value);
      return i >= 0 ? String(linha[i] || "").trim() : "";
    };
    const campoPadrao = pegar("#nichoPadrao");
    const padrao = campoPadrao ? campoPadrao.value.trim() : "";
    return {
      nome: pega("nome"),
      instagram: arrumarInstagram(pega("instagram")),
      email: pega("email").toLowerCase(),
      telefone: pega("telefone"),
      situacao: arrumarSituacao(pega("situacao")),
      nicho: pega("nicho") || padrao,
      obs: pega("obs"),
      ultimo_contato: dataParaBanco(pega("ultimo_contato"))
    };
  }

  /* diz o que vai acontecer com cada linha, antes de importar */
  function conferirLinhas(){
    const jaTem = { emails:new Set(), instas:new Set(), nomes:new Set() };
    (estado.dados.marcas || []).forEach(m => {
      if(m.email) jaTem.emails.add(simplificar(m.email));
      if(m.instagram) jaTem.instas.add(simplificar(m.instagram).replace("@",""));
      if(m.nome) jaTem.nomes.add(simplificar(m.nome));
    });
    return dados.map(linha => {
      const m = montarLinha(linha);
      let destino = "entra";
      if(!m.nome) destino = "sem nome";
      else {
        const e = simplificar(m.email), i = simplificar(m.instagram).replace("@",""), n = simplificar(m.nome);
        if((e && jaTem.emails.has(e)) || (i && jaTem.instas.has(i)) || jaTem.nomes.has(n)) destino = "já existe";
        else { if(e) jaTem.emails.add(e); if(i) jaTem.instas.add(i); jaTem.nomes.add(n); }
      }
      return { marca:m, destino:destino };
    });
  }

  let modo = "mapeado";

  function desenharPrevia(){
    const conferidas = conferirLinhas();
    const entram = conferidas.filter(c => c.destino === "entra").length;
    const repetidas = conferidas.filter(c => c.destino === "já existe").length;
    const semNome = conferidas.filter(c => c.destino === "sem nome").length;

    const partes = [entram + (entram === 1 ? " linha vai entrar" : " linhas vão entrar")];
    if(repetidas) partes.push(repetidas + (repetidas === 1 ? " já está na base" : " já estão na base"));
    if(semNome) partes.push(semNome + " sem nome de marca");
    pegar("#resumoPrevia").textContent = partes.join(", ") + ". Mostrando todas as " + dados.length + " linhas do arquivo.";

    if(modo === "original"){
      pegar("#tituloPrevia").textContent = "A sua planilha, do jeito que veio";
      pegar("#previaImportacao").innerHTML = `
        <thead><tr><th>#</th>${cabecalhos.map(h => `<th>${seguro(h)}</th>`).join("")}</tr></thead>
        <tbody>${dados.map((l,i) => `<tr><td style="color:var(--rosa-dourado)">${i+1}</td>${cabecalhos.map((h,c) => `<td>${seguro(l[c] || "")}</td>`).join("")}</tr>`).join("")}</tbody>`;
      return;
    }

    pegar("#tituloPrevia").textContent = "Como vai entrar na sua base";
    pegar("#previaImportacao").innerHTML = `
      <thead><tr><th>#</th><th>O que acontece</th>${CAMPOS_MARCA.map(c => `<th>${c.rotulo}</th>`).join("")}</tr></thead>
      <tbody>
        ${conferidas.map((c,i) => {
          const m = c.marca;
          const etiqueta = c.destino === "entra" ? `<span class="pilula p-cliente">entra</span>`
            : c.destino === "já existe" ? `<span class="pilula p-parada">já existe</span>`
            : `<span class="pilula p-atrasado">sem nome</span>`;
          return `<tr class="${c.destino === "entra" ? "" : "sumido"}">
            <td style="color:var(--rosa-dourado)">${i+1}</td>
            <td>${etiqueta}</td>
            <td>${seguro(m.nome)}</td>
            <td>${seguro(m.instagram)}</td>
            <td>${seguro(m.email)}</td>
            <td>${seguro(m.telefone)}</td>
            <td><span class="pilula p-${m.situacao.toLowerCase()}">${m.situacao}</span></td>
            <td>${m.nicho ? `<span class="pilula p-funil">${seguro(m.nicho)}</span>` : ""}</td>
            <td style="max-width:260px">${seguro(m.obs)}</td>
            <td>${dataBR(m.ultimo_contato)}</td>
          </tr>`;
        }).join("")}
      </tbody>`;
  }

  /* explica em português o que o painel entendeu da planilha */
  function escreverResumo(){
    const achados = [], faltando = [];
    CAMPOS_MARCA.forEach(c => {
      const i = Number(pegar("#de-" + c.campo).value);
      if(i >= 0) achados.push("<b>" + c.rotulo + "</b> vem da coluna " + seguro(cabecalhos[i] || ("número " + (i+1))));
      else faltando.push(c.rotulo.toLowerCase());
    });
    const semSituacao = faltando.includes("situação");
    const outros = faltando.filter(f => f !== "situação");

    let texto = "Entendi assim: " + achados.join(", ") + ".";
    if(outros.length){
      texto += " A sua planilha não tem " + outros.join(", ").replace(/, ([^,]*)$/, " nem $1") + ", e tudo bem, esses campos entram vazios.";
    }
    if(semSituacao) texto += " Como não há coluna de situação, todas entram como <b>Lead</b>.";
    pegar("#resumoColunas").innerHTML = texto;
  }

  escreverResumo();
  desenharPrevia();
  pegarTodos("#deParaCampos select").forEach(s => s.addEventListener("change", () => { escreverResumo(); desenharPrevia(); }));
  pegar("#nichoPadrao").addEventListener("input", desenharPrevia);
  pegar("#mudarColunas").addEventListener("click", () => {
    const area = pegar("#deParaCampos");
    area.hidden = !area.hidden;
    pegar("#mudarColunas").textContent = area.hidden
      ? "Mudar de onde vem cada informação"
      : "Pronto, esconder as colunas";
  });
  pegar("#verMapeado").addEventListener("click", () => {
    modo = "mapeado";
    pegar("#verMapeado").setAttribute("aria-pressed","true");
    pegar("#verOriginal").setAttribute("aria-pressed","false");
    desenharPrevia();
  });
  pegar("#verOriginal").addEventListener("click", () => {
    modo = "original";
    pegar("#verMapeado").setAttribute("aria-pressed","false");
    pegar("#verOriginal").setAttribute("aria-pressed","true");
    desenharPrevia();
  });
  pegar("#cancelar").addEventListener("click", fecharJanela);

  pegar("#confirmarImportar").addEventListener("click", async () => {
    const botao = pegar("#confirmarImportar");
    botao.disabled = true; botao.textContent = "Importando...";

    const pularRepetidas = pegar("#pularRepetidas").checked;
    const jaTem = { emails:new Set(), instas:new Set(), nomes:new Set() };
    (estado.dados.marcas || []).forEach(m => {
      if(m.email) jaTem.emails.add(simplificar(m.email));
      if(m.instagram) jaTem.instas.add(simplificar(m.instagram).replace("@",""));
      if(m.nome) jaTem.nomes.add(simplificar(m.nome));
    });

    const paraGravar = [];
    let semNome = 0, repetidas = 0;

    dados.forEach(linha => {
      const m = montarLinha(linha);
      if(!m.nome){ semNome++; return; }
      const chaveEmail = simplificar(m.email);
      const chaveInsta = simplificar(m.instagram).replace("@","");
      const chaveNome = simplificar(m.nome);
      const repetida =
        (chaveEmail && jaTem.emails.has(chaveEmail)) ||
        (chaveInsta && jaTem.instas.has(chaveInsta)) ||
        jaTem.nomes.has(chaveNome);
      if(pularRepetidas && repetida){ repetidas++; return; }
      if(chaveEmail) jaTem.emails.add(chaveEmail);
      if(chaveInsta) jaTem.instas.add(chaveInsta);
      jaTem.nomes.add(chaveNome);
      paraGravar.push(m);
    });

    let gravadas = 0, falharam = 0, ultimoErro = "";
    const colunasForaDoBanco = [];
    for(let i = 0; i < paraGravar.length; i += 40){
      const lote = paraGravar.slice(i, i + 40);
      try{
        const r = await gravarTolerante("marcas", lote);
        if(r.ok){
          gravadas += lote.length;
          r.deixadasDeFora.forEach(c => { if(!colunasForaDoBanco.includes(c)) colunasForaDoBanco.push(c); });
        } else {
          falharam += lote.length;
          ultimoErro = r.erro || "";
        }
      }catch(e){ falharam += lote.length; ultimoErro = e && e.message; }
    }

    fecharJanela();
    await carregarTudo(); desenhar();

    const partes = [gravadas + (gravadas === 1 ? " marca importada" : " marcas importadas")];
    if(repetidas) partes.push(repetidas + (repetidas === 1 ? " já estava na base" : " já estavam na base"));
    if(semNome)   partes.push(semNome + " sem nome, ignorada" + (semNome === 1 ? "" : "s"));
    if(falharam)  partes.push(falharam + (falharam === 1 ? " não entrou" : " não entraram"));
    let aviso = partes.join(", ") + ".";
    if(colunasForaDoBanco.length){
      aviso += " A coluna " + colunasForaDoBanco.join(" e ") + " ainda não existe no banco, então ficou vazia. Rode o banco.sql no Supabase.";
    }
    if(falharam && ultimoErro) aviso += " Motivo: " + ultimoErro;
    recado(aviso, falharam > 0);
  });
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
        <div class="campo"><label for="m-nicho">Nicho</label>
          <input id="m-nicho" list="listaNichos" placeholder="moda fitness, suplementos..." value="${seguro(m.nicho)}">
          <datalist id="listaNichos">
            ${[...new Set(NICHOS_SUGERIDOS.concat((estado.dados.marcas||[]).map(x => x.nicho).filter(Boolean)))]
              .map(n => `<option value="${seguro(n)}">`).join("")}
          </datalist>
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
      nicho: pegar("#m-nicho").value.trim(),
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
   ABA: CONTEÚDO DA SEMANA
   Uma linha por canal, uma coluna por dia, de segunda a domingo.
   ============================================================ */
function diasDaSemana(referencia){
  const d = new Date(referencia);
  let recuo = d.getDay() - 1; if(recuo < 0) recuo = 6;   /* a semana começa na segunda */
  const inicio = new Date(d.getFullYear(), d.getMonth(), d.getDate() - recuo);
  const lista = [];
  for(let i = 0; i < 7; i++){
    const dia = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i);
    lista.push({
      iso: dia.getFullYear() + "-" + String(dia.getMonth()+1).padStart(2,"0") + "-" + String(dia.getDate()).padStart(2,"0"),
      nome: ["seg","ter","qua","qui","sex","sáb","dom"][i],
      numero: dia.getDate()
    });
  }
  return lista;
}

function canalPor(id){ return CANAIS.find(c => c.id === id) || CANAIS[0]; }

function desenharConteudo(){
  const dias = diasDaSemana(estado.semana);
  const hoje = hojeISO();
  const todos = estado.dados.conteudos || [];

  const daSemana = todos.filter(c => {
    const dia = String(c.data || "").slice(0,10);
    const dentro = dia >= dias[0].iso && dia <= dias[6].iso;
    const filtroOk =
      estado.filtroConteudo === "Todos" ||
      (estado.filtroConteudo === "A fazer" && c.status !== "postado") ||
      (estado.filtroConteudo === "Postados" && c.status === "postado");
    return dentro && filtroOk;
  });

  const porCelula = {};
  daSemana.forEach(c => {
    const chave = c.canal + "|" + String(c.data).slice(0,10);
    (porCelula[chave] = porCelula[chave] || []).push(c);
  });

  /* contas da semana, sempre protegidas contra divisão por zero */
  const metaSemana = CANAIS.reduce((s,c) => s + c.meta, 0) * 7;
  const planejados = daSemana.length;
  const postados = daSemana.filter(c => c.status === "postado").length;
  const doDia = todos.filter(c => String(c.data).slice(0,10) === hoje);
  const metaDia = CANAIS.reduce((s,c) => s + c.meta, 0);
  const postadosHoje = doDia.filter(c => c.status === "postado").length;

  const intervalo = dias[0].numero + " a " + dias[6].numero + " de " +
    new Date(dias[6].iso + "T00:00:00").toLocaleDateString("pt-BR", { month:"long" });

  pegar("#acoesTopo").innerHTML = `<button class="btn btn-principal" id="novoConteudo">${ICONE.mais} Novo conteúdo</button>`;

  pegar("#area").innerHTML = `
    <div class="faixa-numeros quatro">
      <div class="numero"><b>${planejados}</b><small>na semana</small><i>meta de ${metaSemana}</i></div>
      <div class="numero"><b>${postados}</b><small>já postados</small></div>
      <div class="numero"><b>${Math.max(0, metaSemana - planejados)}</b><small>faltam planejar</small></div>
      <div class="numero"><b>${postadosHoje} de ${metaDia}</b><small>postados hoje</small></div>
    </div>

    <section class="cartao">
      <div class="cartao-topo">
        <div class="mes-topo">
          <button class="icone-btn" id="semanaAnterior" aria-label="Semana anterior">${ICONE.seta}</button>
          <span class="mes-nome">${seguro(intervalo)}</span>
          <button class="icone-btn" id="semanaSeguinte" aria-label="Próxima semana" style="transform:rotate(180deg)">${ICONE.seta}</button>
          <button class="btn-mini" id="estaSemana">Esta semana</button>
        </div>
        <div class="grupo-filtro">
          ${["Todos","A fazer","Postados"].map(f => `<button class="filtro" data-fconteudo="${f}" aria-pressed="${estado.filtroConteudo === f}">${f}</button>`).join("")}
        </div>
      </div>

      <div class="rolagem">
        <div class="grade-semana">
          <div class="canto"></div>
          ${dias.map(d => `<div class="cabeca-dia ${d.iso === hoje ? "hoje" : ""}">${d.nome} ${d.numero}</div>`).join("")}

          ${CANAIS.map(canal => `
            <div class="nome-canal">
              <span class="pilula ${canal.cor}">${seguro(canal.curto)}</span>
              <small>${canal.meta > 0 ? canal.meta + " por dia" : "quando der"}</small>
            </div>
            ${dias.map(d => {
              const itens = porCelula[canal.id + "|" + d.iso] || [];
              const feitos = itens.filter(i => i.status === "postado").length;
              const faltando = canal.meta > 0 && itens.length < canal.meta;
              return `
              <div class="celula ${d.iso === hoje ? "hoje" : ""}" data-canal="${canal.id}" data-dia="${d.iso}">
                ${canal.meta > 0 ? `<span class="contagem ${faltando ? "falta" : ""}">${itens.length}/${canal.meta}</span>` : ""}
                <button class="mais-dia" data-novo="${canal.id}|${d.iso}" title="Adicionar neste dia">+</button>
                ${itens.map(i => `
                  <button class="chip ${i.status}" data-item="${seguro(i.id)}" title="${seguro(i.assunto)}">
                    ${i.origem_id ? "&#8635; " : ""}${seguro(i.assunto)}
                  </button>`).join("")}
              </div>`;
            }).join("")}
          `).join("")}
        </div>
      </div>

      <div class="cartao-corpo legenda">
        ${ETAPAS.map(e => `<span><i class="ponto ${e}"></i>${e}</span>`).join("")}
        <span><i class="ponto">&#8635;</i>reciclado do TikTok</span>
      </div>
    </section>
  `;

  pegar("#novoConteudo").addEventListener("click", () => formularioConteudo(null, "tiktok", hoje));
  pegar("#semanaAnterior").addEventListener("click", () => { const d = new Date(estado.semana); d.setDate(d.getDate()-7); estado.semana = d; desenharConteudo(); });
  pegar("#semanaSeguinte").addEventListener("click", () => { const d = new Date(estado.semana); d.setDate(d.getDate()+7); estado.semana = d; desenharConteudo(); });
  pegar("#estaSemana").addEventListener("click", () => { estado.semana = new Date(); desenharConteudo(); });
  pegarTodos("[data-fconteudo]").forEach(b => b.addEventListener("click", () => { estado.filtroConteudo = b.dataset.fconteudo; desenharConteudo(); }));

  pegarTodos("[data-novo]").forEach(b => b.addEventListener("click", (e) => {
    e.stopPropagation();
    const [canal, dia] = b.dataset.novo.split("|");
    formularioConteudo(null, canal, dia);
  }));
  pegarTodos(".celula").forEach(c => c.addEventListener("click", (e) => {
    if(e.target.closest("button")) return;
    formularioConteudo(null, c.dataset.canal, c.dataset.dia);
  }));
  pegarTodos("[data-item]").forEach(b => b.addEventListener("click", (e) => {
    e.stopPropagation();
    formularioConteudo(todos.find(c => String(c.id) === b.dataset.item));
  }));
}

function formularioConteudo(item, canalSugerido, diaSugerido){
  const c = item || {};
  const canal = c.canal || canalSugerido || "tiktok";
  const data = c.data ? String(c.data).slice(0,10) : (diaSugerido || hojeISO());
  const origem = c.origem_id ? (estado.dados.conteudos || []).find(x => String(x.id) === String(c.origem_id)) : null;

  abrirJanela(item ? "Editar conteúdo" : "Novo conteúdo", `
    <form id="formConteudo">
      ${origem ? `<p class="porque">Reciclado de: ${seguro(origem.assunto)} (${seguro(canalPor(origem.canal).nome)}, ${dataBR(origem.data)})</p>` : ""}
      <div class="campos">
        <div class="campo"><label for="t-canal">Canal</label>
          <select id="t-canal">${CANAIS.map(x => `<option value="${x.id}" ${canal === x.id ? "selected" : ""}>${x.nome}</option>`).join("")}</select>
        </div>
        <div class="campo"><label for="t-data">Dia</label><input id="t-data" type="date" value="${data}" required></div>
        <div class="campo largo"><label for="t-assunto">Assunto, o que é o vídeo</label><input id="t-assunto" required placeholder="Ex: review do sérum da marca X" value="${seguro(c.assunto)}"></div>
        <div class="campo"><label for="t-tipo">Tipo</label>
          <input id="t-tipo" list="listaTipos" placeholder="review, unboxing, rotina..." value="${seguro(c.tipo)}">
          <datalist id="listaTipos">${TIPOS_CONTEUDO.map(t => `<option value="${t}">`).join("")}</datalist>
        </div>
        <div class="campo"><label for="t-marca">Marca ou produto</label><input id="t-marca" value="${seguro(c.marca)}"></div>
        <div class="campo largo"><label for="t-descricao">Descrição, legenda ou roteiro</label><textarea id="t-descricao" placeholder="o que falar, os ganchos, a legenda que vai junto">${seguro(c.descricao)}</textarea></div>
        <div class="campo"><label for="t-status">Etapa</label>
          <select id="t-status">${ETAPAS.map(e => `<option ${c.status === e ? "selected" : ""}>${e}</option>`).join("")}</select>
        </div>
        <div class="campo"><label for="t-hora">Hora de postar</label><input id="t-hora" placeholder="19h" value="${seguro(c.hora)}"></div>
        <div class="campo largo"><label for="t-link">Link do post, depois de publicado</label><input id="t-link" placeholder="https://..." value="${seguro(c.link)}"></div>
      </div>
      <div class="acoes-janela">
        ${item ? `<button type="button" class="btn btn-simples apagar" id="apagarConteudo">Apagar</button>` : ""}
        ${item && canal === "tiktok" ? `<button type="button" class="btn btn-simples" id="reciclar">${ICONE.reciclar} Reciclar</button>` : ""}
        <button type="button" class="btn btn-simples" id="cancelar">Cancelar</button>
        <button type="submit" class="btn btn-principal">Salvar</button>
      </div>
    </form>
  `);

  pegar("#cancelar").addEventListener("click", fecharJanela);
  if(item){
    pegar("#apagarConteudo").addEventListener("click", async () => {
      if(!confirm('Apagar "' + c.assunto + '"?')) return;
      if(await apagarLinha("conteudos", c.id)){ fecharJanela(); recado("Conteúdo apagado."); await carregarTudo(); desenhar(); }
    });
    if(canal === "tiktok") pegar("#reciclar").addEventListener("click", () => janelaReciclar(c));
  }

  pegar("#formConteudo").addEventListener("submit", async (e) => {
    e.preventDefault();
    const linha = {
      canal: pegar("#t-canal").value,
      data: pegar("#t-data").value,
      assunto: pegar("#t-assunto").value.trim(),
      tipo: pegar("#t-tipo").value.trim(),
      marca: pegar("#t-marca").value.trim(),
      descricao: pegar("#t-descricao").value.trim(),
      status: pegar("#t-status").value,
      hora: pegar("#t-hora").value.trim(),
      link: pegar("#t-link").value.trim()
    };
    if(!linha.assunto || !linha.data){ recado("Escreva o assunto e escolha o dia.", true); return; }
    if(await gravar("conteudos", linha, c.id)){
      fecharJanela(); recado("Conteúdo salvo."); await carregarTudo(); desenhar();
    }
  });
}

/* Reciclar: cria o mesmo conteúdo nos outros canais, já marcado
   como vindo daquele vídeo do TikTok Shop. */
function janelaReciclar(original){
  const destinos = CANAIS.filter(c => !c.fonte && c.meta > 0);
  abrirJanela("Reciclar este vídeo", `
    <p class="porque">Vou criar uma cópia de "${seguro(original.assunto)}" nos canais que você escolher, já ligada a este vídeo.</p>
    <form id="formReciclar">
      <div class="campos">
        <div class="campo largo"><label>Para quais canais</label>
          ${destinos.map(d => `
            <label class="item-check" style="padding:6px 0">
              <input type="checkbox" value="${d.id}" checked>
              <span><b>${d.nome}</b><small>${d.meta} por dia</small></span>
            </label>`).join("")}
        </div>
        <div class="campo"><label for="r-data">Em qual dia</label><input id="r-data" type="date" value="${String(original.data).slice(0,10)}" required></div>
        <div class="campo"><label for="r-status">Começa como</label>
          <select id="r-status">${ETAPAS.map(e => `<option ${e === "editado" ? "selected" : ""}>${e}</option>`).join("")}</select>
        </div>
      </div>
      <div class="acoes-janela">
        <button type="button" class="btn btn-simples" id="cancelar">Cancelar</button>
        <button type="submit" class="btn btn-principal">Criar cópias</button>
      </div>
    </form>
  `);
  pegar("#cancelar").addEventListener("click", fecharJanela);
  pegar("#formReciclar").addEventListener("submit", async (e) => {
    e.preventDefault();
    const escolhidos = Array.from(document.querySelectorAll("#formReciclar input[type=checkbox]:checked")).map(i => i.value);
    if(!escolhidos.length){ recado("Escolha ao menos um canal.", true); return; }
    let criados = 0;
    for(const canal of escolhidos){
      const ok = await gravar("conteudos", {
        canal: canal,
        data: pegar("#r-data").value,
        assunto: original.assunto,
        tipo: original.tipo,
        marca: original.marca,
        descricao: original.descricao,
        status: pegar("#r-status").value,
        origem_id: original.id
      });
      if(ok) criados++;
    }
    fecharJanela();
    recado(criados === 1 ? "1 cópia criada." : criados + " cópias criadas.");
    await carregarTudo(); desenhar();
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

/* ============================================================
   ABA 8: PROSPECÇÃO
   Manda a sua apresentação para várias marcas de uma vez.

   De onde saem os e-mails: da sua aba MARCAS, que já existe.
   Nenhum cadastro novo, nenhuma outra tabela de contatos.

   Dois jeitos de entregar:
   1. Resend, que manda sozinho (precisa da chave no Supabase)
   2. Rascunho, o plano B, que monta o e-mail e abre o Gmail
      já preenchido para você só clicar em enviar.

   A chave secreta NUNCA fica aqui. Ela vive no painel do
   Supabase, como segredo da função enviar-emails.
   ============================================================ */

/* o endereço da função que manda os e-mails, montado a partir
   da mesma URL do banco que já está em js/banco.js */
function enderecoDaFuncao(){
  try{
    const base = ((window.BANCO && window.BANCO.url) || "").replace(/\/+$/, "");
    return base ? base + "/functions/v1/enviar-emails" : "";
  }catch(e){ return ""; }
}

/* primeiro nome da marca, para o {{nome}} */
function primeiroNome(nomeCompleto){
  const limpo = String(nomeCompleto || "").trim();
  if(!limpo) return "tudo bem";
  return limpo.split(/\s+/)[0];
}

/* troca {{nome}} e {{marca}} pelo que for daquela marca */
function trocarChaves(texto, marca){
  const nome = primeiroNome(marca && marca.nome);
  const cheio = String((marca && marca.nome) || "").trim() || nome;
  return String(texto || "")
    .replace(/\{\{\s*nome\s*\}\}/gi, nome)
    .replace(/\{\{\s*marca\s*\}\}/gi, cheio);
}

/* transforma o texto simples em um e-mail limpo e bonito.
   Os links que você escrever viram clicáveis sozinhos. */
function textoParaHtml(texto, botaoTexto, botaoLink){
  const paragrafos = String(texto || "")
    .split(/\n\s*\n/)
    .map(p => seguro(p.trim()).replace(/\n/g, "<br>"))
    .filter(Boolean)
    .map(p => p.replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" style="color:#e3157f">$1</a>'
    ))
    .map(p => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#2c0620">${p}</p>`)
    .join("");

  const botao = (botaoTexto && botaoLink)
    ? `<p style="margin:26px 0 0"><a href="${seguro(botaoLink)}"
         style="display:inline-block;background:#e3157f;color:#ffffff;text-decoration:none;
                padding:13px 26px;border-radius:999px;font-size:15px;font-weight:600">${seguro(botaoTexto)}</a></p>`
    : "";

  /* E-mail não é site: Gmail, Outlook e afins ignoram metade do CSS.
     Por isso o corpo vai montado em tabela, que é o único jeito que
     todos eles entendem igual. Sem isso o texto encosta na direita. */
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background:#ffffff;margin:0;padding:0">
  <tr>
    <td align="left" style="padding:26px 20px">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0"
             style="width:100%;max-width:560px">
        <tr>
          <td align="left" style="font-family:Arial,Helvetica,sans-serif;color:#2c0620;text-align:left">
            ${paragrafos}
            ${botao}
            <p style="margin:30px 0 0;padding-top:16px;border-top:1px solid #eeeeee;font-size:12px;color:#8a7080;text-align:left">
              Se você não quiser mais receber meus e-mails, é só responder esta mensagem com a palavra SAIR.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

/* o HTML que vai sair de verdade, conforme o modo escolhido */
function htmlDoEmail(){
  const p = estado.prosp;
  return p.modo === "html"
    ? p.html
    : textoParaHtml(p.texto, p.botaoTexto, p.botaoLink);
}

/* ---- quem vai receber ---- */
function listaDeSituacoes(){
  const daBase = (estado.dados.marcas || []).map(m => m.situacao).filter(Boolean);
  return [...new Set(SITUACOES.concat(daBase))];
}

function destinatarios(){
  const todas = estado.dados.marcas || [];
  const p = estado.prosp;
  const fora = { semEmail:0, repetidos:0, descadastrados:0, jaReceberam:0 };

  if(p.publico === "teste"){
    return { lista:[{ nome:"Emellyn Cracco", email:estado.email || "" }], fora };
  }

  let base;
  if(p.publico === "selecionadas")  base = todas.filter(m => m.selecionada);
  else if(p.publico === "todas")    base = todas.slice();
  else                              base = todas.filter(m => String(m.situacao) === p.publico);

  /* sem e-mail não dá para mandar */
  const comEmail = base.filter(m => {
    const tem = String(m.email || "").includes("@");
    if(!tem) fora.semEmail++;
    return tem;
  });

  /* quem pediu SAIR nunca mais recebe */
  const saiu = new Set((estado.dados.email_optout || []).map(o => String(o.email || "").toLowerCase()));

  /* quem já recebeu este mesmo assunto, quando a caixinha está marcada */
  const assunto = String(estado.prosp.assunto || "").trim();
  const jaRecebeu = new Set(
    (estado.dados.email_envios || [])
      .filter(e => e.status === "ok" && String(e.assunto || "") === assunto)
      .map(e => String(e.email || "").toLowerCase())
  );

  /* e-mail repetido, que acontece quando é a mesma agência, manda uma vez só */
  const vistos = new Set();
  const lista = [];
  comEmail.forEach(m => {
    const chave = String(m.email).trim().toLowerCase();
    if(vistos.has(chave)){ fora.repetidos++; return; }
    if(saiu.has(chave)){ fora.descadastrados++; return; }
    if(p.pularRepetidos && assunto && jaRecebeu.has(chave)){ fora.jaReceberam++; return; }
    vistos.add(chave);
    lista.push(m);
  });

  return { lista, fora };
}

/* ---- os números dos cartões coloridos ---- */
function numerosProspeccao(){
  const todas = estado.dados.marcas || [];
  const envios = estado.dados.email_envios || [];
  const faltaMarcas = estado.faltando.some(f => String(f).includes("marcas"));
  const faltaEnvios = estado.faltando.some(f => String(f).includes("email_envios"));
  const faltaOptout = estado.faltando.some(f => String(f).includes("email_optout"));

  const comEmail = todas.filter(m => String(m.email || "").includes("@"));
  const jaReceberam = new Set(envios.filter(e => e.status === "ok").map(e => String(e.email).toLowerCase()));

  return [
    { cor:"principal", valor: faltaMarcas ? "-" : comEmail.length, nome:"marcas com e-mail", pe:"na sua base" },
    { cor:"azul",      valor: faltaMarcas ? "-" : comEmail.filter(m => !jaReceberam.has(String(m.email).toLowerCase())).length, nome:"a enviar", pe:"ainda não receberam nada" },
    { cor:"verde",     valor: faltaEnvios ? "-" : jaReceberam.size, nome:"já receberam", pe:"pelo menos um e-mail" },
    { cor:"vermelho",  valor: faltaEnvios ? "-" : envios.filter(e => e.status === "erro").length, nome:"falhas", pe:"e-mail que voltou" },
    { cor:"ambar",     valor: faltaOptout ? "-" : (estado.dados.email_optout || []).length, nome:"descadastrados", pe:"responderam SAIR" }
  ];
}

/* ============================================================
   A TELA
   ============================================================ */
function desenharProspeccao(){
  const p = estado.prosp;
  const todas = estado.dados.marcas || [];
  const envios = estado.dados.email_envios || [];
  const temAlgumEmail = todas.some(m => String(m.email || "").includes("@"));
  const { lista, fora } = destinatarios();
  const selecionadas = todas.filter(m => m.selecionada && String(m.email || "").includes("@")).length;

  pegar("#acoesTopo").innerHTML = "";

  /* se a base ainda não tem e-mail nenhum, não adianta mostrar a tela de envio */
  if(!temAlgumEmail){
    pegar("#area").innerHTML = `
      <div class="recado">
        <p style="margin:0 0 6px"><b>A sua base ainda está sem e-mail.</b></p>
        <p style="margin:0 0 16px">Os e-mails da Prospecção saem da sua aba Marcas. Cadastre uma marca com e-mail, ou importe a sua planilha, e depois volte aqui.</p>
        <button class="btn btn-principal" id="irParaMarcas">Ir para a aba Marcas</button>
      </div>`;
    pegar("#irParaMarcas").addEventListener("click", () => { estado.aba = "marcas"; desenhar(); });
    return;
  }

  const totalEnviados = envios.filter(e => e.status === "ok").length;
  const exemplo = lista[0] || { nome:"Marca Exemplo" };
  const htmlPrevia = trocarChaves(htmlDoEmail(), exemplo);
  const assuntoPrevia = trocarChaves(p.assunto, exemplo) || "(sem assunto ainda)";

  pegar("#area").innerHTML = `

  <!-- ---------- 1. A CAPA ---------- -->
  <div class="capa-prosp">
    <div class="capa-prosp-texto">
      <span class="capa-prosp-icone" aria-hidden="true">${ICONE.prospeccao}</span>
      <h2>Prospecção</h2>
      <p>Manda a sua apresentação para várias marcas de uma vez, chamando cada uma pelo nome.</p>
      <div class="capa-prosp-etiquetas">
        <span>teste antes, sempre</span>
        <span>a chave vive no Supabase</span>
        <span>quem responde SAIR sai da lista</span>
      </div>
    </div>
    <div class="capa-prosp-numero">
      <b>${totalEnviados || "-"}</b>
      <span>enviados até agora</span>
    </div>
  </div>

  <!-- ---------- 2. OS CARTÕES ---------- -->
  <div class="cartoes-prosp">
    ${numerosProspeccao().map(n => `
      <div class="cartao-prosp cor-${n.cor}">
        <b>${n.valor}</b>
        <span>${n.nome}</span>
        <i>${n.pe}</i>
      </div>`).join("")}
  </div>

  <!-- ---------- 3. FORMULÁRIO E PRÉVIA ---------- -->
  <div class="prosp-grid">

    <div class="prosp-coluna">

      <section class="cartao">
        <div class="cartao-topo"><h2>1. Para quem vai</h2></div>
        <div class="cartao-corpo">
          <p class="dica-fonte">Os e-mails vêm da sua aba <b>Marcas</b>.</p>
          <select class="campo-largo" id="publicoProsp">
            <option value="selecionadas" ${p.publico === "selecionadas" ? "selected" : ""}>só as marcas que eu selecionei (${selecionadas})</option>
            <option value="teste" ${p.publico === "teste" ? "selected" : ""}>só para mim, teste</option>
            <option value="todas" ${p.publico === "todas" ? "selected" : ""}>todas as marcas que têm e-mail</option>
            ${listaDeSituacoes().map(s => `<option value="${seguro(s)}" ${p.publico === s ? "selected" : ""}>só as marcas em ${seguro(s)}</option>`).join("")}
          </select>

          <p class="conta-destino">
            <b>${lista.length}</b> ${lista.length === 1 ? "marca vai receber" : "marcas vão receber"}
            ${fora.semEmail ? `<span class="fora">${fora.semEmail} sem e-mail</span>` : ""}
            ${fora.repetidos ? `<span class="fora">${fora.repetidos} e-mail repetido</span>` : ""}
            ${fora.descadastrados ? `<span class="fora">${fora.descadastrados} descadastrado</span>` : ""}
            ${fora.jaReceberam ? `<span class="fora">${fora.jaReceberam} já receberam</span>` : ""}
          </p>

          ${(p.publico === "selecionadas" && !selecionadas) ? `
            <div class="aviso-prosp">
              Você ainda não selecionou nenhuma marca. Vá na aba Marcas e marque as caixinhas.
              <button class="btn-mini" id="irMarcasSelecionar">ir para Marcas</button>
            </div>` : ""}

          <label class="linha-caixinha">
            <input type="checkbox" id="pularRepetidos" ${p.pularRepetidos ? "checked" : ""}>
            <span>pular quem já recebeu este mesmo assunto</span>
          </label>
        </div>
      </section>

      <section class="cartao">
        <div class="cartao-topo">
          <h2>2. O e-mail</h2>
          <div class="grupo-filtro">
            <button class="filtro" data-modo="texto" aria-pressed="${p.modo === "texto"}">texto fácil</button>
            <button class="filtro" data-modo="html" aria-pressed="${p.modo === "html"}">HTML</button>
          </div>
        </div>
        <div class="cartao-corpo">
          <div class="campo largo">
            <label for="assuntoProsp">Assunto</label>
            <input id="assuntoProsp" value="${seguro(p.assunto)}" placeholder="Parceria de conteúdo com a {{marca}}">
          </div>

          ${p.modo === "texto" ? `
            <div class="campo largo">
              <label for="textoProsp">Texto do e-mail</label>
              <textarea id="textoProsp" rows="11" placeholder="Oi {{nome}}, tudo bem?&#10;&#10;Sou a Emellyn, criadora de conteúdo UGC em Curitiba...">${seguro(p.texto)}</textarea>
            </div>
            <div class="campos">
              <div class="campo">
                <label for="botaoTextoProsp">Texto do botão, opcional</label>
                <input id="botaoTextoProsp" value="${seguro(p.botaoTexto)}" placeholder="Ver meu portfólio">
              </div>
              <div class="campo">
                <label for="botaoLinkProsp">Link do botão</label>
                <input id="botaoLinkProsp" value="${seguro(p.botaoLink)}" placeholder="https://emycracco.com.br">
              </div>
            </div>
          ` : `
            <div class="campo largo">
              <label for="htmlProsp">HTML do e-mail</label>
              <textarea id="htmlProsp" rows="14" class="campo-codigo" placeholder="Cole aqui o HTML pronto do seu e-mail">${seguro(p.html)}</textarea>
            </div>
            <button class="btn btn-simples" id="comecarDoModelo">começar do modelo pronto</button>
            <p class="dica-fonte" style="margin-top:10px">Neste modo sai exatamente o que você colou. O rodapé do SAIR precisa estar no seu HTML.</p>
          `}

          <p class="dica-fonte" style="margin-top:12px">
            Use <b>{{nome}}</b> para o primeiro nome da marca e <b>{{marca}}</b> para o nome completo.
          </p>
        </div>
      </section>

      <section class="cartao">
        <div class="cartao-topo"><h2>3. Enviar</h2></div>
        <div class="cartao-corpo">
          <div class="grupo-filtro" style="margin-bottom:14px">
            <button class="filtro" data-entrega="resend" aria-pressed="${p.entrega === "resend"}">mandar sozinho</button>
            <button class="filtro" data-entrega="rascunho" aria-pressed="${p.entrega === "rascunho"}">rascunho pelo Gmail</button>
          </div>

          ${p.entrega === "resend" ? `
            <p class="dica-fonte">Manda direto, sem você abrir nada. Precisa da chave do Resend guardada no Supabase.</p>
            <div class="acoes-prosp">
              <button class="btn btn-simples" id="enviarTeste">${ICONE.aviao} enviar teste para mim</button>
              <button class="btn btn-principal" id="dispararProsp" ${p.enviando ? "disabled" : ""}>disparar para ${lista.length}</button>
            </div>
            <p class="dica-fonte" style="margin-top:12px">
              Domínio novo pede calma: comece com 20 ou 30 no primeiro dia e vá subindo ao longo de duas semanas, senão você queima o domínio e cai em spam.
            </p>
          ` : `
            <p class="dica-fonte">Monta o e-mail de cada marca e abre o Gmail já preenchido, para você só clicar em enviar. Funciona sem Resend nenhum.</p>
            <div class="acoes-prosp">
              <button class="btn btn-principal" id="abrirFila">montar a fila de ${lista.length}</button>
            </div>
          `}

          ${p.progresso ? `
            <div class="progresso-prosp">
              <div class="progresso-trilho"><div class="progresso-cheio" style="width:${Math.round(100 * p.progresso.feitos / Math.max(1, p.progresso.total))}%"></div></div>
              <span>${p.progresso.feitos} de ${p.progresso.total} enviados</span>
            </div>` : ""}

          ${p.resumo ? `
            <div class="resumo-prosp ${p.resumo.cotaAcabou ? "alerta" : ""}">
              <b>${p.resumo.enviados} enviados, ${p.resumo.falhas} falhas, ${p.resumo.pulados} pulados.</b>
              ${p.resumo.cotaAcabou ? `
                <p>A cota diária do Resend acabou e eu parei na hora, para não perder nada.
                Volte amanhã, cole o mesmo assunto e o mesmo texto, deixe marcada a caixinha
                de pular quem já recebeu, e dispare de novo: ele manda só para os que faltaram.</p>` : ""}
            </div>` : ""}
        </div>
      </section>

    </div>

    <!-- ---------- A PRÉVIA ---------- -->
    <div class="prosp-palco">
      <div class="palco-topo">
        <span class="dica-fonte">Prévia, com o nome de <b>${seguro(exemplo.nome)}</b></span>
        <button class="btn-mini" id="previaCheia">ver em tela cheia</button>
      </div>
      <div class="janela-email">
        <div class="janela-email-topo">
          <span class="avatar-email">E</span>
          <div>
            <b>${seguro(assuntoPrevia)}</b>
            <small>Emellyn Cracco &lt;${seguro(estado.email)}&gt; para você</small>
          </div>
        </div>
        <div class="janela-email-corpo" id="corpoPrevia"></div>
      </div>
      <p class="dica-fonte" style="text-align:center;margin-top:12px">
        Mande o teste para você mesma e abra no celular antes de disparar.
      </p>
    </div>
  </div>

  <!-- ---------- O HISTÓRICO ---------- -->
  <section class="cartao">
    <div class="cartao-topo">
      <h2>Tudo que já saiu</h2>
      <div class="busca">${ICONE.lupa}<input id="buscaHistorico" placeholder="buscar por e-mail" value="${seguro(p.buscaHistorico)}"></div>
    </div>
    <div class="rolagem">
      ${(() => {
        const b = p.buscaHistorico.toLowerCase();
        const linhas = envios.filter(e => !b || String(e.email || "").toLowerCase().includes(b));
        if(!linhas.length) return `<p class="vazio-tabela">${envios.length ? "Nenhum envio com essa busca." : "Nada saiu ainda. Quando você disparar, cada e-mail aparece aqui."}</p>`;
        return `<table>
          <thead><tr><th>Marca</th><th>E-mail</th><th>Assunto</th><th>Quando</th><th>Resultado</th></tr></thead>
          <tbody>${linhas.slice(0, 300).map(e => `
            <tr>
              <td>${seguro(e.marca)}</td>
              <td>${seguro(e.email)}</td>
              <td style="max-width:240px">${seguro(e.assunto)}</td>
              <td>${dataBR(e.criado_em)}</td>
              <td>${e.status === "ok"
                   ? '<span class="pilula p-cliente">entregue</span>'
                   : `<span class="pilula p-parada" title="${seguro(e.erro)}">erro</span>`}</td>
            </tr>`).join("")}</tbody>
        </table>`;
      })()}
    </div>
  </section>
  `;

  /* a prévia entra como texto bruto, não interpretado pelo innerHTML da página */
  const quadro = pegar("#corpoPrevia");
  if(quadro) quadro.innerHTML = htmlPrevia;

  ligarEventosProspeccao(lista);
}

/* ============================================================
   OS BOTÕES DA ABA
   ============================================================ */
function ligarEventosProspeccao(lista){
  const p = estado.prosp;
  const redesenhar = () => desenharProspeccao();

  const sel = pegar("#publicoProsp");
  if(sel) sel.addEventListener("change", () => { p.publico = sel.value; redesenhar(); });

  const irMarcas = pegar("#irMarcasSelecionar");
  if(irMarcas) irMarcas.addEventListener("click", () => { estado.aba = "marcas"; desenhar(); });

  const pular = pegar("#pularRepetidos");
  if(pular) pular.addEventListener("change", () => { p.pularRepetidos = pular.checked; redesenhar(); });

  pegarTodos("[data-modo]").forEach(b => b.addEventListener("click", () => { p.modo = b.dataset.modo; redesenhar(); }));
  pegarTodos("[data-entrega]").forEach(b => b.addEventListener("click", () => { p.entrega = b.dataset.entrega; redesenhar(); }));

  /* os campos guardam o que você escreve sem redesenhar a tela toda,
     para o cursor não pular. A prévia é atualizada na mão. */
  const atualizarPrevia = () => {
    const exemplo = lista[0] || { nome:"Marca Exemplo" };
    const quadro = pegar("#corpoPrevia");
    if(quadro) quadro.innerHTML = trocarChaves(htmlDoEmail(), exemplo);
  };
  const ligarCampo = (id, chave, mexePrevia) => {
    const campo = pegar(id);
    if(!campo) return;
    campo.addEventListener("input", () => {
      p[chave] = campo.value;
      if(mexePrevia) atualizarPrevia();
    });
  };
  ligarCampo("#textoProsp", "texto", true);
  ligarCampo("#htmlProsp", "html", true);
  ligarCampo("#botaoTextoProsp", "botaoTexto", true);
  ligarCampo("#botaoLinkProsp", "botaoLink", true);

  const campoAssunto = pegar("#assuntoProsp");
  if(campoAssunto) campoAssunto.addEventListener("input", () => {
    p.assunto = campoAssunto.value;
    const topo = document.querySelector(".janela-email-topo b");
    const exemplo = lista[0] || { nome:"Marca Exemplo" };
    if(topo) topo.textContent = trocarChaves(p.assunto, exemplo) || "(sem assunto ainda)";
  });

  const modelo = pegar("#comecarDoModelo");
  if(modelo) modelo.addEventListener("click", () => {
    p.html = textoParaHtml(
      p.texto || "Oi {{nome}}, tudo bem?\n\nEscreva aqui a sua apresentação.",
      p.botaoTexto, p.botaoLink
    );
    redesenhar();
  });

  const cheia = pegar("#previaCheia");
  if(cheia) cheia.addEventListener("click", () => {
    const exemplo = lista[0] || { nome:"Marca Exemplo" };
    abrirJanela("Prévia do e-mail",
      `<div class="previa-cheia">${trocarChaves(htmlDoEmail(), exemplo)}</div>`, true);
  });

  const busca = pegar("#buscaHistorico");
  if(busca) busca.addEventListener("input", () => {
    p.buscaHistorico = busca.value;
    redesenhar();
    const novo = pegar("#buscaHistorico");
    novo.focus(); novo.setSelectionRange(novo.value.length, novo.value.length);
  });

  const teste = pegar("#enviarTeste");
  if(teste) teste.addEventListener("click", () => dispararEmails([{ nome:"Emellyn Cracco", email:estado.email }], true));

  const disparar = pegar("#dispararProsp");
  if(disparar) disparar.addEventListener("click", () => confirmarDisparo(lista));

  const fila = pegar("#abrirFila");
  if(fila) fila.addEventListener("click", () => abrirFilaRascunho(lista));
}

/* ============================================================
   A CONFIRMAÇÃO, que nunca pode faltar
   ============================================================ */
function confirmarDisparo(lista){
  const p = estado.prosp;
  if(!String(p.assunto || "").trim()){ recado("Escreva o assunto antes de disparar.", true); return; }
  if(!String(htmlDoEmail() || "").trim()){ recado("Escreva o texto do e-mail antes de disparar.", true); return; }
  if(!lista.length){ recado("Não há nenhuma marca nessa seleção.", true); return; }

  const nomeDaLista = {
    selecionadas:"as marcas que você selecionou",
    teste:"você mesma",
    todas:"todas as marcas com e-mail"
  }[p.publico] || ("as marcas em " + p.publico);

  const semSair = p.modo === "html" && !/sair/i.test(p.html);

  abrirJanela("Confirmar disparo", `
    <p>Este e-mail vai para <b>${lista.length}</b> ${lista.length === 1 ? "marca" : "marcas"}, da lista <b>${seguro(nomeDaLista)}</b>.</p>
    <p><b>Não dá para desfazer.</b> Depois de sair, não tem como voltar atrás.</p>
    ${semSair ? `<div class="aviso-prosp">O seu HTML não tem a palavra SAIR em lugar nenhum. Sem o rodapé de descadastro, quem receber não sabe como pedir para sair.</div>` : ""}
    <div class="acoes-janela">
      <button class="btn btn-simples" id="cancelarDisparo">cancelar</button>
      <button class="btn btn-principal" id="confirmarDisparo">sim, disparar para ${lista.length}</button>
    </div>
  `);
  pegar("#cancelarDisparo").addEventListener("click", fecharJanela);
  pegar("#confirmarDisparo").addEventListener("click", () => { fecharJanela(); dispararEmails(lista, false); });
}

/* ============================================================
   O DISPARO, em lotes de 100
   ============================================================ */
async function dispararEmails(lista, ehTeste){
  const p = estado.prosp;
  if(!String(p.assunto || "").trim()){ recado("Escreva o assunto primeiro.", true); return; }
  if(!lista.length || !lista[0].email){ recado("Não tem para quem mandar.", true); return; }

  const endereco = enderecoDaFuncao();
  if(!endereco){ recado("Não encontrei o endereço do banco. Confira o js/banco.js.", true); return; }

  let token = "";
  try{
    const { data } = await window.sb.auth.getSession();
    token = (data && data.session && data.session.access_token) || "";
  }catch(e){ token = ""; }
  if(!token){ recado("A sua sessão expirou. Entre de novo.", true); return; }

  p.enviando = true;
  p.resumo = null;
  p.progresso = { feitos:0, total:lista.length };
  desenharProspeccao();

  let enviados = 0, falhas = 0, pulados = 0, cotaAcabou = false;
  const html = htmlDoEmail();

  for(let i = 0; i < lista.length; i += 100){
    const lote = lista.slice(i, i + 100);
    let resposta = null;
    try{
      const r = await fetch(endereco, {
        method:"POST",
        headers:{ "Content-Type":"application/json", "Authorization":"Bearer " + token },
        body: JSON.stringify({
          destinatarios: lote.map(m => ({ email:m.email, nome:m.nome })),
          assunto: p.assunto,
          html: html
        })
      });
      resposta = await r.json();
      if(!r.ok) throw new Error((resposta && resposta.erro) || "A função respondeu com erro.");
    }catch(erro){
      p.enviando = false;
      p.progresso = null;
      p.resumo = { enviados, falhas: falhas + lote.length, pulados, cotaAcabou:false };
      desenharProspeccao();
      recado("Não consegui falar com a função de envio. Confira se ela está publicada no Supabase.", true);
      return;
    }

    enviados += numero(resposta.enviados);
    falhas   += numero(resposta.falhas);
    pulados  += numero(resposta.pulados);
    p.progresso.feitos = Math.min(lista.length, i + lote.length);
    desenharProspeccao();

    if(resposta.cotaAcabou){ cotaAcabou = true; break; }
  }

  /* marca na base quem recebeu, com a data de hoje */
  if(!ehTeste && enviados){
    const hoje = hojeISO();
    for(const m of lista){
      if(m.id) await gravar("marcas", { ultimo_disparo: hoje }, m.id);
    }
  }

  p.enviando = false;
  p.progresso = null;
  p.resumo = { enviados, falhas, pulados, cotaAcabou };
  await carregarTudo();
  desenharProspeccao();

  if(ehTeste){
    recado(enviados ? "Teste enviado. Abra no celular e confira os nomes." : "O teste não saiu, olhe o resumo.", !enviados);
    return;
  }
  /* não limpo a sua seleção sozinho: pergunto antes */
  if(enviados && estado.prosp.publico === "selecionadas") perguntarLimparSelecao();
}

function perguntarLimparSelecao(){
  abrirJanela("Limpar a seleção?", `
    <p>O disparo terminou. Quer desmarcar as caixinhas das marcas que receberam?</p>
    <p class="dica-fonte">Se você pretende mandar para a mesma lista de novo, deixe marcado.</p>
    <div class="acoes-janela">
      <button class="btn btn-simples" id="manterSelecao">manter a seleção</button>
      <button class="btn btn-principal" id="limparAgora">limpar</button>
    </div>
  `);
  pegar("#manterSelecao").addEventListener("click", fecharJanela);
  pegar("#limparAgora").addEventListener("click", async () => {
    fecharJanela();
    const alvos = (estado.dados.marcas || []).filter(m => m.selecionada);
    for(const m of alvos) await gravar("marcas", { selecionada:false }, m.id);
    await carregarTudo();
    desenharProspeccao();
    recado("Seleção limpa.");
  });
}

/* ============================================================
   O PLANO B: A FILA DE RASCUNHOS
   Funciona sem Resend nenhum. Monta o e-mail de cada marca e
   abre o Gmail já preenchido.
   ============================================================ */
function abrirFilaRascunho(lista){
  const p = estado.prosp;
  if(!String(p.assunto || "").trim()){ recado("Escreva o assunto primeiro.", true); return; }
  if(!lista.length){ recado("Não há marcas nessa seleção.", true); return; }
  p.filaRascunho = lista.slice();
  p.posicaoFila = 0;
  mostrarRascunhoAtual();
}

function textoPuroDoEmail(marca){
  const p = estado.prosp;
  if(p.modo === "texto") return trocarChaves(p.texto, marca);
  /* no modo HTML, tira as marcações para o Gmail receber texto legível */
  const limpo = String(trocarChaves(p.html, marca))
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return limpo;
}

function mostrarRascunhoAtual(){
  const p = estado.prosp;
  const fila = p.filaRascunho || [];
  if(p.posicaoFila >= fila.length){
    fecharJanela();
    recado("Fila terminada. Tudo que você marcou como enviada já está registrado.");
    carregarTudo().then(desenharProspeccao);
    return;
  }
  const marca = fila[p.posicaoFila];
  const assunto = trocarChaves(p.assunto, marca);
  const corpo = textoPuroDoEmail(marca);
  const linkGmail = "https://mail.google.com/mail/?view=cm&fs=1" +
    "&to=" + encodeURIComponent(marca.email) +
    "&su=" + encodeURIComponent(assunto) +
    "&body=" + encodeURIComponent(corpo);

  abrirJanela(`Rascunho ${p.posicaoFila + 1} de ${fila.length}`, `
    <p class="dica-fonte">Para <b>${seguro(marca.nome)}</b> &nbsp;·&nbsp; ${seguro(marca.email)}</p>
    <div class="campo largo">
      <label>Assunto</label>
      <input id="rascunhoAssunto" value="${seguro(assunto)}" readonly>
    </div>
    <div class="campo largo">
      <label>Texto</label>
      <textarea id="rascunhoCorpo" rows="10" readonly>${seguro(corpo)}</textarea>
    </div>
    <div class="acoes-janela">
      <button class="btn btn-simples" id="pularRascunho">pular</button>
      <button class="btn btn-simples" id="copiarRascunho">${ICONE.copiar} copiar o texto</button>
      <a class="btn btn-simples" id="abrirGmail" href="${linkGmail}" target="_blank" rel="noopener">abrir no Gmail</a>
      <button class="btn btn-principal" id="marcarEnviada">marquei como enviada</button>
    </div>
  `, true);

  pegar("#pularRascunho").addEventListener("click", () => { p.posicaoFila++; mostrarRascunhoAtual(); });
  pegar("#copiarRascunho").addEventListener("click", async () => {
    try{ await navigator.clipboard.writeText(corpo); recado("Texto copiado."); }
    catch(e){ recado("Não consegui copiar. Selecione o texto e copie na mão.", true); }
  });
  pegar("#marcarEnviada").addEventListener("click", async () => {
    const hoje = hojeISO();
    if(marca.id) await gravar("marcas", { ultimo_disparo: hoje }, marca.id);
    /* registra no histórico, igual ao envio automático */
    if(window.sb){
      try{
        await window.sb.from("email_envios").insert({
          email: marca.email, marca: marca.nome, assunto: assunto, status: "ok", resend_id: "gmail"
        });
      }catch(e){}
    }
    p.posicaoFila++;
    mostrarRascunhoAtual();
  });
}

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
