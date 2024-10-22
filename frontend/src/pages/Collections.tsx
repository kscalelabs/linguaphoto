import Book from "components/Book";
import BookSkeleton from "components/BookSkeleton";
import Modal from "components/modal";
import NewCardItem from "components/new_card";
import { useAuth } from "contexts/AuthContext";
import { useLoading } from "contexts/LoadingContext";
import { useAlertQueue } from "hooks/alerts";
import { useEffect, useState } from "react";
import { Collection } from "types/model";

const Collections = () => {
  const [collections, setCollection] = useState<Array<Collection> | []>([]);
  const { auth, client } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const { startLoading, stopLoading } = useLoading();
  const [delete_ID, setDeleteID] = useState(String);
  const { addAlert } = useAlertQueue();
  const [is_loading, setIsLoading] = useState<boolean>(true);
  const onDeleteModalShow = (id: string) => {
    setDeleteID(id);
    setShowModal(true);
  };
  const onDelete = async () => {
    if (delete_ID) {
      startLoading();
      const { error } = await client.GET("/collection/delete", {
        params: { query: { id: delete_ID } },
      });
      if (error) addAlert(error.detail?.toString(), "error");
      else {
        const filter = collections?.filter(
          (collection) => collection.id != delete_ID,
        );
        setCollection(filter);
        addAlert("The Collection has been deleted.", "success");
      }
      setShowModal(false);
      stopLoading();
    }
  };

  useEffect(() => {
    if (auth?.is_auth) {
      const asyncfunction = async () => {
        const { data: collections, error } = await client.GET(
          "/collection/get_all",
        );
        if (error) addAlert(error.detail?.toString(), "error");
        else setCollection(collections);
        setIsLoading(false);
      };
      asyncfunction();
    }
  }, [auth]);

  return (
    <div className="flex-column rounded-md min-h-full items-center bg-gray-3 p-3">
      {auth?.is_auth ? (
        <div className="flex flex-col rounded-md items-start p-24 gap-8">
          <h1 className="text-3xl text-gray-900">My Collections</h1>
          <div className="w-full flex flex-wrap gap-8">
            <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6">
              <NewCardItem />
            </div>
            {is_loading ? (
              <BookSkeleton is_light={true} />
            ) : (
              collections?.map((collection) => {
                return (
                  <div
                    key={collection.id}
                    className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6"
                  >
                    <Book
                      title={collection.title}
                      description={collection.title}
                      id={collection.id}
                      featured_image={collection.featured_image}
                      is_editable={true}
                      onDelete={onDeleteModalShow}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <></>
      )}
      {/* Delete Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="mt-5 flex justify-end space-x-2 gap-4 items-center">
          <span>Are you sure you want to delete the collection?</span>
          <button
            className="px-4 py-2 bg-red-700 text-gray-300 rounded hover:bg-red-800"
            onClick={onDelete}
          >
            Delete
          </button>
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Collections;
