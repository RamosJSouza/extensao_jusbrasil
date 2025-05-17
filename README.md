# JusBrasil Extrator

Extensão para Google Chrome que permite extrair conteúdo jurídico do site JusBrasil, mesmo contornando as restrições aplicadas por mecanismos como o Cloudflare. Ideal para advogados, estudantes de Direito ou qualquer pessoa que precise acessar e salvar informações jurídicas de forma prática e rápida.

---

## 📖 História do Projeto

A ideia desta extensão nasceu de uma necessidade real: um amigo advogado sempre precisava extrair decisões e trechos de processos do site JusBrasil para colar no Word e trabalhar com mais agilidade. Inicialmente, eu o ajudava com pequenos scripts JavaScript executados manualmente no console do navegador.

Com o tempo, percebi que o JusBrasil impunha bloqueios automatizados, dificultando essa prática. Para melhorar a experiência, desenvolvi primeiro uma página simples, mas ela também foi impactada pelas restrições. A solução definitiva foi criar esta extensão para o Chrome, que além de funcional, serviu como um ótimo exercício de desenvolvimento e está agora disponível aqui como parte do meu portfólio.

Caso tenha dúvidas, precise de funcionalidades adicionais ou queira colaborar, sinta-se à vontade para me chamar no [LinkedIn](https://www.linkedin.com/in/ramos-souza/).

---

## 🚀 Instalação

1. Faça o download ou clone este repositório.
2. Acesse `chrome://extensions` no navegador Chrome.
3. Ative o **Modo do desenvolvedor** (canto superior direito).
4. Clique em **"Carregar sem compactação"**.
5. Selecione a pasta onde salvou este projeto.

---

## 🧠 Como Usar

1. Acesse uma página do JusBrasil que contenha o conteúdo desejado.
2. Clique no ícone da extensão na barra do navegador.
3. Escolha o tipo de extração:
   - **Inteiro Teor**: Extrai apenas o conteúdo principal do processo.
   - **Texto específico**: Busca e extrai um trecho de acordo com o termo informado.
   - **Página completa**: Extrai o HTML completo da página atual.
4. Clique em **"Extrair Conteúdo"**.
5. Após a extração, clique em **"Baixar HTML"** para salvar o conteúdo localmente.

---

## 🧩 Tutorial de Instalação para Leigos

Se você ou alguém que for usar esta extensão nunca instalou uma extensão fora da Chrome Web Store, recomendo este vídeo que explica o processo de forma simples e em português:

📺 **Como instalar uma extensão no Google Chrome: passo a passo**  
🔗 [Assista no YouTube](https://www.youtube.com/watch?v=3kQ92GUxoRo)

---

## 📢 Aviso Importante: Publicação na Chrome Web Store

Caso você deseje ou tenha intenção de publicar esta extensão na **Chrome Web Store** ou em qualquer outra loja de navegadores, **por favor, me avise antes da publicação**.

Isso ajuda a:

- **Divulgar oficialmente** a extensão nas minhas redes;
- **Manter o controle de qualidade** e atualizações da versão pública;
- **Garantir os créditos adequados** ao projeto original.

**Desenvolvedor:** Ramos de Souza Janones  
🔗 [LinkedIn](https://www.linkedin.com/in/ramos-souza/)

Sua colaboração e iniciativa são muito bem-vindas. Vamos construir algo incrível juntos!

...

## Estrutura do Projeto

```
extensao_jusbrasil/
├── manifest.json      # Configuração da extensão
├── popup.html        # Interface da extensão
├── popup.js         # Lógica da interface
├── content.js       # Script que interage com a página
├── styles/
│   └── popup.css    # Estilos da interface
└── images/          # Ícones da extensão
    ├── icon_16x16.png
    ├── icon_48x48.png
    └── icon_128x128.png
```


---

## 📄 Licença

Distribuído sob a **Licença ISC** (Internet Systems Consortium).

Você pode usar, modificar e distribuir este código livremente, **desde que mantenha os devidos créditos ao desenvolvedor original**:

**Ramos de Souza Janones**  
[LinkedIn: https://www.linkedin.com/in/ramos-souza/](https://www.linkedin.com/in/ramos-souza/)

---

## 💬 Suporte

Encontrou um problema? Tem sugestões ou quer contribuir?  
Abra uma *issue* aqui no GitHub ou entre em contato diretamente comigo pelo [LinkedIn](https://www.linkedin.com/in/ramos-souza/).  
Será um prazer colaborar com você!

---


