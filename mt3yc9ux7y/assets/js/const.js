/* Constantes compartilhadas entre as páginas. Carregar ANTES de core.js. */
const URL_API = 'https://ekfyviemlszovciroacn.supabase.co/rest/v1/';
const KEY = 'sb_publishable_Bhsw4dhgFwk0jno5kZMeYQ_3tfouypX';
const TZ = 'America/Sao_Paulo';
const NS = 'http://www.w3.org/2000/svg';
const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
/* cidades da bacia: [nome, latitude, longitude] */
const CIDADES = [['Sabará', -19.886, -43.807], ['Caeté', -19.880, -43.669], ['Raposos', -19.966, -43.804],
  ['Nova Lima', -19.985, -43.847], ['Rio Acima', -20.088, -43.788], ['Itabirito', -20.253, -43.801]];

/* ===== Constantes que estavam no main.js ===== */
/* cores dos 4 estágios (variáveis CSS) */
const CORES=['--s0','--s1','--s2','--s3'];
/* escala das barras dos rios (cm) e níveis de referência */
const ESCALA={velhas:{max:750,lim:[450,565,670],nomes:['subindo 4,50','Roças Grandes 5,65','Caieira 6,70']},
  sabara:{max:520,lim:[269,359,448],nomes:['2,69 (Cemaden)','alerta 3,59','transborda 4,48']}};
/* título do destaque por estágio */
const TIT=['Rio normal: sem risco de enchente agora','Rio subindo: fique atento','Rio alto: risco de enchente','Rio muito alto: risco alto de enchente'];
/* pluviômetros da tabela de chuva: [cidade, código, local] */
const PLUV=[['Sabará','CEM-6224','Borba Gato'],['Sabará','CEM-6211','Ravena'],['Sabará','CEM-6222','N. S. de Fátima'],['Sabará','CEM-3126','Santa Inês'],
  ['Caeté','41210001','Centro (ANA)'],['Caeté','CEM-6218','Penedia'],['Caeté','CEM-6217','José Brandão'],['Caeté','CEM-6219','Cidade Jardim'],
  ['Nova Lima','CEM-4256','Honório Bicalho'],['Nova Lima','41193000','Rio do Peixe (ANA)'],['Nova Lima','CEM-4153','Jardim Canadá'],
  ['Rio Acima','41195050','Rio das Velhas (ANA)'],['Itabirito','CEM-19403','Itabirito']];
/* ordem das réguas na tabela de níveis (códigos das estações) */
const ORD=['315670023H','41210001','41200430','41195050','41193000','41180500'];
/* réguas rio acima (origem da água): [código, rótulo, cor] */
const EST=[['41180500','1. Rio Itabirito em Itabirito','--s1'],['41193000','2. Rio do Peixe em Nova Lima (abaixo de usina)','--s2'],['41195050','3. Rio das Velhas em Rio Acima','--s0'],['41200430','4. Rio das Velhas em Raposos','--velhas']];
/* pluviômetros de Sabará: [código, local] */
const PLUV_SAB=[['CEM-6224','Borba Gato'],['CEM-6211','Ravena'],['CEM-6222','N. S. de Fátima'],['CEM-3126','Santa Inês']];
/* severidade dos alertas da Defesa Civil: [cor, rótulo] */
const SEV={Extreme:['--s3','Extremo'],Severe:['--s3','Grave'],Moderate:['--s2','Moderado'],Minor:['--s1','Baixo'],Unknown:['--s1','']};
/* severidade dos avisos do INMET: [cor, nome da cor] */
const SEVI={'Perigo Potencial':['--s1','amarelo'],'Perigo':['--s2','laranja'],'Grande Perigo':['--s3','vermelho']};
/* rótulo do período do dia nas previsões do INMET */
const PER={manha:'manhã',tarde:'tarde',noite:'noite',dia:''};
/* hora em que termina cada período */
const FIM={manha:12,tarde:18,noite:24};
/* cidades da previsão do INMET */
const CID = CIDADES.map(c => c[0]);
/* estações dos gráficos dos eventos: [código, cor, nome] */
const ST=[['41195050','--ev1','Rio Acima'],['41200430','--ev2','Raposos'],['41210001','--ev3','Caeté'],['CEMSAB','--ev4','Rio Sabará']];
/* marcadores dos momentos observados */
const CIRC=['①','②','③','④'];
/* abas do painel: [botão, painel] */
const TABS=[['t-mapa','tab-mapa'],['t-prever','tab-prever'],['t-hist','tab-hist']];
/* nome na URL e título de cada aba */
const NOMES={'tab-mapa':['mapa','Até onde a água chega'],'tab-prever':['como-funciona','Como o painel funciona'],'tab-hist':['historico','Histórico das cheias']};
