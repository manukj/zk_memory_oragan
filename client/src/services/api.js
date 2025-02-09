const API_BASE_URL = 'http://localhost:3000/doc';

export const api = {
    storeData: async (proofData, textData, formData) => {
        try {
            let fileData = null;
            if (formData && formData.get('file')) {
                const file = formData.get('file');
                fileData = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve({
                        base64: reader.result,
                        name: file.name,
                        type: file.type
                    });
                    reader.onerror = error => reject(error);
                });
            }

            const response = await fetch(`${API_BASE_URL}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    ...proofData,
                    text: textData,
                    file: fileData
                })
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Operation failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    getUserData: async (userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${userId}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch user data');
            }
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    getAllData: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch all data');
            }
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    deleteData: async (userId, dataId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/data/${userId}/${dataId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Delete failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
}; 