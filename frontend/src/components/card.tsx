import { TrashFill } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { Collection } from "types/model";
interface CardItemProps extends Collection {
  onDelete: (id: string) => void;
}
const CardItem: React.FC<CardItemProps> = (cardprops) => {
  const { id, title, description, images, onDelete } = cardprops;
  const navigate = useNavigate();

  const handleOpen = () => {
    navigate(`/collection/${id}`);
  };

  const handleEdit = () => {
    navigate(`/collection/${id}?Action=edit`);
  };
  const handleDelete = () => {
    onDelete(id);
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
            <button
              className="bg-red-700 text-white flex justify-content-center items-center w-8 h-8 rounded"
              onClick={handleDelete}
            >
              <TrashFill size={18} />
            </button>
          </div>
        </div>
      </div>
      <div className="absolute top-5 left-5 w-52 h-72 bg-slate-300 shadow-sm"></div>
    </div>
  );
};

export default CardItem;
