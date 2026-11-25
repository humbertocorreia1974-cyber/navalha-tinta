# Configurar Instagram/Facebook (mensagens diretas)

Instagram e Facebook Messenger usam o MESMO webhook da Meta - a configuração é uma só pros dois.

1. Crie (ou reaproveite) um app em https://developers.facebook.com do tipo "Business"
2. Adicione o produto **Webhooks** e o produto **Messenger** (e/ou **Instagram**, se for usar DM do Instagram)
3. Sua conta do Instagram precisa ser PROFISSIONAL (Criador ou Empresa) e estar VINCULADA a uma Página do Facebook - a Meta trata mensagens do Instagram através dessa Página
4. Em "Configurações do app" → "Básico", copie o **App Secret** - configure como a variável de ambiente `META_APP_SECRET`
5. Invente uma string qualquer (ex: um UUID) e configure como `META_WEBHOOK_VERIFY_TOKEN` - só serve pra Meta confirmar que é você configurando o webhook
6. Gere um **Token de Acesso da Página** (Page Access Token, sem expiração, gerado no painel do app → Messenger → Configurações de token) e configure como `FACEBOOK_PAGE_ACCESS_TOKEN` - o MESMO token funciona pra Instagram e Facebook, porque a Meta unificou o envio de mensagens das duas plataformas atrás da Página
7. Depois do deploy, registre o webhook no painel do app (Webhooks → editar assinatura): URL = `<URL_DO_SEU_APP>/api/social/webhook`, Verify Token = o mesmo valor de `META_WEBHOOK_VERIFY_TOKEN`, e assine o campo `messages` (tanto pra Página/Messenger quanto pra Instagram, conforme o que você ativou)
8. Pronto - mande uma mensagem direta pro Instagram ou pra Página do Facebook e o app já responde de verdade, usando a configuração do seu Assistente (a mesma de `/assistant-config`)

**Atenção**: sem `META_APP_SECRET` configurado corretamente, o webhook rejeita silenciosamente toda mensagem recebida (proteção contra alguém forjar mensagens se passando por cliente) - se as respostas não estiverem chegando, confira esse valor primeiro.

**Diferente do WhatsApp sem CNPJ**: não existe alternativa sem aprovação da Meta pra Instagram/Facebook - é sempre pela API oficial.
