"use client"
import { useState } from "react";

function ResponsiveTable() {
    const tableData = [
        { sno: 1, filename: 'video1.mp4', videoSource: 'YouTube', sourceUrl: 'https://youtube.com/watch?v=abc123' },
        { sno: 2, filename: 'tutorial.mov', videoSource: 'Vimeo', sourceUrl: 'https://vimeo.com/123456' },
        { sno: 3, filename: 'presentation.webm', videoSource: 'Dailymotion', sourceUrl: 'https://dailymotion.com/video/x7x7x7' },
        { sno: 4, filename: 'lecture.mp4', videoSource: 'Twitch', sourceUrl: 'https://twitch.tv/videos/987654' },
        { sno: 5, filename: 'demo.avi', videoSource: 'Facebook', sourceUrl: 'https://facebook.com/watch/?v=123456789' },
    ];

    return (
        <div className="p-4 w-full flex flex-col gap-4 ">

            <div className=" text-2xl w-full">
                Video Scraping 
            </div>
            
            <div className="overflow-x-auto ">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 rounded-lg ">
                        <tr className=" bg-primary text-slate-200 rounded-full ">
                            <th scope="col" className=" py-3 px-4 ">Sno</th>
                            <th scope="col" className=" py-3 px-4">Filename</th>
                            <th scope="col" className=" py-3 px-4">Video Source</th>
                            <th scope="col" className=" py-3 px-4">Source URL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((item, index) => (
                            <tr
                                key={item.sno}
                                className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50 '
                                    } hover:bg-gray-100 transition duration-150 ease-in-out`}
                            >
                                <td className=" py-4 px-4 font-medium text-gray-900 whitespace-nowrap">
                                    {item.sno}
                                </td>
                                <td className="py-4 px-4">
                                    {item.filename}
                                </td>
                                <td className="py-4 px-4">
                                    {item.videoSource}
                                </td>
                                <td className=" py-4 px-4">
                                    <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        {item.sourceUrl}
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


const Page = () => {

    const [links_list, setlinks_list] = useState([]);
    const [link, setlink] = useState("");

    const [results, set_results] = useState([])

    const handle_scrape_start = async () => {
        for (let i = 0; i < links_list.length; i++) {

            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    link: links_list[i]
                }),
            };
            const result = await fetch(`https://api.contrails.ai/add-crawler-link`, options);
            set_results([...results, result]);
        }
    }
    const start_deepfake_analysis = async () => {
        const result = await fetch(`https://api.contrails.ai/process-pending`, options);
    }

    const remove_url = (url) => {
        const temp = links_list.filter((val) => val !== url);
        setlinks_list(temp);
    }
    const add_url = () => {
        let is_repeat = false;
        links_list.map((val) => { if (val === link) { is_repeat = true; } })
        if (!is_repeat) {
            setlinks_list([...links_list, link]);
        }
        setlink("");
    }

    return (
        <div className="">
            <div className=' w-full flex justify-between items-center text-3xl py-2 px-20'>
                Crawl Websites
            </div>
            <div className=" px-20 py-2 grid grid-rows-10 grid-cols-10 grid-flow-col gap-6 ">
                {/* RESULTS TABLE */}
                {/* <div className=" row-span-6 col-span-7 min-h-[42vh] shadow-primary shadow rounded-lg py-4 px-6 flex flex-col gap-3 items-end ">
                    <div className=" text-2xl w-full">
                        Scraping Result
                    </div>
                    <div className=" h-full w-full bg-slate-200 rounded ">

                        <div className=" flex items-center bg-primary/60 rounded">
                            <span className=" px-2">
                                Sno.
                            </span>
                            <div className=" w-full grid grid-flow-col grid-col-4 gap-2 px-2 py-2">
                                <span>
                                    Filename
                                </span>
                                <span>
                                    Video Source
                                </span>
                                <span>
                                    Source Url
                                </span>
                            </div>
                        </div>
                        {
                            results.length > 0 ?
                                results.map((result, idx) => {
                                    return (
                                        <div className=" flex gap-4 " key={idx}>
                                            <div className=" font-semibold">
                                                {key} :
                                            </div>
                                            <div>
                                                {result.source_data[key]}
                                            </div>
                                        </div>
                                    )
                                })
                                :
                                (
                                    <div className=" py-16 flex items-center justify-center  ">
                                        No results to Show
                                    </div>
                                )
                        }
                    </div>
                    <div onClick={() => { start_deepfake_analysis() }} className=" bg-primary py-2 px-4 cursor-pointer rounded-full text-slate-100 w-fit">
                        Start deepfake analysis
                    </div>
                </div> */}

                <div className=" row-span-6 col-span-7 min-h-[42vh] shadow-primary shadow rounded-lg py-4 px-6 flex flex-col gap-3 items-end ">
                    <ResponsiveTable />
                </div>


                {/* LIST OF LINKS TO CRAWL */}
                <div className=" row-span-10 col-span-3 px-4 pt-4 pb-4 shadow-primary shadow rounded-lg flex flex-col items-center justify-between ">
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
                                        <div key={idx} className=" bg-slate-300 px-4 py-2 rounded-full flex justify-between">
                                            <p>
                                                {idx + 1}. {val}
                                            </p>
                                            <div onClick={() => { remove_url(val) }} className=" bg-red-400 p-1 rounded-full cursor-pointer hover:scale-110 transition-all ">
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
                                        <div className=" flex items-center justify-center py-10">
                                            NO LINKS
                                        </div>
                                    </>
                                )
                        }
                    </div>

                    <div onClick={() => { handle_scrape_start() }} className=" bg-primary py-2 px-8 cursor-pointer rounded-full text-slate-100 w-fit">
                        Start Scrapping
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Page;