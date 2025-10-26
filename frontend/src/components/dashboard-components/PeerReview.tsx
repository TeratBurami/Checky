import {FaRegCircleCheck, FaRegCircleQuestion} from 'react-icons/fa6'

const peerReviews=[
    {
        title:"Academic Writing",
        owner: "James",
        isReviewed:true,
    },
    {
        title:"Lesson 03 Recap",
        owner: "Smith",
        isReviewed:true,
    },
    {
        title:"Lesson 04 Recap",
        owner: "Smith",
        isReviewed:false,
    },
    {
        title:"Lesson 04 Recap",
        owner: "John",
        isReviewed:false,
    }
]

export default function PeerReview(){
    return(
        <div className='flex flex-col gap-6'>
            {
                peerReviews.map((item,idx)=>(
                    <div key={idx} className="shadow flex justify-between items-center p-4 px-12 rounded-lg shadow-black/20">
                        <div className='flex items-center gap-4'>
                            {item.isReviewed? <FaRegCircleCheck className="text-3xl text-green-500"></FaRegCircleCheck>:<FaRegCircleQuestion className="text-3xl text-blue-500"></FaRegCircleQuestion>}
                            <div>
                                <p className={`font-bold text-base ${item.isReviewed? 'text-green-500':'text-blue-500'}`}>{item.title}</p>
                                <p className='text-gray-500'>Owner: {item.owner}</p>
                            </div>
                        </div>
                        <button className={`py-2 w-16 font-bold border-2 cursor-pointer rounded-lg ${item.isReviewed? 'bg-orange-200 border-orange-200 hover:border-orange-300 hover:bg-orange-300 text-white':'text-orange-200 bg-white hover:bg-orange-50'}`} >{item.isReviewed ? "Edit" : "Review"}</button>
                    </div>
                ))
            }
        </div>
    )
}