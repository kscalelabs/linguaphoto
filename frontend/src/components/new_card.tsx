import { PlusCircleFill } from "react-bootstrap-icons";
import { Link } from "react-router-dom";

const NewCardItem: React.FC = () => {
  return (
    <div className="relative m-4">
      <div className="relative z-10 w-52 h-72 p-3 bg-blue-200 dark:bg-gray-900 border flex flex-col gap-2 opacity-95">
        <h3 className="text-lg font-bold">New Collection</h3>
        <p className="text-sm text-gray-900 dark:text-gray-100">
          Please add new collections
        </p>
        <div className="mt-3 flex gap-2 justify-center items-center grow">
          <Link to="/collection/new">
            <PlusCircleFill size={50} color="white" />
          </Link>
        </div>
      </div>
      <div className="absolute top-5 left-5 w-52 h-72 bg-slate-300 shadow-sm"></div>
    </div>
  );
};

export default NewCardItem;
