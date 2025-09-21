// Service Worker para gerenciar comunicação entre popup, content script e side panel

// Verifica se as APIs estão disponíveis
if (typeof chrome === 'undefined' || !chrome.runtime) {
    // Chrome APIs não estão disponíveis
} else {
    // Chrome APIs disponíveis
}

// Listener principal de mensagens
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Verifica se a mensagem é válida
    if (!message || !message.action) {
        sendResponse({ success: false, error: 'Mensagem inválida' });
        return true;
    }
    
    try {
        switch (message.action) {
            case 'elementSelected':
                handleElementSelected(message, sender, sendResponse);
                break;
                
            case 'getSelectedElement':
                handleGetSelectedElement(sendResponse);
                return true; // Indica resposta assíncrona
                
            case 'clearSelection':
                handleClearSelection(sendResponse);
                break;
                
            case 'extractionComplete':
                handleExtractionComplete(message, sendResponse);
                break;
                
            default:
                sendResponse({ success: false, error: `Ação '${message.action}' não suportada no background` });
        }
    } catch (error) {
        sendResponse({ success: false, error: error.message });
    }
    
    return true;
});

// Função para lidar com elemento selecionado
async function handleElementSelected(message, sender, sendResponse) {
    try {
        // Salva o elemento selecionado no storage
        await chrome.storage.local.set({
            selectedElement: message.element,
            preview: message.preview
        });
        
        // Abre o side panel
        await chrome.sidePanel.open({ windowId: sender.tab.windowId });
        
        sendResponse({ success: true });
    } catch (error) {
        sendResponse({ success: false, error: error.message });
    }
}

// Função para obter elemento selecionado
async function handleGetSelectedElement(sendResponse) {
    try {
        const result = await chrome.storage.local.get(['selectedElement', 'preview']);
        
        if (result.selectedElement && result.preview) {
            sendResponse({ success: true, element: result.selectedElement, preview: result.preview });
        } else {
            sendResponse({ success: false, error: 'Nenhum elemento selecionado' });
        }
    } catch (error) {
        sendResponse({ success: false, error: error.message });
    }
}

// Função para limpar seleção
async function handleClearSelection(sendResponse) {
    try {
        await chrome.storage.local.remove(['selectedElement', 'preview', 'extractedHTML']);
        sendResponse({ success: true });
    } catch (error) {
        sendResponse({ success: false, error: error.message });
    }
}

// Função para lidar com extração completa
async function handleExtractionComplete(message, sendResponse) {
    try {
        // Salva o HTML extraído no storage
        await chrome.storage.local.set({
            extractedHTML: message.html
        });
        
        // Notifica o popup sobre a extração completa
        chrome.runtime.sendMessage({
            action: 'extractionComplete',
            html: message.html
        });
        
        sendResponse({ success: true });
    } catch (error) {
        sendResponse({ success: false, error: error.message });
    }
}
