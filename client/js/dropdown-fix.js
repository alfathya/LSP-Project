// Fix untuk dropdown unit yang tidak terlihat
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Dropdown fix script loaded');
    
    function fixUnitDropdown() {
        const unitSelect = document.getElementById('itemUnit');
        if (unitSelect) {
            console.log('🔧 Fixing unit dropdown visibility');
            
            // Force basic styles
            unitSelect.style.setProperty('color', '#333', 'important');
            unitSelect.style.setProperty('background-color', 'white', 'important');
            unitSelect.style.setProperty('border', '1px solid #ddd', 'important');
            unitSelect.style.setProperty('padding', '8px 12px', 'important');
            unitSelect.style.setProperty('font-size', '14px', 'important');
            unitSelect.style.setProperty('border-radius', '4px', 'important');
            unitSelect.style.setProperty('visibility', 'visible', 'important');
            unitSelect.style.setProperty('opacity', '1', 'important');
            unitSelect.style.setProperty('display', 'block', 'important');
            
            // Force option styles
            const options = unitSelect.querySelectorAll('option');
            options.forEach(option => {
                option.style.setProperty('color', '#333', 'important');
                option.style.setProperty('background-color', 'white', 'important');
                option.style.setProperty('display', 'block', 'important');
            });
            
            console.log('🔧 Unit dropdown fixed');
        }
    }
    
    // Fix immediately
    fixUnitDropdown();
    
    // Fix after a delay
    setTimeout(fixUnitDropdown, 100);
    setTimeout(fixUnitDropdown, 500);
    setTimeout(fixUnitDropdown, 1000);
    
    // Fix when page becomes visible
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            fixUnitDropdown();
        }
    });
    
    // Fix on window focus
    window.addEventListener('focus', fixUnitDropdown);
    
    // Monitor for DOM changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                // Check if unit dropdown was added
                const addedNodes = Array.from(mutation.addedNodes);
                addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        if (node.id === 'itemUnit' || node.querySelector('#itemUnit')) {
                            setTimeout(fixUnitDropdown, 10);
                        }
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});