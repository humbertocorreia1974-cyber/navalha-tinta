# Configurar o e-mail do Assistente (atendimento bidirecional)

Seu app já manda e-mail transacional (boas-vindas, redefinir senha) via `lib/email.ts`. Pra o Assistente também RECEBER e RESPONDER e-mails de clientes de verdade, é preciso ativar o recurso de **Inbound Email** da Resend (gratuito, mesma conta que você já usa pra enviar):

1. No painel da Resend (https://resend.com/domains), adicione (ou reaproveite) um domínio verificado
2. Vá em **Webhooks** → criar um novo, tipo **Inbound** (e-mail recebido), apontando pra `<URL_DO_SEU_APP>/api/email/webhook`
3. A Resend mostra um **Signing Secret** (formato `whsec_...`) na hora de criar o webhook - configure como a variável de ambiente `RESEND_WEBHOOK_SECRET`
4. Siga as instruções da Resend pra adicionar o registro MX do seu domínio apontando pra Resend - isso é o que faz os e-mails recebidos chegarem até ela
5. Configure `RESEND_API_KEY` (se ainda não tiver) e `EMAIL_FROM` com um endereço do mesmo domínio verificado (ex: `atendimento@seudominio.com`)
6. Pronto - um e-mail mandado pra esse endereço já cai no Assistente e ele responde de verdade, usando a configuração de `/assistant-config`

**Atenção**: sem `RESEND_WEBHOOK_SECRET` configurado corretamente, o webhook rejeita silenciosamente todo e-mail recebido (proteção contra e-mail forjado) - se as respostas não estiverem chegando, confira esse valor primeiro.

**Diferente do WhatsApp/Telegram/Instagram**: este canal exige um domínio próprio verificado (não tem caminho "sem domínio") - é a única exigência real, sem aprovação manual de terceiros como a Meta.
