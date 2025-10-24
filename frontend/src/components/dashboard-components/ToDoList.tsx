import React, { useState } from "react"; // 1. Import useState

// ย้าย list นี้ออกมาไว้นอก component หรือจะใส่ใน useState เลยก็ได้
const initialToDoList = [
    {
        title:"Business Proposal",
        date:"Tuesday, 30 June 2024",
        check:false
    },
    {
        title:"Cover Letter",
        date:"Monday, 24 June 2024",
        check:false
    },
    {
        title:"Journal Review",
        date:"Friday, 10 June 2024",
        check:true
    },
    {
        title:"Vocabulary Quiz 03",
        date:"Friday, 05 June 2024",
        check:true
    }
]

export default function ToDoList(){
    // 2. สร้าง state โดยใช้ list เริ่มต้น
    const [toDoList, setToDoList] = useState(initialToDoList);

    // 3. สร้างฟังก์ชันสำหรับสลับค่า check
    const handleToggleCheck = (indexToToggle: number) => {
        // สร้าง array ใหม่ (ห้ามแก้ state เดิมตรงๆ)
        const newList = toDoList.map((item, idx) => {
            // ถ้า index ตรงกับอันที่กด
            if (idx === indexToToggle) {
                // คืนค่า object ใหม่ที่สลับค่า check
                return { ...item, check: !item.check };
            }
            // ถ้าไม่ใช่ ก็คืนค่า item เดิมไป
            return item;
        });

        // 4. อัปเดต state ด้วย array ใหม่
        setToDoList(newList);
    };

    return(
        <>
            {toDoList.map((item:any, idx:number)=>(
                <div key={idx} className="flex items-center gap-4 p-2">
                    <input 
                        className="w-6 h-6 accent-orange-600" 
                        type="checkbox" 
                        
                        // 5. เปลี่ยนจาก defaultChecked เป็น checked
                        checked={item.check} 
                        
                        // 6. เพิ่ม onChange เพื่อเรียกฟังก์ชัน
                        onChange={() => handleToggleCheck(idx)} 
                    />
                    
                    {/* ส่วนนี้ทำงานได้อัตโนมัติ เพราะมันอ่านค่า item.check จาก state */}
                    <div className={item.check ? 'line-through text-gray-500' : ''}>
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-sm">{item.date}</p>
                    </div>
                </div>
            ))}
        </>
    )
}