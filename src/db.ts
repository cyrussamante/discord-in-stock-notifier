import { MongoClient, Collection } from "mongodb";

export interface TrackedProduct {
  url: string;
  lastInStock: boolean;
}

const uri = process.env.MONGO_URI!;
const client = new MongoClient(uri);

let collection: Collection<TrackedProduct>;

export async function connectToDB() {
  await client.connect();
  const db = client.db("stockbot");
  collection = db.collection<TrackedProduct>("trackedProducts");
}

export async function getTrackedProducts(): Promise<TrackedProduct[]> {
  return await collection.find().toArray();
}

export async function addTrackedProduct(url: string) {
  await collection.updateOne(
    { url },
    { $setOnInsert: { url, lastInStock: false } },
    { upsert: true }
  );
}

export async function removeTrackedProduct(url: string) {
  await collection.deleteOne({ url });
}
