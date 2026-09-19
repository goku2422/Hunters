import { MongoClient, Db } from 'mongodb';

const uri =
  process.env.MONGODB_URI ||
  'mongodb+srv://sclaptop4321_db_user:0Or0vKvJaM9449WT@cluster0.k1fr59v.mongodb.net/flinty?retryWrites=true&w=majority&appName=Cluster0';

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  tls: true,
};

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function getClientPromise(): Promise<MongoClient> {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().catch((err) => {
      console.error('MongoDB Atlas connection error:', err?.message || err);
      global._mongoClientPromise = undefined;
      throw err;
    });
  }
  return global._mongoClientPromise;
}

const clientPromise = getClientPromise();
export default clientPromise;

export async function getDb(): Promise<Db> {
  try {
    const client = await getClientPromise();
    return client.db('flinty');
  } catch (error) {
    global._mongoClientPromise = undefined;
    throw error;
  }
}
