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
    
    extractionTypeSelect.addEventListener('change', function() {
        customTextContainer.style.display = this.value === 'custom' ? 'block' : 'none';
    });
    
    extractBtn.addEventListener('click', function() {
        const extractionType = extractionTypeSelect.value;
        const customText = customTextInput.value;
        
        if (extractionType === 'custom' && !customText) {
            showStatus('Por favor, insira um texto para buscar', 'error');
            return;
        }
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    action: 'extract',
                    extractionType: extractionType,
                    customText: customText
                },
                function(response) {
                    if (response && response.success) {
                        extractedHTML = response.html;
                        downloadBtn.disabled = false;
                        showStatus('Conteúdo extraído com sucesso!', 'success');
                    } else {
                        showStatus(response?.error || 'Erro ao extrair conteúdo', 'error');
                        downloadBtn.disabled = true;
                    }
                }
            );
        });
    });
    
    // Botão de download
    downloadBtn.addEventListener('click', function() {
        if (!extractedHTML) {
            showStatus('Nenhum conteúdo para baixar', 'error');
            return;
        }
        
        const blob = new Blob([extractedHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `extracao_${new Date().toISOString().slice(0, 10)}.html`;
        a.click();
        
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);
        
        showStatus('Arquivo salvo!', 'success');
    });
    
    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = 'status ' + type;
    }
});
