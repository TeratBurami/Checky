import React, { useState } from "react";

const initialToDoList = [
  {
    title: "Business Proposal",
    date: "Tuesday, 30 June 2024",
    check: false,
  },
  {
    title: "Cover Letter",
    date: "Monday, 24 June 2024",
    check: false,
  },
  {
    title: "Journal Review",
    date: "Friday, 10 June 2024",
    check: true,
  },
  {
    title: "Vocabulary Quiz 03",
    date: "Friday, 05 June 2024",
    check: true,
  },
];

export default function ToDoList() {
  const [toDoList, setToDoList] = useState(initialToDoList);

  const handleToggleCheck = (indexToToggle: number) => {
    const newList = toDoList.map((item, idx) => {
      if (idx === indexToToggle) {
        return { ...item, check: !item.check };
      }

      return item;
    });

    setToDoList(newList);
  };

  return (
    <>
      {toDoList.map((item: any, idx: number) => (
        <div key={idx} className="flex items-center gap-4 p-2">
          <input
            className="w-6 h-6 accent-orange-600"
            type="checkbox"
            checked={item.check}
            onChange={() => handleToggleCheck(idx)}
          />

          <div className={item.check ? "line-through text-gray-500" : ""}>
            <p className="font-semibold">{item.title}</p>
            <p className="text-sm">{item.date}</p>
          </div>
        </div>
      ))}
    </>
  );
}
