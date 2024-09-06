"use server"

import clientPromise from "@/lib/mongodb"

const get_mongo_result_data = async ()=>{
    const client = await clientPromise;
    const db = client.db('poi_demo'); 
    const collection = db.collection('media');

    const Data = await collection.find({}).toArray();  
    return Data
}

export default get_mongo_result_data;