# Configurar o Telegram

1. Abra o Telegram e converse com o [@BotFather](https://t.me/BotFather)
2. Mande `/newbot`, escolha um nome e um username (precisa terminar em `bot`, ex: `minhaloja_bot`)
3. O BotFather te devolve um TOKEN (formato `123456:ABC-...`) - configure isso como a variável de ambiente `TELEGRAM_BOT_TOKEN` no seu deploy
4. Depois do deploy, registre o webhook UMA VEZ rodando este comando (troque `<TOKEN>` e `<URL_DO_SEU_APP>`):

```
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=<URL_DO_SEU_APP>/api/telegram/webhook"
```

5. Pronto - mande uma mensagem pro seu bot no Telegram e ele já responde de verdade, usando a configuração do seu Assistente (a mesma de `/assistant-config`).

**Diferente do WhatsApp sem CNPJ**: o Telegram não precisa de QR code nem de manter nada conectado o tempo todo - o próprio Telegram entrega a mensagem via HTTP quando ela chega, então funciona normalmente mesmo com o app hibernando entre uma mensagem e outra.
