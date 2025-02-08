import express from 'express';
import verifyWalletSignature from '../middleware/authMiddleware.js';

function createDocumentRouter(documentController) {
  const router = express.Router();

  router.post("/", verifyWalletSignature, documentController.createDocument.bind(documentController));
  router.get("/:id", documentController.getDocument.bind(documentController));
  router.get("/", documentController.getAllDocuments.bind(documentController));
  router.put("/:id", verifyWalletSignature, documentController.updateDocument.bind(documentController));
  router.delete("/:id", verifyWalletSignature, documentController.deleteDocument.bind(documentController));

  return router;
}

export default createDocumentRouter; 