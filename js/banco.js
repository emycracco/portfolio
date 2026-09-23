/* ============================================================
   LIGACAO COM O BANCO (Supabase)

   Este e o unico arquivo com o endereco e a chave do banco.
   Todas as paginas leem daqui: o portfolio, o login e o admin.

   A chave abaixo e a PUBLICA (publishable). Ela pode ficar
   dentro do site sem problema, porque quem manda no que pode
   ser lido e escrito sao as regras de seguranca (RLS) que estao
   no arquivo banco.sql.

   NUNCA coloque aqui a chave secreta (service_role).
   ============================================================ */

window.BANCO = {
  url: "https://hcgjedqiprpmwepuiswa.supabase.co",
  chavePublica: "sb_publishable_CJKSgwt9saxTGXwfciXKUg_wpAO8A-M"
};

/* Cria a conexao, assim que a biblioteca do Supabase terminar de carregar.
   Se ela nao carregar (internet caiu, por exemplo), o site nao quebra:
   window.sb fica nulo e cada pagina se vira sem o banco. */
window.sb = null;

(function ligarBanco(){
  try {
    if (window.supabase && window.supabase.createClient) {
      window.sb = window.supabase.createClient(
        window.BANCO.url,
        window.BANCO.chavePublica
      );
    } else {
      console.warn("Supabase ainda nao carregou. Verifique a tag script do CDN.");
    }
  } catch (e) {
    console.warn("Nao consegui ligar no banco:", e && e.message);
    window.sb = null;
  }
})();

/* Atalho usado pelas paginas: devolve a conexao ou null. */
window.banco = function(){ return window.sb; };
