# JusBrasil Extrator

Extensão para Chrome que permite extrair conteúdo do JusBrasil contornando o bloqueio do Cloudflare.

## Instalação

1. Faça o download ou clone este repositório
2. Abra o Chrome e acesse `chrome://extensions`
3. Habilite o "Modo do desenvolvedor" no canto superior direito
4. Clique em "Carregar sem compactação"
5. Selecione a pasta onde você salvou este projeto

## Uso

1. Acesse qualquer página do JusBrasil
2. Clique no ícone da extensão
3. Escolha o tipo de extração:
   - Inteiro Teor: Extrai o conteúdo completo do processo
   - Texto específico: Permite buscar por um texto específico
   - Página completa: Extrai toda a página
4. Clique em "Extrair Conteúdo"
5. Após a extração, clique em "Baixar HTML" para salvar o conteúdo

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

## Suporte

Para problemas ou sugestões, por favor abra uma issue no GitHub.
