import Book from "components/Book";
import BookSkeleton from "components/BookSkeleton";
import { useAuth } from "contexts/AuthContext";
import { useEffect, useState } from "react";
import { Collection } from "types/model";

const Home = () => {
  const [public_collections, setPublicCollections] = useState<
    Array<Collection> | undefined
  >([]);
  const [collections, setCollections] = useState<Array<Collection> | undefined>(
    [],
  );
  const { auth, client } = useAuth();
  const [is_collection_roading, setIsCollectionRoading] =
    useState<boolean>(true);
  const [is_public_collection_roading, setIsPublicCollectionRoading] =
    useState<boolean>(true);
  useEffect(() => {
    (async () => {
      const { data } = await client.GET("/collection/get_public_items");
      setPublicCollections(data);
      setIsPublicCollectionRoading(false);
    })();
  }, [client]);
  useEffect(() => {
    if (auth?.is_auth)
      (async () => {
        const { data } = await client.GET("/collection/get_all");
        setCollections(data);
        setIsCollectionRoading(false);
      })();
  }, [client, auth]);
  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex flex-wrap rounded-md items-center bg-gray-12 px-4">
        {/* Text Section */}
        <div className="flex flex-col justify-center items-center text-md-start h-72 text-3xl w-full">
          <h1>LinguaPhoto</h1>
          <p>Visual language learning for everyone!</p>
          <div className="flex felx-wrap mt-3">
            {/* GoogleAuthComponent placeholder */}
          </div>
        </div>
      </div>
      <div className="flex flex-col rounded-md items-start bg-gray-3 p-24 gap-8">
        <h1 className="text-3xl text-gray-900">Public Collections</h1>
        <div className="w-full flex flex-wrap gap-8">
          {is_public_collection_roading ? (
            // skeleton for public collections
            <BookSkeleton is_light={true} />
          ) : (
            public_collections?.map((collection) => {
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
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
      {auth?.is_auth ? (
        <div className="flex flex-col rounded-md items-start bg-gray-12 p-24 gap-8">
          <h1 className="text-3xl">My Collections</h1>
          <div className="w-full flex flex-wrap gap-8">
            {is_collection_roading ? (
              // skeleton for my collections
              <BookSkeleton is_light={false} />
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
    </div>
  );
};

export default Home;
