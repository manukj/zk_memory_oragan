class StorageService {
    constructor() {
        this.verifiedUsers = new Set();
        this.userStorage = {};
    }

    addVerifiedUser(userId) {
        this.verifiedUsers.add(userId);
        if (!this.userStorage[userId]) {
            this.userStorage[userId] = [];
        }
    }

    isVerified(userId) {
        return this.verifiedUsers.has(userId);
    }

    storeData(userId, data) {
        if (!this.isVerified(userId)) {
            throw new Error("User not verified");
        }

        const newData = {
            ...data,
            timestamp: new Date().toISOString(),
            id: Date.now().toString()
        };
        this.userStorage[userId].push(newData);
        return newData;
    }

    getAllData() {
        return Object.values(this.userStorage).flat();
    }

    getUserData(userId) {
        return this.userStorage[userId] || [];
    }

    deleteData(userId, dataId) {
        if (!this.isVerified(userId)) {
            throw new Error("User not verified");
        }
        const userDataIndex = this.userStorage[userId].findIndex(item => item.id === dataId);
        if (userDataIndex === -1) {
            throw new Error("Data not found");
        }
        this.userStorage[userId].splice(userDataIndex, 1);
    }
}

module.exports = new StorageService(); 