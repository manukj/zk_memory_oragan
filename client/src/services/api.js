const API_BASE_URL = 'http://localhost:3000/doc';

export const api = {
    storeData: async (proofData, textData) => {
        try {
            const response = await fetch(`${API_BASE_URL}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    ...proofData,
                    data: { text: textData }
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