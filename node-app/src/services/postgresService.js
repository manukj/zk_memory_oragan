import db from "../config/database.js";

export class PostgresService {
  constructor() {
    this.pool = db.pool;
    this.init();
  }
  async init() {
    const client = await this.pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                data JSONB NOT NULL,
                cid TEXT,
                author TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create update_timestamp function if it doesn't exist
        await client.query(`
            CREATE OR REPLACE FUNCTION update_timestamp()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);

        // Create trigger if it doesn't exist - using IF NOT EXISTS
        await client.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_trigger 
                    WHERE tgname = 'set_timestamp' 
                    AND tgrelid = 'documents'::regclass
                ) THEN
                    CREATE TRIGGER set_timestamp
                    BEFORE UPDATE ON documents
                    FOR EACH ROW
                    EXECUTE FUNCTION update_timestamp();
                END IF;
            END $$;
        `);

        console.log("PostgreSQL cache initialized with updated schema.");
    } catch (error) {
        // Log error details but don't fail initialization
        console.warn('PostgreSQL initialization warning:', error.message);
        // Continue execution even if trigger/function already exists
    }
}


  async get(id) {
    console.log(`Checking cache for document: ${id}`);
    const result = await this.pool.query("SELECT data, cid FROM documents WHERE id = $1", [id]);

    if (result.rows.length) {
      console.log(`Cache hit for document: ${id}`);

      await this.pool.query("UPDATE documents SET last_accessed = CURRENT_TIMESTAMP WHERE id = $1", [id]);

      return result.rows[0].data;
    } else {
      console.log(`Cache miss for document: ${id}`);
      return null;
    }
  }

  async set(id, data, cid, author) {
    console.log(`Storing document in cache: ${id}`);
    await this.pool.query(
      `INSERT INTO documents (id, data, cid, author, created_at, updated_at, last_accessed) 
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
       ON CONFLICT (id) 
       DO UPDATE SET data = $2, cid = $3, author = $4, last_accessed = CURRENT_TIMESTAMP`,
      [id, data, cid, author]
    );
    // Delete least recently used documents to keep cache size under 5
    const deletedDocs = await this.pool.query(`
      DELETE FROM documents 
      WHERE id IN (
          SELECT id FROM documents 
          ORDER BY last_accessed ASC  
          LIMIT (SELECT COUNT(*) FROM documents) - 5  
      )
      AND (SELECT COUNT(*) FROM documents) > 5
      RETURNING id;
    `);

    if (deletedDocs.rows.length > 0) {
      console.log(`Deleted least recently used documents: ${deletedDocs.rows.map(d => d.id).join(", ")}`);
    }
  }

  async del(id) {
    console.log(`Deleting document from cache: ${id}`);
    await this.pool.query("DELETE FROM documents WHERE id = $1", [id]);
  }

  async getAll() {
    console.log("Fetching all documents from cache");
    const client = await this.pool.connect();
    
    try {
      const result = await client.query("SELECT data, id FROM documents ORDER BY last_accessed DESC");

      if (result.rows.length) {
        console.log("Returning all documents from cache");

        // Update last_accessed timestamp for all retrieved documents
        for (let row of result.rows) {
          await this.pool.query(
            "UPDATE documents SET last_accessed = CURRENT_TIMESTAMP WHERE id = $1",
            [row.id]
          );
        }

        return result.rows.map(row => row.data);
      } else {
        console.log("No documents found in cache");
        return [];
      }
    } finally {
      client.release();
    }
  }
}
