# 🔍 JusBrasil Extrator

Uma extensão do Chrome que permite extrair conteúdo de páginas do JusBrasil de forma inteligente e eficiente, contornando bloqueios e oferecendo múltiplas opções de extração.

## ✨ Recursos Principais

### 🎯 **Extração "Inteiro Teor"**
- Extrai automaticamente o conteúdo completo do "Inteiro Teor" de documentos jurídicos
- Busca inteligente por containers de conteúdo com mais de 2000 caracteres
- Fallback automático para garantir que sempre extraia conteúdo relevante

### 🖱️ **Seleção Visual Interativa**
- Modo de seleção visual que permite escolher elementos específicos da página
- Highlight visual com tooltip informativo mostrando detalhes do elemento
- Busca automática do container de conteúdo principal relacionado
- Instruções visuais claras durante a seleção

### 🔍 **Busca Personalizada**
- Busca por texto específico em toda a página
- Suporte a múltiplos seletores CSS
- Busca inteligente por classes, IDs e conteúdo textual

### 📄 **Prévia em Tempo Real**
- Side panel com prévia exata do arquivo HTML que será exportado
- Renderização completa com estilos CSS aplicados
- Visualização do conteúdo antes do download

### 💾 **Download Automático e Manual**
- Download automático após extração bem-sucedida
- Botão de download manual no side panel
- Arquivos HTML limpos e organizados
- Nomenclatura automática com data

### 🧹 **Limpeza Inteligente de Conteúdo**
- Remoção automática de ícones, imagens e elementos visuais desnecessários
- Limpeza de anúncios, banners e elementos de interface
- Remoção de scripts, estilos e elementos de navegação
- Preservação apenas do conteúdo textual relevante

## 🚀 Como Usar

### 1. **Extração "Inteiro Teor"**
1. Acesse uma página do JusBrasil com documento jurídico
2. Clique no ícone da extensão
3. Selecione "Inteiro Teor" no dropdown
4. Clique em "Extrair Conteúdo"
5. O arquivo HTML será baixado automaticamente

### 2. **Seleção Visual**
1. Clique no ícone da extensão
2. Selecione "Seleção Visual" no dropdown
3. Clique em "Ativar Seleção Visual"
4. Passe o mouse sobre os elementos da página
5. Clique no elemento desejado
6. O side panel abrirá com a prévia
7. Clique em "Extrair Conteúdo" para baixar

### 3. **Busca Personalizada**
1. Selecione "Busca Personalizada" no dropdown
2. Digite o texto que deseja buscar
3. Clique em "Extrair Conteúdo"
4. O arquivo será baixado automaticamente

## 🛠️ Instalação

### **Instalação Manual (Desenvolvedor)**
1. Baixe ou clone este repositório
2. Abra o Chrome e vá para `chrome://extensions/`
3. Ative o "Modo do desenvolvedor"
4. Clique em "Carregar sem compactação"
5. Selecione a pasta da extensão
6. A extensão estará disponível na barra de ferramentas

### **Permissões Necessárias**
- `activeTab` - Para acessar a aba ativa
- `storage` - Para salvar configurações e dados temporários
- `scripting` - Para injetar scripts na página
- `sidePanel` - Para exibir o painel lateral
- `*://*.jusbrasil.com.br/*` - Para funcionar apenas no JusBrasil

## 📁 Estrutura do Projeto

```
extensao_jusbrasil/
├── manifest.json          # Configuração da extensão
├── background.js          # Service Worker principal
├── content.js             # Content Script para extração
├── popup.html             # Interface do popup
├── popup.js               # Lógica do popup
├── popup.css              # Estilos do popup
├── sidepanel.html         # Interface do side panel
├── sidepanel.js           # Lógica do side panel
└── images/                # Ícones da extensão
    ├── icon_16x16.png
    ├── icon_48x48.png
    └── icon_128x128.png
```

## 🔧 Funcionalidades Técnicas

### **Extração Inteligente**
- Busca por múltiplos termos relacionados ao "Inteiro Teor"
- Análise de estrutura de documento (parágrafos, títulos, etc.)
- Verificação de classes e IDs relacionados a conteúdo
- Fallback para `document.body` quando necessário

### **Seleção Visual Avançada**
- Overlay semi-transparente para seleção
- Tooltip informativo com detalhes do elemento
- Busca ascendente por containers de conteúdo
- Suporte a XPath para localização precisa

### **Limpeza de Conteúdo**
- Remoção de 40+ tipos de elementos desnecessários
- Limpeza de ícones, imagens e elementos visuais
- Remoção de anúncios e elementos de interface
- Preservação da estrutura textual relevante

### **Interface Responsiva**
- Side panel com prévia em tempo real
- Botões de ação intuitivos
- Feedback visual claro
- Instruções contextuais

## 📊 Recursos de Exportação

### **Formato HTML Limpo**
- Estrutura HTML5 semântica
- Estilos CSS inline para portabilidade
- Cabeçalho com informações da página
- Rodapé com data de extração
- URL da página original

### **Nomenclatura Automática**
- `extracao_jusbrasil_YYYY-MM-DD.html`
- Data baseada no momento da extração
- Nomes únicos para evitar sobrescrita

## 🎯 Casos de Uso

### **Advogados e Juristas**
- Extração de jurisprudências completas
- Coleta de decisões judiciais
- Análise de precedentes
- Pesquisa jurídica eficiente

### **Estudantes de Direito**
- Coleta de material de estudo
- Extração de casos práticos
- Análise de decisões judiciais
- Pesquisa acadêmica

### **Pesquisadores**
- Coleta de dados jurídicos
- Análise de tendências judiciais
- Estudos comparativos
- Pesquisa empírica

## 🔒 Segurança e Privacidade

- **Funciona apenas no JusBrasil** - Não acessa outros sites
- **Dados locais** - Informações salvas apenas localmente
- **Sem coleta de dados** - Não envia informações para servidores externos
- **Código aberto** - Transparência total do funcionamento

## 🐛 Solução de Problemas

### **Extensão não funciona**
1. Verifique se está em uma página do JusBrasil
2. Recarregue a página
3. Verifique se a extensão está ativada
4. Tente desativar e reativar a extensão

### **Conteúdo não é extraído**
1. Verifique se a página carregou completamente
2. Tente usar a seleção visual
3. Verifique se há conteúdo na página
4. Tente recarregar a página

### **Download não funciona**
1. Verifique as configurações de download do Chrome
2. Tente usar o botão de download manual
3. Verifique se há espaço em disco
4. Tente em uma aba privada

## 📝 Changelog

### **v1.0.0** - Versão Inicial
- ✅ Extração "Inteiro Teor" básica
- ✅ Seleção visual interativa
- ✅ Busca personalizada
- ✅ Download automático
- ✅ Limpeza de conteúdo
- ✅ Side panel com prévia
- ✅ Interface responsiva

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Faça commit das mudanças
4. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Ramos de Souza Janones**
- LinkedIn: [https://www.linkedin.com/in/ramos-souza/](https://www.linkedin.com/in/ramos-souza/)
- Email: [seu-email@exemplo.com]

## 🙏 Agradecimentos

- Comunidade do JusBrasil pela disponibilização do conteúdo
- Desenvolvedores da Chrome Extension API
- Comunidade open source por inspiração e ferramentas

---

**⚠️ Aviso Legal:** Esta extensão é para fins educacionais e de pesquisa. Respeite os termos de uso do JusBrasil e as leis de propriedade intelectual.
