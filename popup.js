// Classe principal para controlar a UI do popup
class ExtractorUI {
    constructor() {
        this.initializeElements();
        this.initializeEventListeners();
        this.extractedHTML = '';
    }

    initializeElements() {
        this.elements = {
            extractionType: document.getElementById('extractionType'),
            customTextContainer: document.getElementById('customTextContainer'),
            customText: document.getElementById('customText'),
            extractBtn: document.getElementById('extractBtn'),
            downloadBtn: document.getElementById('downloadBtn'),
            status: document.getElementById('status')
        };
        
        // Inicialmente desabilita o botão de download
        this.elements.downloadBtn.disabled = true;
    }

    initializeEventListeners() {
        this.elements.extractionType.addEventListener('change', () => this.handleExtractionTypeChange());
        this.elements.extractBtn.addEventListener('click', () => this.handleExtraction());
        this.elements.downloadBtn.addEventListener('click', () => this.handleDownload());
    }

    handleExtractionTypeChange() {
        const isCustom = this.elements.extractionType.value === 'custom';
        this.elements.customTextContainer.style.display = isCustom ? 'block' : 'none';
        
        if (isCustom) {
            this.elements.customText.focus();
        }
    }

    async handleExtraction() {
        const extractionType = this.elements.extractionType.value;
        const customText = this.elements.customText.value;

        if (extractionType === 'custom' && !customText.trim()) {
            this.showStatus('Por favor, insira um texto para buscar', 'error');
            return;
        }

        try {
            this.elements.extractBtn.disabled = true;
            this.showStatus('Extraindo conteúdo...', 'info');

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Verifica se a URL atual é do JusBrasil
            if (!tab.url.includes('jusbrasil.com.br')) {
                throw new Error('Esta extensão só funciona em páginas do JusBrasil');
            }

            // Injeta o content script se necessário
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });

            // Pequena pausa para garantir que o script foi carregado
            await new Promise(resolve => setTimeout(resolve, 100));

            const response = await this.sendMessageToTab(tab.id, {
                action: 'extract',
                extractionType,
                customText
            });

            if (response?.success) {
                this.extractedHTML = response.html;
                this.elements.downloadBtn.disabled = false;
                this.showStatus('Conteúdo extraído com sucesso!', 'success');
            } else {
                throw new Error(response?.error || 'Erro ao extrair conteúdo');
            }
        } catch (error) {
            console.error('Erro:', error);
            this.showStatus(error.message, 'error');
            this.elements.downloadBtn.disabled = true;
        } finally {
            this.elements.extractBtn.disabled = false;
        }
    }

    sendMessageToTab(tabId, message) {
        return new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tabId, message, response => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(response);
                }
            });
        });
    }

    handleDownload() {
        if (!this.extractedHTML) {
            this.showStatus('Nenhum conteúdo para baixar', 'error');
            return;
        }

        try {
            const filename = `extracao_${new Date().toISOString().slice(0, 10)}.html`;
            this.downloadFile(this.extractedHTML, filename, 'text/html');
            this.showStatus('Arquivo salvo!', 'success');
        } catch (error) {
            console.error('Erro ao salvar:', error);
            this.showStatus('Erro ao salvar o arquivo', 'error');
        }
    }

    downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        try {
            a.href = url;
            a.download = filename;
            a.click();
        } finally {
            setTimeout(() => URL.revokeObjectURL(url), 100);
        }
    }

    showStatus(message, type) {
        this.elements.status.textContent = message;
        this.elements.status.className = `status ${type}`;
    }
}

// Inicializa a UI quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new ExtractorUI();
});
