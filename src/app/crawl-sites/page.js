"use client"
import { useState } from "react";
import { useRouter } from 'next/navigation';

function ResponsiveTable({ table_data }) {

    // const table_data = [{
    //     "media_mongo_id": [
    //         "66e189a0992c10250c10aa64"
    //     ],
    //     "message": "Videos saved successfully",
    //     "success": true,
    //     "version": "v0.1",
    //     "video_count": 1,
    //     "video_sources": [
    //         "https://bit-360.site/design/t_quantumai/video/quantumai_en.mp4"
    //     ],
    //     "source_url": "https://bit-360.site"
    // }]
    let sno = 0;

    return (
        <div className="p-4 w-full flex flex-col gap-4 ">

            <div className=" text-2xl w-full">
                Video Scraping
            </div>

            <div className="overflow-x-auto ">
                <div>
                    <table className="w-full text-sm text-left">
                        <thead className=" bg-primary text-slate-200 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3 first:rounded-l-full last:rounded-r-full">
                                    <span className="bg-primary font-normal rounded-full inline-block">Sno</span>
                                </th>
                                <th scope="col" className="px-2 py-3 ">
                                    <span className="bg-primary font-normal rounded-full inline-block">Filename</span>
                                </th>
                                <th scope="col" className="px-2 py-3 ">
                                    <span className="bg-primary font-normal rounded-full inline-block">Video Source</span>
                                </th>
                                <th scope="col" className="px-2 py-3 first:rounded-l-full last:rounded-r-full">
                                    <span className="bg-primary font-normal rounded-full inline-block">Source URL</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {table_data.length > 0 ? table_data.map((item, index) => {
                                return item["video_sources"].map((video, idx) => {
                                    const path = video.split('/')
                                    const filename = path[path.length - 1]
                                    sno += 1;
                                    return (
                                        <tr
                                            key={`${index}-${idx}`}
                                            className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                                                } hover:bg-gray-100 transition duration-150 ease-in-out `}
                                        >
                                            <td className="px-8 py-3 first:rounded-l-full last:rounded-r-full">
                                                {sno}
                                            </td>
                                            <td className=" px-2 py-3 max-w-52 overflow-x-auto ">
                                                {filename}
                                            </td>
                                            <td className=" px-2 py-3 max-w-52 overflow-x-auto">
                                                {video}
                                            </td>
                                            <td className=" px-2 py-3 first:rounded-l-full last:rounded-r-full max-w-52 overflow-x-auto">
                                                <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    {item.source_url}
                                                </a>
                                            </td>
                                        </tr>
                                    )
                                })
                            }) 
                            :
                            (
                                <tr>
                                    <td colSpan="4" className="text-center py-16 text-lg text-black">No URLs Crawled</td>
                                </tr>
                            )

                            }
                        </tbody>
                    </table>

                </div>
            </div>
        </div>
    );
}

const Page = ({ searchParams }) => {
    const router = useRouter();

    const [links_list, setlinks_list] = useState([]);
    const [link, setlink] = useState("");

    const [results, set_results] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mongodb_ids, set_mongodb_ids] = useState([]);

    const handle_scrape_start = async () => {
        setLoading(true);
        let poi = ''
        if (searchParams.poi !== undefined) {
            poi = searchParams.poi
        }
        for (let i = 0; i < links_list.length; i++) {
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    link: links_list[i],
                    poi: poi
                }),
            };

            try {
                let response = await fetch(`https://api.contrails.ai/crawl-videos`, options);
                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }
                let result = await response.json();
                // let result = {
                //     'video_sources': ['https://video-link/src/98345bdhs.mp4'],
                //     'video_count': 1,
                //     'media_mongo_id': ["sjhf48953___id"],
                //     'message': 'Videos saved successfully',
                //     'success': true,
                //     'version': "v0.1"
                // }
                result["source_url"] = links_list[i];

                console.log(result)

                set_mongodb_ids(prevResults => [...prevResults, ...result["media_mongo_id"]])
                set_results(prevResults => [...prevResults, result]);
            } catch (error) {
                console.error("Fetch error:", error);
            }
        }
        setlinks_list([]);
        setLoading(false);
    }

    const start_deepfake_analysis = async () => {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                media_ids: mongodb_ids
            }),
        };
        const result = await fetch(`https://api.contrails.ai/process-pending`, options);
        router.push('/results');
    }

    const add_url = () => {
        let is_repeat = false;
        links_list.map((val) => { if (val === link) { is_repeat = true; } })
        if (!is_repeat) {
            setlinks_list([...links_list, link]);
        }
        setlink("");
    }
    const remove_url = (index) => {
        setlinks_list(prevLinks => prevLinks.filter((_, i) => i !== index))
    }

    const table_data = [];

    return (
        <div className="">
            <div className=' w-full flex justify-between items-center text-3xl py-2 px-20'>
                Crawl Websites
            </div>
            <div className=" px-20 py-2 flex gap-6 w-full ">
                {/* LIST OF LINKS TO CRAWL */}
                <div className=" min-w-96 px-4 pt-4 pb-4 shadow-primary shadow rounded-lg flex flex-col items-center justify-between ">
                    <div className=" text-xl px-4 w-full ">
                        URLs to Crawl
                    </div>

                    {/* ADD URLS */}
                    <form className=" w-full row-span-4 col-span-7 py-4 rounded-lg flex flex-col gap-4 px-4  "
                        onSubmit={(e) => { e.preventDefault(); add_url(); }}
                    >
                        <div className=" flex flex-col w-full ">
                            <label htmlFor="enter_url" className=" text-lg ">Enter Url</label>
                            <div className=" flex gap-4 w-full">
                                <input
                                    type="url"
                                    id="enter_url"
                                    className=" max-w-96 w-full rounded border-2 border-slate-200 px-2 py-1 outline-slate-300 transition-all"
                                    value={link}
                                    onChange={(e) => { setlink(e.target.value) }}
                                    required
                                />
                                <button className=" w-fit bg-primary text-slate-100 px-2 py-2 rounded-full" type="submit">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* SHOW URLS */}
                    <div className=" w-full h-full flex flex-col justify-start px-4 py-4 gap-2 ">
                        {
                            links_list.length !== 0 ?
                                (links_list.map((val, idx) => {
                                    return (
                                        <div key={idx} className=" border-slate-200 border px-4 py-2 rounded-full flex justify-between">
                                            <p>
                                                {idx + 1}. {val}
                                            </p>
                                            <div onClick={() => { remove_url(idx) }} className=" bg-slate-200 hover:bg-red-200 p-1 rounded-full cursor-pointer hover:scale-110 transition-all ">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="size-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                                                </svg>
                                            </div>
                                        </div>
                                    )
                                })
                                ) :
                                (
                                    <>
                                        <div className=" flex items-center justify-center py-10 text-lg">
                                            NO LINKS
                                        </div>
                                    </>
                                )
                        }
                    </div>

                    <div className="flex items-center gap-4">
                        <div onClick={() => { handle_scrape_start() }} className=" bg-primary py-2 px-8 cursor-pointer rounded-full text-slate-100 w-fit">
                            Start Crawl
                        </div>
                        {loading &&
                            (
                                <div role="status">
                                    {/* LOADING */}
                                    <svg aria-hidden="true" className="w-6 h-6 text-primary/50 animate-spin fill-primary" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                    </svg>
                                </div>
                            )
                        }
                    </div>
                </div>

                {/* RESULTS TO CRAWL */}
                <div className=" w-full min-h-[42vh] shadow-primary shadow rounded-lg py-4 px-6 flex flex-col gap-3 items-end justify-between ">
                    <ResponsiveTable table_data={results} />
                    <div onClick={() => { start_deepfake_analysis() }} className=" bg-primary py-2 px-4 cursor-pointer rounded-full text-slate-100 w-fit">
                        Start deepfake analysis
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Page;