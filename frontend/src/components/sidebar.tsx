interface SidebarProps{
    role: string;
}

export default function Sidebar({role}:SidebarProps){
    return(
        <div className="p-4 w-1/6 bg-[rgb(254,249,240)] min-h-screen fixed">
            <div className="flex justify-center items-end gap-4 p-2 shadow shadow-slate-300 rounded-lg">
                <img src="logo.png" alt="" className="w-8 h-10"/>
                <h1 className="font-bold text-2xl text-[rgb(2,45,73)]">Checky</h1>
            </div>
        </div>
    )
}