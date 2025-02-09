# ZK Memory Organ

The **ZK Memory Organ** is a cutting-edge, privacy-focused, efficient, error-free, and highly secure data storage solution. By leveraging **Zero-Knowledge Proofs (ZK-SNARKs)** for authentication, **OrbitDB & IPFS** for decentralized storage, and **PostgreSQL** for caching and load balancing, this system ensures **high security, efficiency, and fault tolerance**.

## Key Features

- **Zero-Knowledge Authentication** – Secure user verification without revealing sensitive information, generating a **Decentralized Identity (DID)**.
- **Intelligent Caching** – Optimized query performance using the **Least Recently Used (LRU) algorithm**.
- **Decentralized Storage** – Utilizes **IPFS & OrbitDB** for tamper-proof, high-availability storage and efficiently manages relational schema.
- **Efficient Load Balancing** – Manages client-server requests effectively to ensure seamless performance and IPFS node load management.
- **Horizontal Scalability** – Ensures system resilience and adaptability to increasing demand.
- **Advanced File Storage** – Supports efficient storage of complex data structures within the decentralized framework.
- **Enhanced Data Integrity** – Implements foreign key constraints to maintain data consistency and enforce referential integrity across stored datasets.

## System Architecture and Workflow

### 1. Authentication with Zero-Knowledge Proofs (ZK-SNARKs)

#### Why ZK-SNARKs?
- **Privacy-Preserving** – Users authenticate without revealing any wallet information.
- **Lightweight & Efficient** – Ensures fast cryptographic proof verification.
- **Tamper-Proof** – Prevents credential forgery.

#### How It Works
1. The user generates a cryptographic proof using **ZK-SNARKs**.
2. The system verifies the proof **without storing or viewing private data**.
3. The system utilizes **Circom** to generate the proof and verification key.
4. A **Decentralized Identity (DID)** is generated using a nullifier (**Secret + Salt**).
5. The verified user gains secure access to **create, read, update, or delete documents**.

---

### 2. Load Balancing with Nginx

#### Why Load Balancing?
- Enhances **availability and reliability** by distributing traffic across multiple servers.
- Optimizes **performance** by reducing latency and directing users to the least busy node.
- Enables **scalability** by ensuring smooth scaling as demand increases.

#### Implementation
- **Nginx as a Reverse Proxy** – Uses **Round Robin** to distribute traffic evenly across multiple Node.js application instances.
- **Traffic Distribution** – Ensures even load balancing across multiple servers.
- **Docker Compose for Scaling** – Simplifies **multi-container deployment** which helps with **horizontal scaling**.

---

### 3. Horizontal Scaling of Servers

#### Why Horizontal Scaling?
- **Handles Increased Traffic** – Adds new servers dynamically as demand grows.
- **Improves Reliability** – If one server fails, others take over.
- **Cost-Effective** – More efficient than upgrading a single large server.
- **Auto Scaling** – Automatically provisions additional resources based on demand.

---

### 4. Caching Mechanism (LRU Algorithm in PostgreSQL)

#### Why LRU Caching?
- Optimizes **query performance** by storing frequently accessed data.
- Reduces **database load**, preventing unnecessary reads.
- Ensures **fair resource allocation** by evicting stale data.

#### Implementation
1. When a user queries for data, the system first checks the **PostgreSQL memory store**.
2. If the data is found, it is returned **instantly**.
3. If the data is not found, it is retrieved from **OrbitDB/IPFS**, stored in the cache, and then returned to the user.
4. The system follows the **Least Recently Used (LRU) policy**, removing old or unnecessary cache entries to optimize performance.

---

### 5. Decentralized Data Storage (IPFS + OrbitDB)

#### Why OrbitDB?
- **Distributed & Replicated** – No single point of failure.
- **Tamper-Proof** – Cryptographic signatures ensure data integrity.
- **Offline Support** – Users can retrieve data even when disconnected.
- **Merkle Conflict-Free Replicated Data Types (CRDTs)** – Handles complex data and ensures conflict-free database writes and merges.

#### How It Works
1. When a user uploads data, it is stored in **IPFS**, which generates a **Content Identifier (CID)**.
2. For retrieval, queries in **OrbitDB** return the corresponding **CID**, which is then used to fetch the data from **IPFS**.

---

### 6. Load Balancing with IPFS Clustering

#### Why IPFS Clustering?
- **Distributes Storage Load** – Ensures balanced storage across multiple IPFS nodes.
- **Automatic Data Replication** – Prevents data loss and enhances availability.
- **Auto Scaling** – Dynamically adds storage nodes as demand increases.

#### Implementation
1. Data is stored and **pinned across multiple IPFS nodes**.
2. The **IPFS Cluster service** monitors storage and dynamically redistributes data.
3. **Dynamic scaling** ensures optimal performance during peak loads.
4. **IPFS clusters** operate as **private clusters** by default, ensuring optimized data retrieval and secure storage.
5. The system runs a **private IPFS network**, where only approved nodes can participate.
6. A custom script, **add_user_to_cluster.sh**, securely adds new nodes to the cluster.
7. When a **new node is added**, the script registers it within the cluster, enabling seamless data sharing using a **secret and bootstrap ID**.

---

## Conclusion
The **ZK-Decentralized Memory Organ** is a highly **secure, scalable, and privacy-preserving** decentralized storage solution. By combining **ZK-SNARK authentication, IPFS, OrbitDB, PostgreSQL caching, and Nginx load balancing**, it ensures optimal **performance, security, and fault tolerance**.

---
