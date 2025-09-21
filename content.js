// Verifica se o script já foi carregado para evitar duplicação
if (window.jusbrasilExtractorLoaded) {
    // Script já carregado, ignorando
} else {
    window.jusbrasilExtractorLoaded = true;

// Classe principal para extração de conteúdo
class ContentExtractor {
    constructor() {
        this.isSelectionMode = false;
        this.selectionOverlay = null;
        this.highlightOverlay = null;
        this.infoTooltip = null;
        this.currentElement = null;
        this.initialize();
    }

    initialize() {
        // Verifica se chrome.runtime está disponível
        if (typeof chrome === 'undefined' || !chrome.runtime) {
            return;
        }
        
        // Remove listener anterior se existir
        if (this.messageListener) {
            chrome.runtime.onMessage.removeListener(this.messageListener);
        }
        
        this.messageListener = this.handleMessage.bind(this);
        chrome.runtime.onMessage.addListener(this.messageListener);
    }

    cleanup() {
        this.deactivateSelectionMode(() => {});
        if (this.messageListener) {
            chrome.runtime.onMessage.removeListener(this.messageListener);
        }
    }

    handleMessage(request, sender, sendResponse) {
        // Verifica se a mensagem é válida
        if (!request || !request.action) {
            sendResponse({ success: false, error: 'Mensagem inválida' });
            return true;
        }

        try {
            switch (request.action) {
                case 'extract':
                    this.handleExtraction(request, sendResponse);
                    break;
                case 'activateSelection':
                    this.activateSelectionMode(sendResponse);
                    break;
                case 'deactivateSelection':
                    this.deactivateSelectionMode(sendResponse);
                    break;
                case 'extractVisualElement':
                    this.extractVisualElement(request, sendResponse);
                    break;
                case 'ping':
                    // Mensagem de teste
                    sendResponse({ success: true, message: 'Content script ativo' });
                    break;
                default:
                    sendResponse({ success: false, error: `Ação '${request.action}' não suportada` });
            }
        } catch (error) {
            sendResponse({ success: false, error: error.message });
        }
        
        return true;
    }

    activateSelectionMode(sendResponse) {
        try {
            this.isSelectionMode = true;
            this.createSelectionOverlay();
            this.createInfoTooltip();
            this.addSelectionListeners();
            this.showSelectionInstructions();
            sendResponse({ success: true });
        } catch (error) {
            sendResponse({ success: false, error: error.message });
        }
    }

    deactivateSelectionMode(sendResponse) {
        try {
            this.isSelectionMode = false;
            this.removeSelectionOverlay();
            this.removeInfoTooltip();
            this.removeSelectionListeners();
            this.hideSelectionInstructions();
            sendResponse({ success: true });
        } catch (error) {
            sendResponse({ success: false, error: error.message });
        }
    }

    createSelectionOverlay() {
        this.selectionOverlay = document.createElement('div');
        this.selectionOverlay.id = 'jusbrasil-selection-overlay';
        this.selectionOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.1);
            z-index: 999999;
            pointer-events: none;
            cursor: crosshair;
        `;
        document.body.appendChild(this.selectionOverlay);
    }

    createInfoTooltip() {
        this.infoTooltip = document.createElement('div');
        this.infoTooltip.id = 'jusbrasil-info-tooltip';
        this.infoTooltip.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 12px;
            z-index: 1000000;
            pointer-events: none;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display: none;
        `;
        document.body.appendChild(this.infoTooltip);
    }

    removeSelectionOverlay() {
        if (this.selectionOverlay) {
            this.selectionOverlay.remove();
            this.selectionOverlay = null;
        }
    }

    removeInfoTooltip() {
        if (this.infoTooltip) {
            this.infoTooltip.remove();
            this.infoTooltip = null;
        }
    }

    showSelectionInstructions() {
        const instructions = document.createElement('div');
        instructions.id = 'jusbrasil-instructions';
        instructions.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #007bff;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            z-index: 1000001;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 400px;
        `;
        instructions.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 5px;">🔍 Modo de Seleção Ativo</div>
            <div>Passe o mouse sobre os elementos para visualizar informações</div>
            <div style="font-size: 12px; margin-top: 5px; opacity: 0.9;">Clique para selecionar • ESC para cancelar</div>
        `;
        document.body.appendChild(instructions);
    }

    hideSelectionInstructions() {
        const instructions = document.getElementById('jusbrasil-instructions');
        if (instructions) {
            instructions.remove();
        }
    }

    addSelectionListeners() {
        document.addEventListener('mouseover', this.handleMouseOver.bind(this));
        document.addEventListener('mouseout', this.handleMouseOut.bind(this));
        document.addEventListener('click', this.handleClick.bind(this));
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    removeSelectionListeners() {
        document.removeEventListener('mouseover', this.handleMouseOver.bind(this));
        document.removeEventListener('mouseout', this.handleMouseOut.bind(this));
        document.removeEventListener('click', this.handleClick.bind(this));
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    }

    handleMouseOver(event) {
        if (!this.isSelectionMode) return;
        
        // Remove highlight do elemento anterior
        if (this.currentElement && this.currentElement !== event.target) {
            this.removeHighlight(this.currentElement);
        }
        
        // Adiciona highlight ao elemento atual
        this.addHighlight(event.target);
        this.currentElement = event.target;
        
        // Mostra informações no tooltip
        this.showElementInfo(event.target, event);
    }

    handleMouseOut(event) {
        if (!this.isSelectionMode) return;
        
        // Remove highlight
        this.removeHighlight(event.target);
        this.hideElementInfo();
        
        if (this.currentElement === event.target) {
            this.currentElement = null;
        }
    }

    addHighlight(element) {
        element.style.outline = '2px solid #007bff';
        element.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
        element.style.position = 'relative';
        element.style.zIndex = '999998';
    }

    removeHighlight(element) {
        element.style.outline = '';
        element.style.backgroundColor = '';
        element.style.position = '';
        element.style.zIndex = '';
    }

    showElementInfo(element, event) {
        if (!this.infoTooltip) return;
        
        const rect = element.getBoundingClientRect();
        const info = this.getElementInfo(element);
        
        this.infoTooltip.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 4px;">${info.tagName}</div>
            ${info.id ? `<div>ID: ${info.id}</div>` : ''}
            ${info.className ? `<div>Classes: ${info.className.split(' ').slice(0, 3).join(', ')}</div>` : ''}
            <div style="margin-top: 4px; font-size: 11px; opacity: 0.8;">
                ${info.textContent.substring(0, 50)}${info.textContent.length > 50 ? '...' : ''}
            </div>
        `;
        
        // Posiciona o tooltip
        const tooltipRect = this.infoTooltip.getBoundingClientRect();
        let left = event.clientX + 10;
        let top = event.clientY - tooltipRect.height - 10;
        
        // Ajusta se sair da tela
        if (left + tooltipRect.width > window.innerWidth) {
            left = event.clientX - tooltipRect.width - 10;
        }
        if (top < 0) {
            top = event.clientY + 10;
        }
        
        this.infoTooltip.style.left = `${left}px`;
        this.infoTooltip.style.top = `${top}px`;
        this.infoTooltip.style.display = 'block';
    }

    hideElementInfo() {
        if (this.infoTooltip) {
            this.infoTooltip.style.display = 'none';
        }
    }

    handleClick(event) {
        if (!this.isSelectionMode) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        const element = event.target;
        const preview = this.createPreview(element);
        const elementInfo = this.getElementInfo(element);
        
        // Envia a seleção para o background script
        chrome.runtime.sendMessage({
            action: 'elementSelected',
            element: elementInfo,
            preview: preview
        });
        
        // Remove highlight e tooltip
        this.removeHighlight(element);
        this.hideElementInfo();
        
        // Desativa o modo de seleção
        this.deactivateSelectionMode(() => {});
    }

    handleKeyDown(event) {
        if (!this.isSelectionMode) return;
        
        if (event.key === 'Escape') {
            this.hideElementInfo();
            this.deactivateSelectionMode(() => {});
        }
    }

    extractVisualElement(request, sendResponse) {
        // Processa de forma assíncrona
        setTimeout(() => {
            try {
                const element = this.findElementByInfo(request.element);
                if (!element) {
                    throw new Error('Elemento não encontrado na página');
                }

                // Busca o container de conteúdo principal
                const contentContainer = this.findContentContainer(element);
                const elementToExtract = contentContainer || element;

                const cleanContent = this.cleanContent(elementToExtract);
                const finalHtml = this.createFinalHtml(
                    cleanContent.innerHTML,
                    'visual',
                    ''
                );

                sendResponse({ success: true, html: finalHtml });
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        }, 100); // Pequeno delay para processar assincronamente
        
        return true; // Indica que a resposta será assíncrona
    }

    findElementByInfo(elementInfo) {
        let element;
        
        // Tenta encontrar o elemento pelo ID primeiro
        if (elementInfo.id) {
            element = document.getElementById(elementInfo.id);
            if (element) return element;
        }
        
        // Se não encontrou, tenta pelo XPath
        if (elementInfo.xpath) {
            try {
                element = document.evaluate(
                    elementInfo.xpath,
                    document,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                ).singleNodeValue;
                if (element) return element;
            } catch (e) {
                // Erro ao usar XPath, continua
            }
        }
        
        // Se ainda não encontrou, busca por texto similar
        if (elementInfo.textContent) {
            const elements = document.querySelectorAll('*');
            for (const el of elements) {
                if (el.textContent.trim().startsWith(elementInfo.textContent.trim().substring(0, 50))) {
                    return el;
                }
            }
        }
        
        return null;
    }

    getElementInfo(element) {
        return {
            tagName: element.tagName,
            className: element.className,
            id: element.id,
            textContent: element.textContent.substring(0, 200) + (element.textContent.length > 200 ? '...' : ''),
            innerHTML: element.innerHTML.substring(0, 1000) + (element.innerHTML.length > 1000 ? '...' : ''),
            xpath: this.getXPath(element)
        };
    }

    getXPath(element) {
        if (element.id) {
            return `//*[@id="${element.id}"]`;
        }
        
        if (element === document.body) {
            return '/html/body';
        }
        
        let path = '';
        for (; element && element.nodeType === 1; element = element.parentNode) {
            let index = 0;
            for (let sibling = element.previousSibling; sibling; sibling = sibling.previousSibling) {
                if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
                    index++;
                }
            }
            
            const tagName = element.tagName.toLowerCase();
            const pathIndex = index ? `[${index + 1}]` : '';
            path = `/${tagName}${pathIndex}${path}`;
        }
        
        return path;
    }

    createPreview(element) {
        // Busca o container pai que contém todo o conteúdo relacionado
        const contentContainer = this.findContentContainer(element);
        
        if (contentContainer) {
            const clone = contentContainer.cloneNode(true);
            
            // Limpa o conteúdo para a prévia
            this.cleanContentForPreview(clone);
            
            // Limita o tamanho da prévia (aumentado para 2000 caracteres)
            if (clone.textContent.length > 2000) {
                const text = clone.textContent.substring(0, 2000);
                clone.innerHTML = text + '...';
            }
            
            return clone.outerHTML;
        } else {
            // Fallback: usa o elemento selecionado
            const clone = element.cloneNode(true);
            this.cleanContentForPreview(clone);
            
            if (clone.textContent.length > 500) {
                const text = clone.textContent.substring(0, 500);
                clone.innerHTML = text + '...';
            }
            
            return clone.outerHTML;
        }
    }

    findContentContainer(element) {
        // Estratégias para encontrar o container de conteúdo principal
        
        // 1. Busca por elementos comuns de conteúdo
        const contentSelectors = [
            '[class*="content"]',
            '[class*="document"]',
            '[class*="text"]',
            '[class*="main"]',
            '[class*="article"]',
            '[class*="post"]',
            '[class*="inteiro"]',
            '[class*="teor"]',
            '[id*="content"]',
            '[id*="document"]',
            '[id*="text"]',
            '[id*="main"]',
            '[id*="article"]',
            '[id*="post"]',
            '[id*="inteiro"]',
            '[id*="teor"]'
        ];
        
        // 2. Busca ascendente por containers de conteúdo
        let current = element;
        let bestContainer = null;
        let maxContentLength = 0;
        
        while (current && current !== document.body) {
            const textLength = current.textContent.trim().length;
            
            // Verifica se é um container de conteúdo válido
            if (textLength > 100 && textLength > maxContentLength) {
                // Verifica se contém o elemento selecionado
                if (current.contains(element)) {
                    // Verifica se tem classes ou IDs relacionados a conteúdo
                    const hasContentClass = contentSelectors.some(selector => {
                        try {
                            return current.matches(selector);
                        } catch (e) {
                            return false;
                        }
                    });
                    
                    // Verifica se tem estrutura de documento (parágrafos, títulos, etc.)
                    const hasDocumentStructure = current.querySelectorAll('p, h1, h2, h3, h4, h5, h6, div, span').length > 3;
                    
                    if (hasContentClass || hasDocumentStructure) {
                        bestContainer = current;
                        maxContentLength = textLength;
                    }
                }
            }
            
            current = current.parentElement;
        }
        
        // 3. Se não encontrou um container específico, busca por "Inteiro Teor"
        if (!bestContainer) {
            const inteiroTeorElements = document.querySelectorAll('*');
            for (const el of inteiroTeorElements) {
                if (el.textContent.toLowerCase().includes('inteiro teor') && 
                    el.textContent.length > 500 && 
                    el.contains(element)) {
                    bestContainer = el;
                    break;
                }
            }
        }
        
        // 4. Se ainda não encontrou, usa o container pai mais próximo com conteúdo significativo
        if (!bestContainer) {
            current = element.parentElement;
            while (current && current !== document.body) {
                if (current.textContent.trim().length > 200) {
                    bestContainer = current;
                    break;
                }
                current = current.parentElement;
            }
        }
        
        return bestContainer;
    }

    findInteiroTeorContainer(marker) {
        // Estratégias específicas para encontrar o container do "Inteiro Teor"
        
        // 1. Busca por containers comuns de conteúdo de documentos
        const documentSelectors = [
            '[class*="document"]', '[class*="content"]', '[class*="text"]',
            '[class*="main"]', '[class*="article"]', '[class*="post"]',
            '[class*="inteiro"]', '[class*="teor"]', '[class*="full"]',
            '[id*="document"]', '[id*="content"]', '[id*="text"]',
            '[id*="main"]', '[id*="article"]', '[id*="post"]',
            '[id*="inteiro"]', '[id*="teor"]', '[id*="full"]'
        ];
        
        // 2. Busca ascendente por containers de documento
        let current = marker;
        let bestContainer = null;
        let maxContentLength = 0;
        
        while (current && current !== document.body) {
            const textLength = current.textContent.trim().length;
            
            // Verifica se é um container de documento válido
            if (textLength > 1000 && textLength > maxContentLength) {
                // Verifica se contém o marcador "Inteiro Teor"
                if (current.contains(marker)) {
                    // Verifica se tem classes ou IDs relacionados a documentos
                    const hasDocumentClass = documentSelectors.some(selector => {
                        try {
                            return current.matches(selector);
                        } catch (e) {
                            return false;
                        }
                    });
                    
                    // Verifica se tem estrutura de documento (parágrafos, títulos, etc.)
                    const hasDocumentStructure = current.querySelectorAll('p, h1, h2, h3, h4, h5, h6, div, span').length > 10;
                    
                    // Verifica se tem conteúdo significativo (mais de 2000 caracteres)
                    const hasSignificantContent = textLength > 2000;
                    
                    if (hasDocumentClass || hasDocumentStructure || hasSignificantContent) {
                        bestContainer = current;
                        maxContentLength = textLength;
                    }
                }
            }
            
            current = current.parentElement;
        }
        
        // 3. Se não encontrou um container específico, busca por elementos que contenham "Inteiro Teor" e muito conteúdo
        if (!bestContainer) {
            const inteiroTeorElements = document.querySelectorAll('*');
            for (const el of inteiroTeorElements) {
                if (el.textContent.toLowerCase().includes('inteiro teor') && 
                    el.textContent.length > 5000 && 
                    el.contains(marker)) {
                    bestContainer = el;
                    break;
                }
            }
        }
        
        // 4. Se ainda não encontrou, busca por containers com muito texto
        if (!bestContainer) {
            current = marker.parentElement;
            while (current && current !== document.body) {
                if (current.textContent.trim().length > 5000) {
                    bestContainer = current;
                    break;
                }
                current = current.parentElement;
            }
        }
        
        // 5. Se ainda não encontrou, usa o marcador como fallback
        if (!bestContainer) {
            bestContainer = marker;
        }
        
        return bestContainer;
    }

    cleanContentForPreview(element) {
        // Remove scripts, estilos e elementos desnecessários
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
            element.querySelectorAll(selector).forEach(el => el.remove());
        });
    }

    handleExtraction(request, sendResponse) {
        try {
            let content;
            
            if (request.extractionType === 'visual' && request.selectedElement) {
                content = this.extractVisualElementByInfo(request.selectedElement);
            } else {
                content = this.extractContent(request.extractionType, request.customText);
            }
            
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
            sendResponse({ success: false, error: error.message });
        }
    }

    extractVisualElementByInfo(elementInfo) {
        let element;
        
        // Tenta encontrar o elemento pelo ID primeiro
        if (elementInfo.id) {
            element = document.getElementById(elementInfo.id);
        }
        
        // Se não encontrou, tenta pelo XPath
        if (!element && elementInfo.xpath) {
            element = document.evaluate(
                elementInfo.xpath,
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            ).singleNodeValue;
        }
        
        // Se ainda não encontrou, busca por texto similar
        if (!element && elementInfo.textContent) {
            const elements = document.querySelectorAll('*');
            for (const el of elements) {
                if (el.textContent.trim().startsWith(elementInfo.textContent.trim().substring(0, 50))) {
                    element = el;
                    break;
                }
            }
        }
        
        return element;
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
        // Busca mais abrangente por "Inteiro Teor"
        const searchTerms = [
            'inteiro teor',
            'inteiro-teor',
            'inteiroTeor',
            'INTEIRO TEOR',
            'Inteiro Teor'
        ];
        
        let marker = null;
        
        // Primeiro, tenta encontrar por texto exato
        for (const term of searchTerms) {
            const elements = document.querySelectorAll('*');
            for (const el of elements) {
                if (el.textContent.trim() === term) {
                    marker = el;
                    break;
                }
            }
            if (marker) break;
        }
        
        // Se não encontrou, tenta busca parcial
        if (!marker) {
            for (const term of searchTerms) {
                const elements = document.querySelectorAll('*');
                for (const el of elements) {
                    if (el.textContent.toLowerCase().includes(term.toLowerCase())) {
                        marker = el;
                        break;
                    }
                }
                if (marker) break;
            }
        }
        
        // Se ainda não encontrou, tenta por classes e IDs
        if (!marker) {
            const classSelectors = [
                '[class*="inteiro-teor"]',
                '[class*="inteiroTeor"]',
                '[id*="inteiro-teor"]',
                '[id*="inteiroTeor"]'
            ];
            
            for (const selector of classSelectors) {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    marker = elements[0];
                    break;
                }
            }
        }
        
        // Se ainda não encontrou, retorna o body como fallback
        if (!marker) {
            return document.body;
        }

        return this.findInteiroTeorContainer(marker);
    }

    extractCustomContent(text) {
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
            return null;
        }

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
            // Scripts e estilos
            'script', 'style', 'link', 'meta', 'iframe',
            
            // Imagens e ícones
            'img', 'svg', 'i[class*="icon"]', 'i[class*="fa"]', 
            'span[class*="icon"]', 'div[class*="icon"]',
            'img[src*="banner"]', 'img[src*="ads"]', 'img[src*="icon"]',
            'img[src*="logo"]', 'img[src*="button"]',
            
            // Elementos de interface
            'button', 'input', 'select', 'textarea', 'form',
            'div[class*="button"]', 'div[class*="btn"]',
            'div[class*="control"]', 'div[class*="toolbar"]',
            
            // Anúncios e banners
            'div[class*="ads"]', 'div[class*="banner"]',
            'div[class*="advertisement"]', 'div[class*="promo"]',
            
            // Redes sociais e compartilhamento
            'div[class*="social"]', 'div[class*="share"]',
            '.share-buttons', '.social-media', '.social-share',
            
            // Navegação e menus
            'div[class*="navigation"]', 'div[class*="menu"]',
            'div[class*="nav"]', 'div[class*="breadcrumb"]',
            'nav', 'header', 'footer',
            
            // Sidebars e conteúdo relacionado
            'div[class*="sidebar"]', 'div[class*="related"]',
            'div[class*="widget"]', 'div[class*="aside"]',
            
            // Popups e modais
            '[class*="cookie"]', '[class*="popup"]',
            '[class*="modal"]', '[class*="overlay"]',
            
            // Elementos de layout desnecessários
            'div[class*="spacer"]', 'div[class*="clear"]',
            'div[class*="separator"]', 'hr',
            
            // Elementos específicos do JusBrasil
            'div[class*="toolbar"]', 'div[class*="actions"]',
            'div[class*="controls"]', 'div[class*="buttons"]',
            'div[class*="icons"]', 'div[class*="badges"]'
        ];

        selectorsToRemove.forEach(selector => {
            clone.querySelectorAll(selector).forEach(el => el.remove());
        });

        // Remove elementos vazios que podem ter sobrado
        this.removeEmptyElements(clone);

        return clone;
    }

    removeEmptyElements(element) {
        // Remove elementos que ficaram vazios após a limpeza
        const emptySelectors = [
            'div:empty', 'span:empty', 'p:empty',
            'div:not(:has(*)):not(:has(text))',
            'span:not(:has(*)):not(:has(text))'
        ];

        emptySelectors.forEach(selector => {
            element.querySelectorAll(selector).forEach(el => {
                // Verifica se o elemento está realmente vazio
                if (el.textContent.trim() === '' && el.children.length === 0) {
                    el.remove();
                }
            });
        });
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
            case 'visual':
                title = 'Conteúdo Selecionado';
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
window.jusbrasilExtractorInstance = new ContentExtractor();

} // Fecha o bloco else de verificação de duplicação
