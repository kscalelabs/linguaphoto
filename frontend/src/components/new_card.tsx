import { PlusCircleFill } from "react-bootstrap-icons";
import { Link } from "react-router-dom";

const NewCardItem: React.FC = () => {
  return (
    <div className="w-52 h-64 p-3 bg-blue-200 dark:bg-gray-1 border flex flex-col gap-2 text-gray-900">
      <h3 className="text-lg font-bold">New Collection</h3>
      <p className="text-sm">Please add new collections</p>
      <div className="mt-3 flex gap-2 justify-center items-center grow">
        <Link to="/collection/new">
          <PlusCircleFill size={50} color="orange" />
        </Link>
      </div>
    </div>
  );
};

export default NewCardItem;
