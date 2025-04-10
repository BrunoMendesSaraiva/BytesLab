const venom = require("venom-bot");

let userState = {}; // Armazena o estado da conversa por número

// Inicia o Venom-Bot
venom
  .create({
    session: "whatsapp-bot",
    multidevice: true,
    headless: true,
    useChrome: true,
    browserArgs: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-software-rasterizer",
    ],
  })
  .then((client) => {
    console.log("✅ Bot iniciado com sucesso.");
    start(client);
  })
  .catch((erro) => {
    console.error("❌ Erro ao iniciar o bot:", erro);
  });

function start(client) {
  client.onMessage((message) => {
    const numero = message.from;
    const mensagem = message.body.toLowerCase().trim();

    if (!userState[numero]) {
      userState[numero] = "inicio";
      enviarMensagem(
        client,
        numero,
        "👋 *Olá! Sou a Assistente Virtual do Serviço de Pós-Graduação da FMRP/USP.*\n\n" +
          "🎓 *Você já é nosso aluno de pós-graduação?*\n\n" +
          "Responda com *'Sim'* ou *'Não'* para continuarmos."
      );
      return;
    }

    processarMensagem(client, numero, mensagem);
  });
}

function isRespostaSim(mensagem) {
  return ["sim", "s", "ss"].includes(mensagem);
}

function isRespostaNao(mensagem) {
  return ["não", "nao", "n", "nn"].includes(mensagem);
}

function processarMensagem(client, numero, mensagem) {
  switch (mensagem) {
    case "resetar":
      delete userState[numero];
      enviarMensagem(
        client,
        numero,
        "♻️ *Seu estado foi resetado!* Digite qualquer mensagem para começar novamente."
      );
      break;

    case "voltar":
      userState[numero] = "inicio";
      enviarMensagem(
        client,
        numero,
        "🔙 *Você voltou ao menu inicial.*\n\n" +
          "👋 *Olá! Sou a Assistente Virtual do Serviço de Pós-Graduação da FMRP/USP.*\n\n" +
          "🎓 *Você já é nosso aluno de pós-graduação?*\n\n" +
          "Responda com *'Sim'* ou *'Não'* para continuarmos."
      );
      break;

    default:
      roteamentoDeEstado(client, numero, mensagem);
      break;
  }
}

function roteamentoDeEstado(client, numero, mensagem) {
  switch (userState[numero]) {
    case "inicio":
      if (isRespostaNao(mensagem)) {
        userState[numero] = "aguardando_voltar";
        enviarMensagem(
          client,
          numero,
          "📚 *Confira as opções que podem te interessar:* \n\n" +
            "🔸 *Conheça nossos Programas de Pós-Graduação:* \n" +
            "https://cpg.fmrp.usp.br/programas/programas \n\n" +
            "🖍️ *Processo Seletivo:* \n" +
            "https://cpg.fmrp.usp.br/programas/processo-seletivo \n\n" +
            "📚 *Aluno Especial:* \n" +
            "https://cpg.fmrp.usp.br/alunos/especiais \n\n" +
            
            "🔙 Para voltar ao menu inicial, digite *'Voltar'*."
        );
      } else if (isRespostaSim(mensagem)) {
        userState[numero] = "aguardando_resposta_ingresso";
        enviarMensagem(
          client,
          numero,
          "📌 *Você acabou de ingressar na pós-graduação?*\n\n" +
            "Responda com *'Sim'* ou *'Não'* para continuarmos."
        );
      } else {
        enviarMensagem(
          client,
          numero,
          "❓ *Por favor, responda com 'Sim' ou 'Não'.*"
        );
      }
      break;

    case "aguardando_resposta_ingresso":
      if (isRespostaSim(mensagem)) {
        userState[numero] = "aluno_ingressante";
        enviarMenuIngressante(client, numero);
      } else if (isRespostaNao(mensagem)) {
        userState[numero] = "aluno_regular";
        enviarMenuRegular(client, numero);
      } else {
        enviarMensagem(
          client,
          numero,
          "❓ *Por favor, responda com 'Sim' ou 'Não'.*"
        );
      }
      break;

    case "aluno_regular":
      processarAlunoRegular(client, numero, mensagem);
      break;

    case "aluno_ingressante":
      processarAlunoIngressante(client, numero, mensagem);
      break;

    default:
      enviarMensagem(
        client,
        numero,
        "❓ *Não entendi sua mensagem. Por favor, digite *'Voltar'* para reiniciar.*"
      );
  }
}

function enviarMenuRegular(client, numero) {
  enviarMensagem(
    client,
    numero,
    "📚 *Aluno Regular - Informações Disponíveis:*\n\n" +
      "1️⃣ Matrícula Semestral\n" +
      "2️⃣ Disciplinas\n" +
      "3️⃣ Exame de Qualificação\n" +
      "4️⃣ Solicitações/Documentos\n" +
      "5️⃣ Depósito Digital\n" +
      "6️⃣ Defesa\n" +
      "7️⃣ Diploma\n" +
      "8️⃣ PAE (Preparação Pedagógica)\n" +
      "9️⃣ Dúvidas Frequentes\n\n" +
      "Digite o número da opção desejada ou *'Voltar'* para retornar."
  );
}

function enviarMenuIngressante(client, numero) {
  enviarMensagem(
    client,
    numero,
    "🎓 *Bem-vindo à Pós-Graduação da FMRP!*\n\n" +
      "1️⃣ *Acesse o Sistema Janus*\n" +
      "2️⃣ *Crie seu E-mail USP*\n" +
      "3️⃣ *Solicite sua Carteirinha USP*\n" +
      "4️⃣ *Carteirinha Digital USP (e-Card USP)*\n" +
      "5️⃣ *Outras Informações*\n\n" +
      "Digite o número da opção desejada ou *'Voltar'* para retornar."
  );
}

function processarAlunoIngressante(client, numero, mensagem) {
  switch (mensagem) {
    case "1":
      enviarMensagem(
        client,
        numero,
        "🔑 *Acesse o Sistema Janus:*\n\n" +
          "*Como acessar o Sistema Janus-senha:*\n" +
          "• Acesse “Sistemas USP” em https://uspdigital.usp.br ou em https://uspdigital.usp.br/janus/comum/entrada.jsf, clique em “Primeiro Acesso” e insira seu Nº USP para gerar uma senha.\n" +
          "• A senha será encaminhada para o e-mail informado na Ficha de Inscrição.\n\n" +
          "• Caso não saiba seu nº USP, pergunte na secretaria do seu programa\n\n" +
          "☎️ Não resolveu sua dúvida? Entre em contato com a secretaria do programa ou com o atendimento (16)3315-3379\n\n" +
          "🔙 Para voltar ao menu, digite *'Voltar'* ou escolha outra opção."
      );
      break;

    case "2":
      enviarMensagem(
        client,
        numero,
        "📧 *Crie seu E-mail USP:*\n\n" +
          "• Acesse https://id.usp.br/ e clique em “Primeiro acesso”.\n" +
          "• Para ler e enviar mensagens acesse http://www.usp.br em “Webmail”. Após solicitar o e-mail “USP” solicite à Secretaria do Programa ou à Seção de Pós-Graduação que insira seu e-mail USP no Sistema Janus.\n" +
          "• É muito importante cadastrar o e-mail USP no Sistema Janus para receber as mensagens sobre o curso. \n" +
          "• Solicite na secretaria do programa o cadastro do e-mail USP.\n\n" +
          "☎️ Não resolveu sua dúvida? Entre em contato com a secretaria do programa ou com o atendimento (16)3315-3379\n\n" +
          "🔙 Para voltar ao menu, digite *'Voltar'* ou escolha outra opção."
      );
      break;

    case "3":
      enviarMensagem(
        client,
        numero,
        "🆔 *Solicite sua Carteirinha USP:*\n\n" +
          "• Acesse Sistema Janus em “Cartão USP- Nova solicitação- Salvar” e, posteriormente, clique em ”Incluir/alterar Foto” e anexe uma foto digital padrão documento 3×4, com fundo branco e com boa resolução.\n\n" +
          "• Poderá acompanhar o pedido em “Listar solicitação“.\n\n" +
          "• Será avisado através do e-mail USP quando a carteirinha estiver disponível para retirar na Seção de Pós-Graduação.\n" +
          "• Atenção: O Bilhete USP não é a carteirinha USP.  É um bilhete para uso exclusivo em alguns ônibus no campus da USP da cidade de São Paulo.\n\n" +
          "☎️ Não resolveu sua dúvida? Entre em contato com a secretaria do programa ou com o atendimento (16)3315-3379\n\n" +
          "🔙 Para voltar ao menu, digite *'Voltar'* ou escolha outra opção."
      );
      break;

    case "4":
      enviarMensagem(
        client,
        numero,
        "💳 *Carteirinha Digital USP (e-Card USP):*\n\n" +
          "• Acesse Sistema Janus em “Cartão USP- Nova solicitação- Salvar” e, posteriormente, clique em ”Incluir/alterar Foto” e anexe uma foto digital padrão documento 3×4, com fundo branco e com boa resolução, não pode ter outros elementos na foto. Só conseguiremos autorizar a emissão do cartão se ele estiver completo, com a realização do pedido + foto inserida.\n" +
          "• Será avisado através do e-mail USP quando a carteirinha estiver disponível na Seção de Pós-Graduação.\n" +
          "• Poderá acompanhar o pedido em “Listar solicitação“.\n" +
          "• A emissão da 1ª via é gratuita.\n" +
          "• Para a Renovação do Cartão, basta entrar no sistema, enquanto for aluno regular, e, a partir do mês do vencimento, solicitar novo cartão.\n" +
          "• Carteirinha Digital USP (e-card USP).\n" +
          "http://www.prg.usp.br/?p=27481 \n" +
          "• Atenção: O Bilhete USP não é a carteirinha USP. É um bilhete para uso exclusivo em alguns ônibus no campus da USP da cidade de São Paulo.\n\n" +
          "☎️ Não resolveu sua dúvida? Entre em contato com a secretaria do programa ou com o atendimento (16)3315-3379\n\n" +
          "🔙 Para voltar ao menu, digite *'Voltar'* ou escolha outra opção."
      );
      break;

    case "5":
      enviarMensagem(
        client,
        numero,
        "ℹ️ *Outras Informações:*\n\n" +
          "Entrada no Campus (selo de identificação para carro):\n" +
          "• Acesse o site https://www.prefeiturarp.usp.br/pages/veiculos-2016/scripts/. \n\n" +
          "Atendimento Médico:\n" +
          "• Departamento de Saúde-UBAS (Unidade Básica de Assistência à Saúde). Situado na Rua Pedreira de Freitas, casa 14, e-mail ubas.rp@usp.br\n\n" +
          "Alunos Estrangeiros:\n" +
          "• CAPEE – Centro de Apoio ao Professor e Estudante Estrangeiro, acesse o site https://www.prefeiturarp.usp.br/page.asp?url=capee. \n\n" +
          "Biblioteca do Campus:\n" +
          "• Biblioteca Central do Campus, Restaurante Central, Atendimento Social, Atividades Culturais e Atividades Físicas (CEFER), consulte o site https://www.bcrp.prefeiturarp.usp.br/. \n\n" +
          "☎️ Não resolveu sua dúvida? Entre em contato com a secretaria do programa ou com o atendimento (16)3315-3379\n\n" +
          "🔙 Para voltar ao menu, digite *'Voltar'* ou escolha outra opção."
      );
      break;

    default:
      enviarMensagem(
        client,
        numero,
        "⚠️ *Opção inválida!* Digite um número de *1* a *5* ou *'Voltar'* para retornar."
      );
      break;
  }
}
function processarAlunoRegular(client, numero, mensagem) {
  if (mensagem.toLowerCase() === "voltar") {
    userState[numero] = "inicio";
    enviarMensagem(
      client,
      numero,
      "☎️ Não resolveu sua dúvida? Entre em contato com a secretaria do programa ou com o atendimento (16)3315-3379\n\n" +
        "🔙 Para voltar ao menu, digite *'Voltar'* ou escolha outra opção."
    );
    return;
  }

  switch (mensagem) {
    case "1":
      enviarMensagem(
        client,
        numero,
        "📑 *Matrícula Semestral:*\n\n" +
          "https://uspdigital.usp.br/janus/comum/entrada.jsf \n\n" +
          "⚠️ *Atenção:* Não fazer matrícula por 2 semestres consecutivos implica em desligamento automático do curso.\n\n" +
          "📅 *Prazos:* Janeiro/Fevereiro e Julho.\n\n" +
          "*Perdeu o prazo?* Preencha o formulário de matrícula semestral e envie para a secretaria:\n" +
          "https://cpg.fmrp.usp.br/informacoes/formularios \n\n" +
          "☎️ Não resolveu sua dúvida? Entre em contato com a secretaria do programa ou com o atendimento (16)3315-3379\n\n" +
          "🔙 Para voltar ao menu, digite *'Voltar'* ou escolha outra opção."
      );
      break;

    case "2":
      enviarMensagem(
        client,
        numero,
        "📚 *Disciplinas:*\n\n" +
          "https://uspdigital.usp.br/janus/comum/entrada.jsf \n\n" +
          "• Para consultar as disciplinas oferecidas no semestre acesse Sistema Janus e clique em https://uspdigital.usp.br/janus/componente/disciplinasOferecidasInicial.jsf \n" +
          "Matriculas em disciplinas são realizadas durante o período web informado pela PRPG, acompanhe os e-mails informativos enviados.\n\n" +
          "📜 *Resolução CoPGr 8546:*\n" +
          "• Resolução CoPGr 8546 de 1º de dezembro de 2023, que estabelece critérios sobre a carga mínima de créditos a serem integralizados em disciplinas presenciais. De acordo com a referida resolução (Art. 1º) …fica estabelecido que o discente matriculado no Programa de Pós-Graduação deverá integralizar no mínimo 60% dos créditos mínimos exigidos em disciplinas na forma presencial.\n" +
          "https://leginf.usp.br/?resolucao=resolucao-copgr-no-8546-de-1o-de-dezembro-de-2023 \n\n" +
          "☎️ Não resolveu sua dúvida? Entre em contato com a secretaria do programa ou com o atendimento (16)3315-3379\n\n" +
          "🔙 Para voltar ao menu, digite *'Voltar'* ou escolha outra opção."
      );
      break;
    case "3":
      enviarMensagem(
        client,
        numero,
        "📑 *Exame de Qualificação:*\n\n" +
          "• Verifique o Regulamento do Programa e prazos para inscrição e realização do exame de qualificação.\n" +
          "☎️ Não resolveu sua dúvida?, entre em contato com a secretaria do programa ou com o atendimento (16)3315-3379\n\n" +
          "🔙 Para voltar ao menu, digite *'Voltar'* ou escolha outra opção."
      );
      break;

    case "4":
      enviarMensagem(
        client,
        numero,
        "📄 *Solicitações/Documentos:*\n\n" +
          "*Declarações Online – Sistema Janus*\n" +
          "• Os estudantes contam com o menu “Declarações” no Sistema Janus, no qual poderão emitir diretamente do sistema os seguintes documentos com autenticação eletrônica:\n" +
          "• Declaração de Matrícula;\n" +
          "• Atestado de Conclusão de Disciplinas;\n" +
          "• Atestado de Matrícula com Disciplinas;\n" +
          "• Ficha do Aluno.\n\n" +
          "*Demais declarações – Site da CPG*\n" +
          "Solicitar Documentos:\n" +
          "https://cpg.fmrp.usp.br/informacoes/solicitar-documentos \n" +
          "Exemplo: declaração de matrícula para TRANSERP.\n\n" +
          "*Requerimentos*\n" +
          "https://uspdigital.usp.br/janus/comum/entrada.jsf \n" +
          "Para solicitações como:\n" +
          "• Aproveitamento de créditos em disciplina cursada fora da USP;\n" +
          "• Aproveitamento de créditos em disciplina cursada na USP;\n" +
          "• Atribuição de créditos especiais;\n" +
          "• Trancamento de matrícula;\n" +
          "• ou realizar outros tipos de solicitações (opção Outros requerimentos).\n\n" +
          "Em caso de dúvida em como fazer sua solicitação, veja o tutorial abaixo:\n" +
          "https://cpg.fmrp.usp.br/informacoes/tutoriais. \n\n" +
          "☎️ Não resolveu sua dúvida? Entre em contato com a secretaria do programa ou com o atendimento (16)3315-3379\n\n" +
          "🔙 Para voltar ao menu, digite *'Voltar'* ou escolha outra opção."
      );
      break;

    case "5":
      enviarMensagem(
        client,
        numero,
        "📥 *Depósito Digital:*\n\n" +
          "*Siga as instruções para realizar o depósito digital da sua dissertação/tese:*\n" +
          "https://cpg.fmrp.usp.br/alunos/defesas/deposito-digital \n\n" +
          "☎️ Não resolveu sua dúvida?, entre em contato com a secretaria do programa ou com o atendimento (16)3315-3379\n\n" +
          "🔙 Para voltar ao menu, digite *'Voltar'* ou escolha outra opção."
      );
      break;

    case "6":
      enviarMensagem(
        client,
        numero,
        "📖 *Defesa:*\n\n" +
          "*Agende sua defesa com antecedência mínima de 7 dias úteis:*\n" +
          "https://cpg.fmrp.usp.br/defesas \n\n" +
          "☎️ Não resolveu sua dúvida?, entre em contato com a secretaria do programa ou com o atendimento (16)3315-3379\n\n" +
          "🔙 Para voltar ao menu, digite *'Voltar'* ou escolha outra opção."
      );
      break;

    case "7":
      enviarMensagem(
        client,
        numero,
        "🎓 *Diploma:*\n\n" +
          "*Informações sobre como retirar seu diploma:*\n" +
          "https://cpg.fmrp.usp.br/diplomas \n\n" +
          "☎️ Não resolveu sua dúvida?, entre em contato com a secretaria do programa ou com o atendimento (16)3315-3379\n\n" +
          "🔙 Para voltar ao menu, digite *'Voltar'* ou escolha outra opção."
      );
      break;

    case "8":
      enviarMensagem(
        client,
        numero,
        "📚 *PAE (Preparação Pedagógica):*\n\n" +
          "*Participe do programa de preparação pedagógica.*\n" +
          "https://cpg.fmrp.usp.br/pae \n\n" +
          "☎️ Não resolveu sua dúvida?, entre em contato com a secretaria do programa ou com o atendimento (16)3315-3379\n\n" +
          "🔙 Para voltar ao menu, digite *'Voltar'* ou escolha outra opção."
      );
      break;

    case "9":
      enviarMensagem(
        client,
        numero,
        "❓ *Dúvidas Frequentes:*\n\n" +
          "*Confira as dúvidas mais comuns dos alunos.*\n" +
          "https://cpg.fmrp.usp.br/faq \n\n" +
          "☎️ Não resolveu sua dúvida?, entre em contato com a secretaria do programa ou com o atendimento (16)3315-3379\n\n" +
          "🔙 Para voltar ao menu, digite *'Voltar'* ou escolha outra opção."
      );
      break;

    default:
      enviarMensagem(
        client,
        numero,
        "⚠️ *Opção inválida!* Digite um número de *1* a *9* ou *'Voltar'* para retornar."
      );
      break;
  }
}

function enviarMensagem(client, numero, mensagem) {
  client
    .sendText(numero, mensagem)
    .then(() => console.log(`Mensagem enviada para ${numero}`))
    .catch((erro) =>
      console.error(`❌ Erro ao enviar mensagem para ${numero}:`, erro)
    );
}
