import { FaClock, FaFileLines } from "react-icons/fa6";

const recentClasses = [
  {
    title: "Academic Writing",
    lastView: "15 mins",
    assignmentDue: "05 Assignments",
  },
  {
    title: "Business Writing",
    lastView: "1 day",
    assignmentDue: "01 Assignments",
  },
];

export default function RecentClasses() {
  function getColorFromName(name?: string) {
    let hash = 0;
    if (!name || name.length === 0) return "rgb(128, 128, 128)";
    for (let i = 0; i < name.length; i++) {
      const char = name.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    const r = (hash & 0xff0000) >> 16;
    const g = (hash & 0x00ff00) >> 8;
    const b = hash & 0x0000ff;

    return `rgba(${Math.abs(r)},${Math.abs(g)},${Math.abs(b)}, 0.5)`;
  }

  return (
    <div className="flex flex-col gap-6">
      {recentClasses.map((item, idx) => (
        <div key={idx} className="py-8 px-12 border border-white hover:border-black rounded-xl shadow shadow-black/20 flex justify-start gap-12 items-center cursor-pointer">
          <div
            className="w-1/3 h-28 rounded-lg text-center content-center text-4xl text-white font-bold"
            style={{ backgroundColor: getColorFromName(item.title) }}
          >
            {item.title?.charAt(0).toUpperCase()}
          </div>
          <div className="w-2/3">
            <p className="font-bold text-xl">{item.title}</p>
            <div className="mt-6 flex flex-col justify-end">
              <div className="flex items-center gap-4 text-lg text-green-800">
                <FaClock></FaClock>
                <p>Last {item.lastView} ago</p>
              </div>
              <div className="flex items-center gap-4 text-lg text-red-500">
                <FaFileLines></FaFileLines>{" "}
                <p>{item.assignmentDue} Due</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
