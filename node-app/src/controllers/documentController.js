import zkService from '../services/zkService.js'; 
import { v4 as uuidv4 } from 'uuid';

class DocumentController {
  constructor(orbitService) {
    this.orbitService = orbitService;
  }

  async createDocument(req, res) {
    try {
      const { proof, publicSignals, text, file } = req.body;
      console.log(req.body); 
      // Verify proof data exists
      if (!proof || !publicSignals) {
        return res.status(400).json({ error: "Missing verification data" });
      }
  
      // Verify the ZK proof
      const isValid = await zkService.verifyProof(proof, publicSignals);
      if (!isValid) {
        return res.status(403).json({ status: "Invalid proof" });
      }

      const uid = publicSignals[0];
      
      // Check if user exists, if not create them
      let existingUser;
      try {
        existingUser = await this.orbitService.getUserById(uid);
        console.log("User found:", existingUser);
      } catch (error) {
        console.log("User lookup failed:", error);
      }

      if (existingUser.length === 0) {
        // Create new user if doesn't exist
        const user = {
          _id: uid,
          uid,
          created_at: new Date().toISOString()
        };
        console.log("Creating user:", user);
        await this.orbitService.createUser(user);
      }

      // Now create the document since we ensure user exists
      const _id = uuidv4();
      console.log(`Creating document with ID: ${_id}`);

      // Prepare document data
      const doc = {
        _id,
        uid,  // This acts as our foreign key reference
        created_at: new Date().toISOString()
      };

      // Add text data if present
      if (text) {
        doc.text = text;
      }

      // Add file data if present
      if (file) {
        doc.file = {
          name: file.name,
          type: file.type,
          data: file.base64
        };
      }

      const cid = await this.orbitService.createDoc(doc);
      res.json({ success: true, cid });
    } catch (error) {
      console.error("Error creating doc:", error);
      res.status(500).json({ error: "Could not create doc" });
    }
  }
  async getUser(req, res) {
    console.log(req.params.id);
    const user = await this.orbitService.getUserById(req.params.id);
    res.json(user);
  }

  async getDocument(req, res) {
    try {
      const doc = await this.orbitService.getDocById(req.params.id);
      if (!doc) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(doc);
    } catch (error) {
      console.error("Error reading doc:", error);
      res.status(500).json({ error: "Could not read doc" });
    }
  }

  async getAllDocuments(req, res) {
    try {
      const docs = await this.orbitService.getAllDocs();
      if (!docs || docs.length === 0) {
        return res.status(404).json({ message: "No documents found" });
      }
      res.json(docs);
    } catch (error) {
      console.error("Error fetching docs:", error);
      res.status(500).json({ error: "Could not fetch documents" });
    }
  }

  async updateDocument(req, res) {
    try {
      const { doc } = req.body;
      if (!doc || doc._id !== req.params.id) {
        return res.status(400).json({ error: "Invalid or missing doc payload" });
      }

      const updatedDoc = await this.orbitService.updateDoc(doc);
      res.json({ success: true, updatedDoc });
    } catch (error) {
      console.error("Error updating doc:", error);
      res.status(500).json({ error: "Could not update doc" });
    }
  }

  async deleteDocument(req, res) {
    try {
      const id = req.params.id;
      await this.orbitService.deleteDoc(id);
      res.json({ success: true, message: `Document ${id} deleted` });
    } catch (error) {
      console.error("Error deleting doc:", error);
      res.status(500).json({ error: "Could not delete doc" });
    }
  }
  async deleteUser(req, res) {
    const id = req.params.id;
    await this.orbitService.deleteUser(id);
    res.json({ success: true, message: `User ${id} deleted` });
  }
  
}

export default DocumentController; 