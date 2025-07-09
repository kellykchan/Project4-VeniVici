const Gallery = ({ images }) => {
  if (!images || images.length === 0) {
    return <p>No images fetched yet!</p>;
  }

  return (
    <div className="gallery">
      <ul style={{ listStyle: "none", padding: 0 }}>
        {images.map((apod, idx) => (
          <li key={idx} style={{ marginBottom: "1rem" }}>
            <h4>{apod.title}</h4>
            <p>{apod.date}</p>
            {apod.media_type === "image" ? (
              <img
                src={apod.url}
                alt={apod.title}
                width="300"
                style={{ borderRadius: "8px" }}
              />
            ) : apod.media_type === "video" ? (
              <a href={apod.url} target="_blank" rel="noreferrer">
                Watch Video
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Gallery;