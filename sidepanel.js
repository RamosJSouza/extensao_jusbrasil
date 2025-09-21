// Side Panel para visualização de seleção
class SelectionViewer {
    constructor() {
        this.initializeElements();
        this.initializeEventListeners();
        this.loadSelection();
    }

    initializeElements() {
        this.elements = {
            noSelection: document.getElementById('noSelection'),
            selectionInfo: document.getElementById('selectionInfo'),
            elementTag: document.getElementById('elementTag'),
            elementId: document.getElementById('elementId'),
            elementClasses: document.getElementById('elementClasses'),
            elementText: document.getElementById('elementText'),
            elementBreadcrumb: document.getElementById('elementBreadcrumb'),
            previewContent: document.getElementById('previewContent'),
            extractBtn: document.getElementById('extractBtn'),
            downloadBtn: document.getElementById('downloadBtn'),
            clearBtn: document.getElementById('clearBtn'),
            refreshBtn: document.getElementById('refreshBtn'),
            status: document.getElementById('status')
        };
    }

    initializeEventListeners() {
        this.elements.extractBtn.addEventListener('click', () => this.extractContent());
        this.elements.downloadBtn.addEventListener('click', () => this.downloadHTML());
        this.elements.clearBtn.addEventListener('click', () => this.clearSelection());
        this.elements.refreshBtn.addEventListener('click', () => this.loadSelection());
        
        // Escuta por atualizações do storage
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'local' && (changes.selectedElement || changes.preview || changes.extractedHTML)) {
                this.loadSelection();
            }
        });
    }

    async loadSelection() {
        try {
            const result = await chrome.storage.local.get(['selectedElement', 'preview', 'extractedHTML']);
            
            if (result.selectedElement && result.preview) {
                this.showSelection(result.selectedElement, result.preview, result.extractedHTML);
            } else {
                this.showNoSelection();
            }
        } catch (error) {
            this.showError('Erro ao carregar seleção');
        }
    }

    showSelection(element, preview, extractedHTML = null) {
        this.elements.noSelection.style.display = 'none';
        this.elements.selectionInfo.style.display = 'block';
        
        // Preenche informações do elemento
        this.elements.elementTag.textContent = element.tagName || 'N/A';
        this.elements.elementId.textContent = element.id || 'N/A';
        this.elements.elementClasses.textContent = element.className || 'N/A';
        this.elements.elementText.textContent = element.textContent || 'N/A';
        
        // Gera breadcrumb
        this.elements.elementBreadcrumb.innerHTML = this.generateBreadcrumb(element);
        
        // Gera prévia do HTML de exportação
        this.generateExportPreview(element, preview);
        
        // Mostra/oculta botão de download baseado no HTML extraído
        if (extractedHTML) {
            this.elements.downloadBtn.style.display = 'inline-block';
            this.elements.extractBtn.textContent = '✅ Conteúdo Extraído';
            this.elements.extractBtn.disabled = true;
            this.showStatus('Conteúdo extraído com sucesso! Clique em "Baixar HTML" para salvar o arquivo.', 'success');
        } else {
            this.elements.downloadBtn.style.display = 'none';
            this.elements.extractBtn.textContent = '✅ Extrair Conteúdo';
            this.elements.extractBtn.disabled = false;
            this.showStatus('Elemento selecionado com sucesso!', 'success');
        }
    }

    showNoSelection() {
        this.elements.noSelection.style.display = 'block';
        this.elements.selectionInfo.style.display = 'none';
    }

    generateBreadcrumb(element) {
        const breadcrumb = [];
        let current = element;
        
        while (current && current !== document.body && breadcrumb.length < 5) {
            const tag = current.tagName.toLowerCase();
            const id = current.id ? `#${current.id}` : '';
            const classes = current.className ? `.${current.className.split(' ').slice(0, 2).join('.')}` : '';
            breadcrumb.unshift(`${tag}${id}${classes}`);
            current = current.parentElement;
        }
        
        return breadcrumb.join(' > ');
    }

    generateExportPreview(element, preview) {
        // Cria uma prévia do HTML de exportação que será gerado
        const date = new Date().toLocaleString('pt-BR');
        const title = 'Conteúdo Selecionado';
        const url = window.location.href;
        
        // HTML de exportação completo (igual ao que será salvo)
        const exportHTML = `<!DOCTYPE html>
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
        <p>URL: <a href="${url}" target="_blank">${url}</a></p>
    </div>
    
    <div class="content">
        ${preview}
    </div>
    
    <div class="footer">
        <p>Extraído em: ${date}</p>
    </div>
</body>
</html>`;

        // Mostra a prévia REAL do arquivo de exportação (com estilos aplicados)
        this.elements.previewContent.innerHTML = `
            <div style="border: 2px solid #007bff; border-radius: 8px; padding: 15px; background: white; margin-bottom: 15px;">
                <h4 style="color: #007bff; margin: 0 0 10px 0; font-size: 1.1em;">📄 Prévia do Arquivo de Exportação</h4>
                <p style="margin: 0 0 15px 0; color: #666; font-size: 0.9em;">
                    Esta é a renderização exata do arquivo HTML que será baixado:
                </p>
            </div>
            
            <!-- Prévia REAL com estilos aplicados -->
            <div style="border: 1px solid #ddd; border-radius: 4px; overflow: hidden; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; max-width: 1200px; margin: 0 auto;">
                    <div style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #ddd;">
                        <h1 style="color: #333; margin: 0 0 10px 0; font-size: 1.5em;">${title}</h1>
                        <p style="margin: 0; color: #666; font-size: 0.9em;">
                            URL: <a href="${url}" target="_blank" style="color: #007bff; text-decoration: none;">${url}</a>
                        </p>
                    </div>
                    
                    <div style="margin-top: 20px;">
                        ${preview}
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 0.8em; color: #666;">
                        <p style="margin: 0;">Extraído em: ${date}</p>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 10px; padding: 10px; background: #e7f3ff; border-radius: 4px; font-size: 0.85em; color: #0066cc;">
                <strong>💡 Dica:</strong> Esta é a renderização exata do arquivo HTML que será baixado, com todos os estilos CSS aplicados.
            </div>
        `;
    }

    async extractContent() {
        try {
            this.elements.extractBtn.disabled = true;
            this.showStatus('Extraindo conteúdo...', 'info');

            // Busca o elemento selecionado no storage
            const result = await chrome.storage.local.get(['selectedElement']);
            
            if (!result.selectedElement) {
                throw new Error('Nenhum elemento selecionado');
            }

            // Envia mensagem para o content script extrair o elemento
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            const response = await new Promise((resolve, reject) => {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'extractVisualElement',
                    element: result.selectedElement
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve(response);
                    }
                });
            });

            if (response && response.success) {
                // Salva o HTML extraído no storage
                await chrome.storage.local.set({
                    extractedHTML: response.html
                });

                // Notifica o background script
                chrome.runtime.sendMessage({
                    action: 'extractionComplete',
                    html: response.html
                });

                this.showStatus('Conteúdo extraído com sucesso!', 'success');
                this.loadSelection(); // Recarrega para mostrar o botão de download
            } else {
                throw new Error(response?.error || 'Erro ao extrair conteúdo');
            }
        } catch (error) {
            this.showStatus(`Erro: ${error.message}`, 'error');
        } finally {
            this.elements.extractBtn.disabled = false;
        }
    }

    async downloadHTML() {
        try {
            // Busca o HTML extraído no storage
            const result = await chrome.storage.local.get(['extractedHTML']);
            
            if (!result.extractedHTML) {
                this.showError('Nenhum HTML extraído encontrado. Execute a extração primeiro.');
                return;
            }
            
            // Cria o arquivo para download
            const filename = `extracao_jusbrasil_${new Date().toISOString().slice(0, 10)}.html`;
            const blob = new Blob([result.extractedHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            // Cria link de download
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            
            // Adiciona ao DOM temporariamente e clica
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Limpa a URL
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
            this.showStatus(`Download iniciado: ${filename}`, 'success');
            
        } catch (error) {
            this.showError(`Erro no download: ${error.message}`);
        }
    }

    async clearSelection() {
        try {
            await chrome.storage.local.remove(['selectedElement', 'preview', 'extractedHTML']);
            this.showNoSelection();
            this.showStatus('Seleção limpa', 'info');
        } catch (error) {
            this.showError('Erro ao limpar seleção');
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

    showError(message) {
        this.showStatus(`Erro: ${message}`, 'error');
    }
}

// Inicializa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new SelectionViewer();
});
