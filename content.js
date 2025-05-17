// Classe principal para extração de conteúdo
class ContentExtractor {
    constructor() {
        console.log('JusBrasil Extrator - Content Script inicializado');
        this.initialize();
    }

    initialize() {
        chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
    }

    handleMessage(request, sender, sendResponse) {
        if (request.action !== 'extract') {
            sendResponse({ success: false, error: 'Ação não suportada' });
            return true;
        }

        try {
            const content = this.extractContent(request.extractionType, request.customText);
            if (!content) {
                throw new Error('Nenhum conteúdo encontrado para extrair');
            }

            const cleanContent = this.cleanContent(content);
            const finalHtml = this.createFinalHtml(
                cleanContent.innerHTML,
                request.extractionType,
                request.customText
            );

            sendResponse({ success: true, html: finalHtml });
        } catch (error) {
            console.error('Erro na extração:', error);
            sendResponse({ success: false, error: error.message });
        }

        return true;
    }

    extractContent(type, customText = '') {
        switch (type) {
            case 'inteiroTeor':
                return this.extractFullContent();
            case 'custom':
                if (!customText.trim()) {
                    throw new Error('Texto para busca não especificado');
                }
                return this.extractCustomContent(customText);
            case 'full':
                return document.body;
            default:
                throw new Error('Tipo de extração inválido');
        }
    }

    extractFullContent() {
        console.log('Buscando "Inteiro Teor"...');
        
        const possibleElements = [
            ...document.querySelectorAll('h1,h2,h3,h4,h5,h6,span,strong,b,div'),
            ...document.querySelectorAll('[class*="inteiro-teor"],[id*="inteiro-teor"]'),
            ...document.querySelectorAll('[class*="inteiroTeor"],[id*="inteiroTeor"]')
        ];

        let marker = possibleElements.find(el => 
            /^\s*Inteiro\s+Teor\s*$/i.test(el.textContent.trim())
        );

        if (!marker) {
            marker = possibleElements.find(el => 
                el.textContent.toLowerCase().includes('inteiro teor')
            );
        }

        if (!marker) {
            console.log('Marcador "Inteiro Teor" não encontrado');
            return null;
        }

        console.log('Marcador "Inteiro Teor" encontrado');
        return this.findContentContainer(marker);
    }

    extractCustomContent(text) {
        console.log(`Buscando texto: "${text}"...`);
        
        const searchText = text.toLowerCase();
        const selectors = [
            `h1,h2,h3,h4,h5,h6,span,strong,b,div`,
            `[class*="${searchText}"],[id*="${searchText}"]`,
            `*`
        ];

        let foundElement = null;

        for (const selector of selectors) {
            const elements = [...document.querySelectorAll(selector)];
            
            foundElement = elements.find(el => 
                new RegExp(`^\\s*${text}\\s*$`, 'i').test(el.textContent.trim())
            );

            if (!foundElement) {
                foundElement = elements.find(el => 
                    el.textContent.toLowerCase().includes(searchText)
                );
            }

            if (foundElement) break;
        }

        if (!foundElement) {
            console.log(`Texto "${text}" não encontrado`);
            return null;
        }

        console.log(`Texto "${text}" encontrado`);
        return this.findContentContainer(foundElement);
    }

    findContentContainer(element) {
        let container = element.nextElementSibling;
        
        if (!container?.innerHTML.trim()) {
            container = element.parentElement;
        }

        if (!container?.innerHTML.trim()) {
            container = element.closest('div, article, section');
        }

        return container || element;
    }

    cleanContent(element) {
        if (!element) return null;
        
        const clone = element.cloneNode(true);
        
        const selectorsToRemove = [
            'script', 'style', 'link', 'meta', 'iframe',
            'img[src*="banner"]', 'img[src*="ads"]',
            'div[class*="ads"]', 'div[class*="banner"]',
            'div[class*="social"]', 'div[class*="share"]',
            'div[class*="navigation"]', 'div[class*="menu"]',
            'div[class*="sidebar"]', 'div[class*="related"]',
            '.advertisement', '.share-buttons', '.social-media',
            '[class*="cookie"]', '[class*="popup"]',
            'nav', 'header', 'footer'
        ];

        selectorsToRemove.forEach(selector => {
            clone.querySelectorAll(selector).forEach(el => el.remove());
        });

        return clone;
    }

    createFinalHtml(content, type, searchText = '') {
        const date = new Date().toLocaleString('pt-BR');
        let title = '';
        
        switch(type) {
            case 'inteiroTeor':
                title = 'Inteiro Teor';
                break;
            case 'custom':
                title = `Conteúdo: "${searchText}"`;
                break;
            case 'full':
                title = 'Página Completa';
                break;
        }
        
        return `<!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .header {
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #ddd;
                }
                .content {
                    margin-top: 20px;
                }
                .footer {
                    margin-top: 30px;
                    padding-top: 10px;
                    border-top: 1px solid #ddd;
                    font-size: 0.8em;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${title}</h1>
                <p>URL: <a href="${window.location.href}" target="_blank">${window.location.href}</a></p>
            </div>
            
            <div class="content">
                ${content}
            </div>
            
            <div class="footer">
                <p>Extraído em: ${date}</p>
            </div>
        </body>
        </html>`;
    }
}

// Inicializa o extrator quando o script é carregado
new ContentExtractor();
