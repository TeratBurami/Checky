import React, { FC } from 'react';
import ReactSpeedometer, { Transition } from 'react-d3-speedometer'; 

const ChevronDownIcon: FC = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 20 20" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M5.83331 8.33334L9.99998 12.5L14.1666 8.33334" 
      stroke="#6B7280"
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
);

const PerformanceGrade: FC = () => {
  const GRADE = 4.875;
  const MAX_GRADE = 7; 
  const PERFORMANCE_PERCENT = (GRADE / MAX_GRADE) * 100;

  return (
    <div className="bg-white rounded-xl w-full max-w-sm p-4">
      
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-[#F4CFA8] rounded-sm" />
          <span className="text-sm text-gray-600">
            Assignment Submission Performance
          </span>
        </div>
        
        <button className="flex items-center space-x-1 bg-gray-100 rounded-md px-3 py-1 text-sm text-gray-700">
          <span>Monthly</span>
        </button>
      </div>

      <div className="w-full flex justify-center -mt-4 -mb-6">
        <ReactSpeedometer
          width={280}
          height={180}
          value={PERFORMANCE_PERCENT}
          minValue={0}
          maxValue={100}

          // @ts-expect-error Type definition is wrong, prop exists in JS
          startAngle={-120}
          endAngle={120}

          ringWidth={25}
          customSegmentStops={[0, 100]}
          segmentColors={['#F4CFA8', '#FBF3E4']}
          needleColor="#E57373"
          needleBaseColor="#F4CFA8"
          needleHeightRatio={0.7}
          needleTransitionDuration={1500}
          needleTransition={Transition.easeElastic} 
          segments={10}
          tickLength={12}
          tickColor="#EAEAEA"
          currentValueText=" "
          valueTextFontSize="0px"
        />
      </div>

      <div className="text-center">
        <span className="text-gray-500 text-lg">Your Grade: </span>
        <span className="text-black font-bold text-2xl">{GRADE}</span>
      </div>
    </div>
  );
};

export default PerformanceGrade;