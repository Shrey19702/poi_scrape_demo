export const dynamic = 'force-dynamic'

import Data_table from "./Data_table";
import {get_mongo_result_data, get_s3_view_url} from "@/lib/data";

const Page = async ()=>{
    const data = await get_mongo_result_data();

    for(let i=0; i<data.length; i++){
        const signed_url = await get_s3_view_url(data[i]["s3_key"])
        data[i]["view_url"] = signed_url;
    }   
      
    return (
        <div className=" px-12">
            {/* <Show_data data={data} /> */}
            <Data_table data={data} />
        </div>
    )
}

export default Page