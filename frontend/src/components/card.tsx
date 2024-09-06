import { useNavigate } from "react-router-dom";
import { Collection } from "types/model";

const CardItem: React.FC<Collection> = (collectionProps) => {
  const { id, title, description, images } = collectionProps;
  const navigate = useNavigate();

  const handleOpen = () => {
    navigate(`/collection/${id}`);
  };

  const handleEdit = () => {
    navigate(`/collection/${id}?Action=edit`);
  };

  return (
    <div className="relative m-8 group">
      <div className="relative z-10 w-52 h-72 p-3 bg-rose-100 dark:bg-gray-900 border flex flex-col gap-2 opacity-95">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-sm text-gray-900 dark:text-gray-100">
          {description}
        </p>
        <p className="text-sm text-gray-800 dark:text-gray-200 grow">
          {images.length} Images
        </p>
        <div className="absolute inset-0 flex items-end pb-3 justify-center group-hover:opacity-100 opacity-0 transition-opacity">
          <div className="flex gap-2">
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded"
              onClick={handleOpen}
            >
              Open
            </button>
            <button
              className="bg-slate-700 text-white px-3 py-1 rounded"
              onClick={handleEdit}
            >
              Edit
            </button>
          </div>
        </div>
      </div>
      <div className="absolute top-5 left-5 w-52 h-72 bg-slate-300 shadow-sm"></div>
    </div>
  );
};

export default CardItem;
