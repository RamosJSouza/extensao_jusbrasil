// Verifica se a classe já foi declarada para evitar duplicação
if (window.ExtractorUI) {
    // ExtractorUI já foi declarada, ignorando
} else {

// Classe principal para controlar a UI do popup
class ExtractorUI {
    constructor() {
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeMessageListener();
        this.extractedHTML = '';
        this.selectedElement = null;
        this.isSelectionMode = false;
        this.messageListener = null;
    }

    initializeElements() {
        this.elements = {
            extractionType: document.getElementById('extractionType'),
            customTextContainer: document.getElementById('customTextContainer'),
            customText: document.getElementById('customText'),
            visualSelectionContainer: document.getElementById('visualSelectionContainer'),
            activateSelection: document.getElementById('activateSelection'),
            deactivateSelection: document.getElementById('deactivateSelection'),
            extractBtn: document.getElementById('extractBtn'),
            downloadBtn: document.getElementById('downloadBtn'),
            status: document.getElementById('status')
        };
        
        // Inicialmente desabilita o botão de download
        this.elements.downloadBtn.disabled = true;
    }

    initializeEventListeners() {
        this.elements.extractionType.addEventListener('change', () => this.handleExtractionTypeChange());
        this.elements.activateSelection.addEventListener('click', () => this.activateVisualSelection());
        this.elements.deactivateSelection.addEventListener('click', () => this.deactivateVisualSelection());
        this.elements.extractBtn.addEventListener('click', () => this.handleExtraction());
        this.elements.downloadBtn.addEventListener('click', () => this.handleDownload());
    }

    initializeMessageListener() {
        // Remove listener anterior se existir
        if (this.messageListener) {
            chrome.runtime.onMessage.removeListener(this.messageListener);
        }
        
        // Escuta por mensagens do background script
        this.messageListener = (message, sender, sendResponse) => {
            if (message.action === 'extractionComplete') {
                this.handleExtractionComplete(message.html);
            }
        };

        chrome.runtime.onMessage.addListener(this.messageListener);
    }

    handleExtractionComplete(html) {
        this.extractedHTML = html;
        this.elements.downloadBtn.disabled = false;
        this.showStatus('Conteúdo extraído com sucesso! O side panel foi aberto para visualização.', 'success');
        
        // Download automático
        if (this.extractedHTML) {
            setTimeout(() => {
                this.handleDownload();
            }, 1000); // Delay de 1 segundo para garantir que o side panel abra
        }
    }

    async handleExtraction() {
        const extractionType = this.elements.extractionType.value;
        const customText = this.elements.customText.value;

        if (extractionType === 'custom' && !customText.trim()) {
            this.showStatus('Por favor, insira um texto para buscar', 'error');
            return;
        }

        if (extractionType === 'visual') {
            this.showStatus('Use o modo de seleção visual para escolher um elemento', 'info');
            return;
        }

        try {
            this.elements.extractBtn.disabled = true;
            this.showStatus('Extraindo conteúdo...', 'info');

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab.url.includes('jusbrasil.com.br')) {
                throw new Error('Esta extensão só funciona em páginas do JusBrasil');
            }

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
                } else if (response === undefined) {
                    reject(new Error('Content script não está carregado ou não respondeu'));
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
            
            // Adiciona ao DOM temporariamente
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            throw error;
        } finally {
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 100);
        }
    }

    handleExtractionTypeChange() {
        const extractionType = this.elements.extractionType.value;
        
        // Mostra/oculta campos baseado no tipo de extração
        this.elements.customTextContainer.style.display = extractionType === 'custom' ? 'block' : 'none';
        this.elements.visualSelectionContainer.style.display = extractionType === 'visual' ? 'block' : 'none';
        
        // Atualiza texto do botão
        if (extractionType === 'visual') {
            this.elements.extractBtn.textContent = 'Usar Seleção Visual';
            this.elements.extractBtn.disabled = true;
        } else {
            this.elements.extractBtn.textContent = 'Extrair Conteúdo';
            this.elements.extractBtn.disabled = false;
        }
    }

    async activateVisualSelection() {
        try {
            this.elements.activateSelection.disabled = true;
            this.showStatus('Ativando seleção visual...', 'info');

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab.url.includes('jusbrasil.com.br')) {
                throw new Error('Esta extensão só funciona em páginas do JusBrasil');
            }

            const response = await this.sendMessageToTab(tab.id, {
                action: 'activateSelection'
            });

            if (response?.success) {
                this.isSelectionMode = true;
                this.elements.activateSelection.style.display = 'none';
                this.elements.deactivateSelection.style.display = 'inline-block';
                this.showStatus('Modo de seleção ativado! Clique em um elemento da página.', 'success');
            } else {
                throw new Error(response?.error || 'Erro ao ativar seleção visual');
            }
        } catch (error) {
            this.showStatus(error.message, 'error');
        } finally {
            this.elements.activateSelection.disabled = false;
        }
    }

    async deactivateVisualSelection() {
        try {
            this.elements.deactivateSelection.disabled = true;
            this.showStatus('Desativando seleção visual...', 'info');

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            const response = await this.sendMessageToTab(tab.id, {
                action: 'deactivateSelection'
            });

            if (response?.success) {
                this.isSelectionMode = false;
                this.elements.activateSelection.style.display = 'inline-block';
                this.elements.deactivateSelection.style.display = 'none';
                this.showStatus('Modo de seleção desativado.', 'info');
            } else {
                throw new Error(response?.error || 'Erro ao desativar seleção visual');
            }
        } catch (error) {
            this.showStatus(error.message, 'error');
        } finally {
            this.elements.deactivateSelection.disabled = false;
        }
    }

    showStatus(message, type) {
        this.elements.status.textContent = message;
        this.elements.status.className = `status ${type}`;
        this.elements.status.style.display = 'block';
        
        // Esconde a mensagem após 3 segundos
        setTimeout(() => {
            this.elements.status.style.display = 'none';
        }, 3000);
    }
}

// Inicializa a UI quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new ExtractorUI();
});

} // Fecha o bloco else de verificação de duplicação
