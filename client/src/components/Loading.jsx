import React from "react";

const Loading = () => {
  return (
    <div>
      <div className="flex flex-col items-center ">
        <span className=" text-black">LOADING...</span>
        <div className="w-[50px] h-[50px] border-4 border-amber-400 border-t-transparent  rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default Loading;
