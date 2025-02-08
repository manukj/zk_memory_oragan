const zkService = require('../services/zkService');
const storageService = require('../services/storageService');

exports.storeData = async (req, res, next) => {
    try {
        const { proof, publicSignals, signature, message, data } = req.body;

        if (!proof || !publicSignals || !signature || !message) {
            return res.status(400).json({ error: "Missing verification data" });
        }

        const isValid = await zkService.verifyProof(proof, publicSignals);
        if (!isValid) {
            return res.status(403).json({ status: "Invalid proof" });
        }

        const userDID = publicSignals[0];
        const publicHash = publicSignals[1];


        storageService.addVerifiedUser(userDID);
        //TODO integrate Localstorafe with IPFS
        const newData = storageService.storeData(userDID, data);

        res.json({
            status: "Data stored successfully",
            userId: userDID,
            publicHash: publicHash,
            data: newData
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllData = (req, res) => {
    res.json(storageService.getAllData());
};

exports.getUserData = (req, res) => {
    const { userId } = req.params;
    res.json(storageService.getUserData(userId));
};

exports.deleteData = (req, res, next) => {
    try {
        const { userId, id } = req.params;
        storageService.deleteData(userId, id);
        res.json({ status: "Data deleted successfully" });
    } catch (error) {
        next(error);
    }
}; 