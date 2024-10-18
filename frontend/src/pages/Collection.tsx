import CollectionEdit from "components/collection/Edit";
import CollectionNew from "components/collection/New";
import CollectionView from "components/collection/View";
import { useAuth } from "contexts/AuthContext";
import { useAlertQueue } from "hooks/alerts";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Collection } from "types/model";

const CollectionPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const [collection, setCollection] = useState<Collection | undefined>(
    undefined,
  );
  const { auth, client } = useAuth();
  const { addAlert } = useAlertQueue();
  const { startLoading, stopLoading } = useLoading();
  // Helper to check if it's an edit action
  const isEditAction = useMemo(
    () => location.search.includes("Action=edit"),
    [location.search],
  );

  // Simulate fetching data for the edit page (mocking API call)
  useEffect(() => {
    if (id && auth?.is_auth) {
      const asyncfunction = async () => {
        startLoading();
        const { data: collection, error } = await client.GET(
          "/get_collection",
          { params: { query: { id } } },
        );
        if (error) addAlert(error.detail?.toString(), "error");
        else setCollection(collection);
      };
      asyncfunction();
    }
  }, [id, auth]);

  // Return button handler
  // const handleReturn = () => {
  //   navigate("/collections");
  // };

  // Navigate View Page
  // const handlePreview = () => {
  //   navigate("/collection/" + collection?.id);
  // };
  // Custom Return Button (fixed top-left with border)
  // const ReturnButton = () => (
  //   <div className="fixed left-0 mx-4 sm:mx-6 md:mx-10 xl:mx-16">
  //     <div className="w-full p-2">
  //       <button
  //         className="p-2 border-2 bg-gray-12 rounded-md shadow-sm w-full"
  //         onClick={handleReturn}
  //       >
  //         <ArrowLeft size={24} />
  //       </button>
  //     </div>
  //   </div>
  // );
  // Custom Return Button (fixed top-left with border)
  // const PreviewButton = () => (
  //   <div className="fixed right-0 mx-4 sm:mx-6 md:mx-10 xl:mx-16">
  //     <div className="w-full p-2">
  //       <button
  //         className="p-2 border-2 bg-gray-12 rounded-md shadow-sm w-full"
  //         onClick={handlePreview}
  //       >
  //         <Eye size={24} />
  //       </button>
  //     </div>
  //   </div>
  // );

  // Rendering New Collection Page
  if (!id) {
    return <CollectionNew />;
  }
  // Rendering Edit Collection Page
  if (id && isEditAction && collection) {
    return (
      <CollectionEdit collection={collection} setCollection={setCollection} />
    );
  }
  // Rendering Collection Detail Page
  if (id && !isEditAction && collection) {
    return <CollectionView collection={collection} />;
  }
  //skeleton
  return (
    <div className="flex flex-col h-full w-full gap-4">
      <div className="bg-gray-3 w-full rounded-lg h-3/4 animate-pulse" />
      <div className="bg-gray-3 w-full rounded-lg h-1/4 animate-pulse" />
    </div>
  );
};
export default CollectionPage;
