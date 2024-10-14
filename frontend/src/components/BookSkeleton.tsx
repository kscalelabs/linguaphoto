type BookSkeletonProps = {
  is_light: boolean;
};
const BookSkeleton: React.FC<BookSkeletonProps> = ({ is_light }) => {
  const items = Array(5).fill(null);
  return (
    <>
      {is_light
        ? items.map((_, index) => {
            return (
              <div
                className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6"
                key={index}
              >
                <div className="bg-gray-5 w-48 h-64 rounded-lg animate-pulse p-8">
                  <div className="bg-gray-8 w-full h-4 rounded-lg animate-pulse" />
                  <div className="bg-gray-8 w-full h-4 rounded-lg animate-pulse mt-8" />
                  <div className="bg-gray-8 w-full h-4 rounded-lg animate-pulse mt-2" />
                </div>
              </div>
            );
          })
        : items.map((_, index) => {
            return (
              <div
                className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6"
                key={index}
              >
                <div className="bg-gray-11 w-48 h-64 rounded-lg animate-pulse p-8">
                  <div className="bg-gray-12 w-full h-4 rounded-lg animate-pulse" />
                  <div className="bg-gray-12 w-full h-4 rounded-lg animate-pulse mt-8" />
                  <div className="bg-gray-12 w-full h-4 rounded-lg animate-pulse mt-2" />
                </div>
              </div>
            );
          })}
    </>
  );
};
export default BookSkeleton;
