import { create } from "kubo-rpc-client";
import OrbitDB from "orbit-db";
import { PostgresService } from './postgresService.js';

export class OrbitDBService {
  constructor() {
    this.db = null;
    this.postgresService = new PostgresService();
  }

  async init() {
    try {
      console.log("Connecting to IPFS...");
      this.ipfs = create({ url: "http://ipfs-node:5001" });

      console.log("Initializing OrbitDB...");
      this.orbitdb = await OrbitDB.createInstance(this.ipfs, {
        directory: "./orbitdb_data",
      });

      this.db = await this.orbitdb.docstore("dmo-docstore", {
        accessController: { write: ["*"] },
      });
      await this.db.load();

      await this.postgresService.init();
      console.log("OrbitDB initialized. DB address:", this.db.address.toString());
    } catch (error) {
      console.error("Failed to initialize OrbitDB:", error);
      process.exit(1);
    }
  }

  async createDoc(doc) {
    try {
      console.log(`Storing document in OrbitDB: ${doc._id}`);
      const cid = await this.db.put(doc);
      
      console.log(`Caching document in PostgreSQL: ${doc._id}`);
      await this.postgresService.set(doc._id, doc, cid, doc.uid);

      return cid;
    } catch (error) {
      console.error("Error creating document:", error);
      throw new Error("Failed to create document");
    }
  }

  async getDocById(uid) {
    console.log(`Fetching document: ${uid}`);

    let cachedDoc = await this.postgresService.get(uid);
    if (cachedDoc) {
      console.log(`Returning from cache: ${uid}`);
      return cachedDoc;
    }

    console.log(`Not found in cache, fetching from OrbitDB: ${id}`);
    const result = this.db.query(doc => doc.uid === uid); // Filter by uid
    if (result.length) {
      const cid = await this.db.put(result[0]); // Get the cid of the document
      await this.postgresService.set(id, result[0], cid, uid);
      console.log(`Cached document from OrbitDB: ${id}`);
      return result[0];
    }

    console.log(`Document not found in OrbitDB: ${id}`);
    return null;
  }

  async getAllDocs() {
    console.log("Checking cache for all documents...");
    const cachedDocs = await this.postgresService.getAll();

    if (cachedDocs.length) {
      console.log("Returning all documents from cache.");
      return cachedDocs;
    }

    console.log("Cache is empty, fetching from OrbitDB...");
    const docs = await this.db.query(() => true);

    for (let doc of docs) {
      const cid = await this.db.put(doc); // Get the cid for each document
      await this.postgresService.set(doc._id, doc, cid, doc.uid);
    }

    console.log("Cached all documents from OrbitDB.");
    return docs;
  }

  async updateDoc(doc) {
    try {
      console.log(`Updating document in OrbitDB: ${doc._id}`);
      const cid = await this.db.put(doc);

      console.log(`Updating document in PostgreSQL cache: ${doc._id}`);
      await this.postgresService.set(doc._id, doc, cid, doc.uid);

      return doc;
    } catch (error) {
      console.error(`Error updating document ${doc._id}:`, error);
      throw new Error("Failed to update document");
    }
  }

  async deleteDoc(id) {
    try {
      console.log(`Deleting document from OrbitDB: ${id}`);
      await this.db.del(id);

      console.log(`Removing document from PostgreSQL cache: ${id}`);
      await this.postgresService.del(id);
    } catch (error) {
      console.error(`Error deleting document ${id}:`, error);
      throw new Error("Failed to delete document");
    }
  }
} 