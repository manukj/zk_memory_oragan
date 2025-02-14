import express from 'express';

function createDocumentRouter(documentController) {
  const router = express.Router();

  router.post("/", documentController.createDocument.bind(documentController));
  router.get("/:id", documentController.getDocument.bind(documentController));
  router.get("/", documentController.getAllDocuments.bind(documentController));
  router.put("/:id", documentController.updateDocument.bind(documentController));
  router.delete("/:id", documentController.deleteDocument.bind(documentController));
  router.get("/user/:id", documentController.getUser.bind(documentController));
  router.delete("/user/:id", documentController.deleteUser.bind(documentController));

  return router;
}

export default createDocumentRouter; 