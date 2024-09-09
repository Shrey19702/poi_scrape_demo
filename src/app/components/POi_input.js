'use client'

import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react'
import Image from 'next/image'
import { save_poi, create_s3_save_url } from "@/lib/data";

export default function POI_FORM() {
    const router = useRouter();

    const [name, setName] = useState('')
    const [files, setFiles] = useState([])
    const [isDragActive, setIsDragActive] = useState(false)
    //   const [state, formAction] = useActionState(saveData)
    const fileInputRef = useRef(null)

    const handleDragEnter = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragActive(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragActive(false)
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragActive(false)

        const droppedFiles = Array.from(e.dataTransfer.files)
        setFiles(prevFiles => [...prevFiles, ...droppedFiles])
    }

    const handleFileChange = (e) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files)
            setFiles(prevFiles => [...prevFiles, ...selectedFiles])
        }
    }

    const removeFile = (index) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index))
    }

    // SUBMIT RELATED FUNCTIONS

    const upload_file_s3 = async (file_idx, signedUrl) => {
        try {
            const file = files[file_idx];
            //send file to save 
            const res_s3 = await fetch(signedUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type },
            });
            return 0;
        } catch (error) {
            console.error('Error uploading file:', error);
            return 1;
        }
    }

    const handle_submit = async (e) => {
        e.preventDefault()
        // save to POI collection in mongodb
        // name, S3 keys of all poi images
        try {

            // create poi_data
            let poi_data = {
                name: name,
                s3_keys: []
            }
            // create a mongodb_doc
            const res = await save_poi(poi_data);
            if (typeof (res) === 'number') {
                throw "error in creating doc"
            }

            const mongo_id = res;
            poi_data["mongo_id"] = mongo_id;

            //save to S3
            for (let i = 0; i < files.length; i++) {
                const s3_key = `POI/${mongo_id}_${name}/file_${i}`;
                poi_data["s3_keys"].push(s3_key);

                //create a signed URL for it
                const signed_url = await create_s3_save_url(s3_key, files[i].type);
                // save file using a put request
                const response = await upload_file_s3(i, signed_url);
                if (response === 1) {
                    throw "error in saving a file";
                }
            }
            const update_res = await save_poi(poi_data);
            alert("files saved sucessfully !");
            router.push('/crawl-sites'); 
        }
        catch (error) {
            console.error("Error in saving files: ", error);
            alert('Failed to upload files');
        }
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow shadow-primary">
            <div className=' pb-8 gap-2 flex flex-col'>
                <div className=' text-2xl'>
                    Person of Interest
                </div>
                <div className='text-sm'>
                    Enter details of the person for recognition
                </div>
            </div>
            <form onSubmit={handle_submit} className="space-y-6">
                <div className=' flex items-center gap-5'>
                    <label htmlFor="name">Name</label>
                    <input
                        id="name"
                        name="name"
                        value={name}
                        placeholder='Name of the PoI..'
                        className='outline-gray-400 px-3 py-2 border-2 rounded-lg w-full'
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="images">Images</label>
                    <div
                        className={`p-6 mt-2 border-2 border-dashed rounded-md ${isDragActive ? 'border-primary' : 'border-gray-300'
                            }`}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            id="images"
                            name="images"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                            required
                        />
                        <p className="text-center">
                            {isDragActive ? "Drop the files here ..." : "Drag 'n' drop the POI's images here, or click to select files"}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                            <div className="flex items-center space-x-2">
                                <Image
                                    src={URL.createObjectURL(file)}
                                    alt={`Uploaded image ${index + 1}`}
                                    width={40}
                                    height={40}
                                    className="rounded"
                                />
                                <span>{file.name}</span>
                            </div>
                            <button
                                type="button"
                                className='mx-4 hover:bg-red-300 p-2 rounded-full bg-slate-300 transition-all'
                                onClick={() => removeFile(index)}
                                aria-label={`Remove ${file.name}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="size-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                                </svg>

                            </button>
                        </div>
                    ))}
                </div>

                <button type="submit" className="w-full bg-primary text-slate-200 py-2 rounded-full hover:opacity-95">
                    Save
                </button>
            </form>

            {/* {state && (
        <div className={`mt-4 p-2 text-center rounded ${state.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {state.message}
        </div>
      )} */}
        </div>
    )
}