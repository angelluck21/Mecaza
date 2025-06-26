import React, { useState, useEffect } from "react";


const index  = () => {

return (
    <>
       <form className="flex items-center w-full max-w-lg mx-auto mt-6">
  <input
    type="text"
    placeholder="Buscar contenido..."
    className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
  />
  <button
    type="submit"
    className="px-4 py-2 bg-indigo-500 text-white rounded-r-md hover:bg-indigo-600 transition-colors"
  >
    Buscar
  </button>
</form>
    
    </>


);



};


export default index;
