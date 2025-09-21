chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!request || !request.action) {
        sendResponse({ success: false, error: 'Mensagem inválida' });
        return true;
    }
    
    switch (request.action) {
        case 'ping':
            sendResponse({ success: true, message: 'Content script SIMPLES ativo' });
            break;
            
        case 'activateSelection':
            try {
                const overlay = document.createElement('div');
                overlay.id = 'simple-selection-overlay';
                overlay.style.cssText = `
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
                document.body.appendChild(overlay);
                
                const handleMouseOver = (e) => {
                    e.target.style.outline = '2px solid #007bff';
                    e.target.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
                };
                
                const handleMouseOut = (e) => {
                    e.target.style.outline = '';
                    e.target.style.backgroundColor = '';
                };
                
                const handleClick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const element = e.target;
                    const elementInfo = {
                        tagName: element.tagName,
                        className: element.className,
                        id: element.id,
                        textContent: element.textContent.substring(0, 200)
                    };
                    
                    overlay.remove();
                    document.removeEventListener('mouseover', handleMouseOver);
                    document.removeEventListener('mouseout', handleMouseOut);
                    document.removeEventListener('click', handleClick);
                    
                    chrome.runtime.sendMessage({
                        action: 'elementSelected',
                        element: elementInfo,
                        preview: element.outerHTML.substring(0, 1000)
                    });
                };
                
                document.addEventListener('mouseover', handleMouseOver);
                document.addEventListener('mouseout', handleMouseOut);
                document.addEventListener('click', handleClick);
                
                sendResponse({ success: true });
            } catch (error) {
                console.error('Erro ao ativar seleção:', error);
                sendResponse({ success: false, error: error.message });
            }
            break;
            
        case 'deactivateSelection':
            const existingOverlay = document.getElementById('simple-selection-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
            }
            sendResponse({ success: true });
            break;
            
        default:
            sendResponse({ success: false, error: `Ação '${request.action}' não suportada` });
    }
    
    return true;
});

