"use client";
import Link from "next/link";

export default function ReviewPeerReviews(){
    return(
        <div>
            <div className="mx-auto w-9/12 mb-32">
                <div>
                    <p className="text-sm font-medium text-neutral-500 mb-2">
                        <Link href="/peer-review">My Peer Review </Link> &gt; Reviewing Submission
                    </p>
                    <h1 className="text-4xl font-bold">Review for [Assignment Name]</h1>
                    <p className="text-sm font-medium text-neutral-500">
                        [Subject Name]
                    </p>
                </div>

                <div className="p-6 mt-6 bg-[#FDFBEF] rounded-t-2xl shadow">
                    <h2 className="text-lg font-semibold">Peer's Submission</h2>
                    <p className="text-md font-lg text-gray-500">Submiited on: [date]</p>
                    <p className="text-md font-lg text-gray-500">Due date: [date]</p>
                </div>
                <div className="p-6 bg-[#FDFBEF] rounded-b-2xl shadow border-t border-t-gray-200 overflow break-words whitespace-pre-wrap">
                    <p>[content]dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd</p>
                </div>

                <div className="p-6 mt-6 bg-[#FDFBEF] rounded-t-2xl shadow">
                    <h2 className="text-lg font-semibold">Your Review</h2>
                    <p className="text-md font-lg text-gray-500">Fill out the rubric and provide comments for your peer.</p>
                </div>
                <div className="px-8 pb-8 bg-[#FDFBEF] rounded-b-2xl shadow border-t border-t-gray-200 overflow break-words whitespace-pre-wrap">
                    <div className="pt-6"> 
                        <h2 className="text-lg font-semibold">1. [Criteria 1]</h2>
                        <p className="text-md font-lg">[Criteria 1 description]</p>

                        <div className="py-4 px-6 border border-gray-300 mt-6 rounded-lg">
                            <div className="flex flex-row gap-4">
                                <input type="checkbox"/>
                                <div>
                                    <p className="text-md font-bold">Low (n score)</p>
                                    <p className="text-md font-lg">[Low description]</p>
                                </div>
                            </div>    
                        </div>
                        <div className="py-4 px-6 border border-gray-300 mt-6 rounded-lg">
                            <div className="flex flex-row gap-4">
                                <input type="checkbox"/>
                                <div>
                                    <p className="text-md font-bold">Medium (n score)</p>
                                    <p className="text-md font-lg">[Medium description]</p>
                                </div>
                            </div>    
                        </div>
                        <div className="py-4 px-6 border border-gray-300 mt-6 rounded-lg">
                            <div className="flex flex-row gap-4">
                                <input type="checkbox"/>
                                <div>
                                    <p className="text-md font-bold">High (n score)</p>
                                    <p className="text-md font-lg">[High description]</p>
                                </div>
                            </div>    
                        </div>
                    </div> 
                    <div className="pt-6">
                        <h2 className="text-lg font-semibold">2. [Criteria 2]</h2>
                        <p className="text-md font-lg">[Criteria 1 description]</p>

                        <div className="py-4 px-6 border border-gray-300 mt-6 rounded-lg">
                            <div className="flex flex-row gap-4">
                                <input type="checkbox"/>
                                <div>
                                    <p className="text-md font-bold">Low</p>
                                    <p className="text-md font-lg">[Low description]</p>
                                </div>
                            </div>    
                        </div>
                        <div className="py-4 px-6 border border-gray-300 mt-6 rounded-lg">
                            <div className="flex flex-row gap-4">
                                <input type="checkbox"/>
                                <div>
                                    <p className="text-md font-bold">Medium</p>
                                    <p className="text-md font-lg">[Medium description]</p>
                                </div>
                            </div>    
                        </div>
                        <div className="py-4 px-6 border border-gray-300 mt-6 rounded-lg">
                            <div className="flex flex-row gap-4">
                                <input type="checkbox"/>
                                <div>
                                    <p className="text-md font-bold">High</p>
                                    <p className="text-md font-lg">[High description]</p>
                                </div>
                            </div>    
                        </div>
                    </div>
                    <div className="pt-6">
                        <h2 className="text-lg font-semibold">3. [Criteria 3]</h2>
                        <p className="text-md font-lg">[Criteria 1 description]</p>

                        <div className="py-4 px-6 border border-gray-300 mt-6 rounded-lg">
                            <div className="flex flex-row gap-4">
                                <input type="checkbox"/>
                                <div>
                                    <p className="text-md font-bold">Low</p>
                                    <p className="text-md font-lg">[Low description]</p>
                                </div>
                            </div>    
                        </div>
                        <div className="py-4 px-6 border border-gray-300 mt-6 rounded-lg">
                            <div className="flex flex-row gap-4">
                                <input type="checkbox"/>
                                <div>
                                    <p className="text-md font-bold">Medium</p>
                                    <p className="text-md font-lg">[Medium description]</p>
                                </div>
                            </div>    
                        </div>
                        <div className="py-4 px-6 border border-gray-300 mt-6 rounded-lg">
                            <div className="flex flex-row gap-4">
                                <input type="checkbox"/>
                                <div>
                                    <p className="text-md font-bold">High</p>
                                    <p className="text-md font-lg">[High description]</p>
                                </div>
                            </div>    
                        </div>
                    </div> 
                    <div className="pt-12">
                        <h2 className="text-xl font-semibold">Comment</h2>
                        <textarea className="w-full min-h-56 border border-gray-300 rounded-lg px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Add your comment here..."></textarea>
                    </div>
                </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 bg-[#FDFBEF] border-t border-gray-200 shadow-2xl z-20 p-2">
                <div className="mx-auto w-11/12 md:w-9/12 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <p className="text-lg font-medium text-gray-700">Max Points:</p>
                        <span className="text-2xl font-bold text-[#EA583E] bg-[#FBF9F2] px-3 py-1 rounded-lg border border-[#EA583E]/30 shadow-inner">
                            [n]/[full score]
                        </span>
                    </div>
                    <div className="flex space-x-3">
                        <Link href="/peer-review" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition font-semibold text-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                            Cancel
                        </Link>
                        <button
                            className="px-6 py-3 bg-[#EA583E] text-white rounded-xl shadow-md hover:bg-orange-600 disabled:bg-gray-400 transition font-semibold text-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}