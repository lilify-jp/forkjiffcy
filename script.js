document.addEventListener('DOMContentLoaded', () => {
    const proxyForm = document.getElementById('proxy-form');
    const endpointsList = document.getElementById('endpoints-list');
    
    // Load existing endpoints
    loadEndpoints();
    
    // Handle form submission
    proxyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const pathInput = document.getElementById('path');
        const targetInput = document.getElementById('target');
        
        const path = pathInput.value.trim();
        const target = targetInput.value.trim();
        
        // Validate path starts with /
        if (!path.startsWith('/')) {
            showStatus('Path must start with /', false);
            return;
        }
        
        // Validate target is a valid URL
        try {
            new URL(target);
        } catch (error) {
            showStatus('Target must be a valid URL', false);
            return;
        }
        
        try {
            const response = await fetch('/api/endpoints', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ path, target })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showStatus('Proxy endpoint added successfully', true);
                pathInput.value = '';
                targetInput.value = '';
                loadEndpoints();
            } else {
                showStatus(`Error: ${data.error || 'Failed to add endpoint'}`, false);
            }
        } catch (error) {
            showStatus(`Error: ${error.message}`, false);
        }
    });
    
    // Load endpoints from API
    async function loadEndpoints() {
        try {
            endpointsList.innerHTML = '<div class="loading">Loading...</div>';
            
            const response = await fetch('/api/endpoints');
            const endpoints = await response.json();
            
            if (endpoints.length === 0) {
                endpointsList.innerHTML = '<div class="no-endpoints">No proxy endpoints configured</div>';
                return;
            }
            
            endpointsList.innerHTML = '';
            
            endpoints.forEach(endpoint => {
                const endpointEl = document.createElement('div');
                endpointEl.className = 'endpoint-item';
                
                endpointEl.innerHTML = `
                    <div class="endpoint-info">
                        <div class="endpoint-path">${endpoint.path}</div>
                        <div class="endpoint-target">${endpoint.target}</div>
                    </div>
                    <button class="delete-btn" data-path="${endpoint.path}">Delete</button>
                `;
                
                endpointsList.appendChild(endpointEl);
            });
            
            // Add event listeners to delete buttons
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', deleteEndpoint);
            });
        } catch (error) {
            endpointsList.innerHTML = `<div class="no-endpoints">Error loading endpoints: ${error.message}</div>`;
        }
    }
    
    // Delete endpoint
    async function deleteEndpoint(e) {
        const path = e.target.getAttribute('data-path');
        
        try {
            const response = await fetch(`/api/endpoints/${encodeURIComponent(path)}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showStatus('Proxy endpoint deleted successfully', true);
                loadEndpoints();
            } else {
                showStatus(`Error: ${data.error || 'Failed to delete endpoint'}`, false);
            }
        } catch (error) {
            showStatus(`Error: ${error.message}`, false);
        }
    }
    
    // Show status message
    function showStatus(message, isSuccess) {
        const container = document.querySelector('.form-container');
        
        // Remove any existing status
        const existingStatus = container.querySelector('.status');
        if (existingStatus) {
            existingStatus.remove();
        }
        
        // Create new status element
        const statusEl = document.createElement('div');
        statusEl.className = `status ${isSuccess ? 'status-success' : 'status-error'}`;
        statusEl.textContent = message;
        
        // Add to container
        container.appendChild(statusEl);
        
        // Remove after 3 seconds
        setTimeout(() => {
            statusEl.remove();
        }, 3000);
    }
});