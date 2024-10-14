import { useAuth } from "contexts/AuthContext";
import { useLoading } from "contexts/LoadingContext";
import { useAlertQueue } from "hooks/alerts";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CollectionNew: React.FC = () => {
  const navigate = useNavigate();
  const { client } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  const { addAlert } = useAlertQueue();
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    startLoading();
    const { data: collection, error } = await client.POST(
      "/create_collection",
      { body: { title, description } },
    );
    if (error) addAlert(error.detail?.toString(), "error");
    else if (collection != null) {
      navigate(`/collection/${collection.id}?Action=edit`);
      addAlert("New collection has been created successfully!", "success");
    } else addAlert("The process has gone wrong!", "error");
    stopLoading();
  };

  return (
    <div className="flex flex-col rounded-md h-full bg-gray-3 p-24 gap-8">
      <h1 className="text-3xl text-gray-900">New Collection</h1>
      <form
        className="flex flex-col items-end gap-4 w-full"
        onSubmit={handleCreate}
      >
        <input
          className="border p-2 w-full"
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="border p-2 w-full h-32"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <button
          className="bg-blue-500 w-32 text-white p-2 rounded hover:bg-blue-600"
          type="submit"
        >
          Create
        </button>
      </form>
    </div>
  );
};
export default CollectionNew;
