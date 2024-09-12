"use server"

import clientPromise from "@/lib/mongodb"
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/lib/aws";
import { ObjectId } from "mongodb";

const get_mongo_result_data = async () => {
    const client = await clientPromise;
    const db = client.db('poi_demo');
    const collection = db.collection('media');

    const Data = await collection.find({}).toArray();
    return Data
}

// CREATE?UPDATE THE POI DATA TO S3
// _id ? update : create
const save_poi = async (poi_data) => {
    try {
        const client = await clientPromise;
        const db = client.db('poi_demo');
        const collection = db.collection('poi');

        // Update a document
        if (poi_data["mongo_id"]) {
            const id = new ObjectId(poi_data.mongo_id);  // Use 'new' correctly
            const updateResult = await collection.updateOne(
                { _id: id },
                {
                    $set: {
                        "s3_keys": poi_data["s3_keys"]
                    }
                }
            );
            console.log("updates: ", updateResult);
            return updateResult;
        }
        // Create a document
        else {
            const createResult = await collection.insertOne(poi_data);
            console.log("creation: ", createResult.insertedId.toString());
            return createResult.insertedId.toString();
        }
    }
    catch (error) {
        console.error("ERROR OCCURRED (mongo)(save to poi): ", error);
        return 1;
    }
}

//SAVE IMAGES OF POI TO S3
const create_s3_save_url = async (s3_key, file_type) => {
    //inside POI folder
    // -> specific poi folder by id (<---id--->_<---name--->)
    // only one image uploads (img_1, img_2...)

    // GET SIGNED URL TO PUT DATA
    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: s3_key,
        ContentType: file_type,
    });
    //created a signed url to upload data to (expired in 5 minutes)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    return signedUrl;
}

const get_s3_view_url = async (s3_key)=>{
    // Generate a signed URL for the media file in S3
    let signedUrl = null;
    if (s3_key) {
        try {
            const command = new GetObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: s3_key,
            });
            signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 1800 }); // URL valid for 30 mins
        } catch (s3Error) {
            console.error('Error generating signed URL:', s3Error);
        }
    }
    return signedUrl;
}

export { get_mongo_result_data, save_poi, create_s3_save_url, get_s3_view_url };