"use client"
import Image from 'next/image';
import top1 from '../../../../assets/Top1.png';
import top2 from '../../../../assets/Top2.png';
import top3 from '../../../../assets/Top3.png';
import top4 from '../../../../assets/Top4.png';

const topPerformers = [
    {
        _id: 1, src: top1, name: "Dianne Russell", agent_id: "36254", totalJobs: 80, completed: 60
    },
    { _id: 2, src: top2, name: "Wade Warren", agent_id: "36254", totalJobs: 70, completed: 50 },
    { _id: 3, src: top3, name: "Albert Flores", agent_id: "36254", totalJobs: 75, completed: 55 },
    { _id: 4, src: top4, name: " Arlene McCoy", agent_id: "36254", totalJobs: 80, completed: 60 }
]

export default function TopPerfomerTechnicians() {
    return (
        <>
            <div className="w-full bg-white rounded">
                <div className="flex justify-between items-center px-2 py-4">
                    <h1 className="font-bold font-['Outfit']">Top Performer</h1>
                    <div className="bg-gray-400">
                        <select className="bg-white border-gray-400 rounded-xl p-2">
                            <option>Select Frequency</option>
                            <option>Weekly</option>
                            <option>Monthly</option>
                            <option>Yearly</option>
                        </select></div>
                </div>
                <div className='flex flex-col py-2 px-4 gap-8'>
                    {topPerformers.map((topPerformer) => {
                        return <div key={topPerformer._id} className='flex justify-between items-center'>
                            <div className='flex gap-2 justify-between items-center'>
                                <div>
                                    <Image src={topPerformer.src} alt='top-performer' className='h-8 w-8' />

                                </div>
                                <div className='flex flex-col'>
                                    <h1 className='text-lg font-bold font-[Outfit]'>{topPerformer.name}</h1>
                                    <p className='text-gray-400 text-xs'>Agent ID: {topPerformer.agent_id}</p>
                                </div>

                            </div>
                            <div>
                                <h1 className='text-slate-500'>{`${topPerformer.completed}/${topPerformer.totalJobs}`}</h1 >
                            </div>

                        </div>
                    })}
                </div>
            </div>
        </>
    )
}