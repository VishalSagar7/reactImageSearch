import { useEffect, useState, useRef } from 'react';

const accessKey = '2p8lpMpkI-VxEK1Vy0EOfQE646wmysvZLMGztoVpLq8';

function App() {
  const [inputData, setInputData] = useState('');
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null);

  const searchImages = async (newPage = 1) => {
    if (inputData) {
      setLoading(true);
      const url = `https://api.unsplash.com/search/photos?page=${newPage}&query=${inputData}&client_id=${accessKey}&per_page=10`;
      try {
        const response = await fetch(url);
        const data = await response.json();

        if (newPage === 1) {
          setImages(data.results); // First page result
        } else {
          setImages((prevImages) => [...prevImages, ...data.results]); // Concatenate new images
        }
      } catch (error) {
        console.error('Error fetching data from Unsplash:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Trigger search when page changes
  useEffect(() => {
    if (page > 1) {
      searchImages(page);
    }
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    searchImages();
  };

  // Infinite scrolling handler
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        setPage((prevPage) => prevPage + 1); // Load next page when the loader is visible
      }
    }, {
      rootMargin: '50px', // Trigger before reaching the bottom
      threshold: 1.0, // 100% visibility required
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current); 
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-4xl font-bold text-center mb-4">Image Search</h1>

        <form onSubmit={handleSearch} className="flex justify-center mb-4">
          <input
            type="text"
            placeholder="Search images..."
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            className="border p-2 rounded-l w-full max-w-md"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image.id} className="overflow-hidden rounded-lg shadow-lg">
              <img
                src={image.urls.small}
                alt={image.alt_description}
                className="w-full h-60 object-cover"
              />
              <div className="p-2 text-center">
                <p className="text-sm font-semibold">{image.alt_description || 'No description'}</p>
                <a
                  href={image.links.html}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500"
                >
                  View on Unsplash
                </a>
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center mt-4">
            <p>Loading...</p>
          </div>
        )}

        <div ref={loaderRef} className="h-20"></div> 
      </div>
    </div>
  );
}

export default App;
