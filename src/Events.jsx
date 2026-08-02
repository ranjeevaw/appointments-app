import { useState } from "react";

const events = [

  {
    id: 2,
    type: "upcoming",
    title: "Esala Sil Program",
    date: "TBD",
    location: "English Dhamma Temple",
media: [

],
    description:
      "Annual Kathina ceremony with offerings and blessings.",
  },
    {
        id: 3,
        type: "past",
        title: "Dhamma sermon by Most ven Kathnoruwe SiriDhamma himi",
        date: "20 June 2026",
        location: "English Dhamma Temple",
        media: [
        {
          type: "image",
          src: `${import.meta.env.BASE_URL}images/k1.jpg`,
        },
        {
          type: "image",
          src: `${import.meta.env.BASE_URL}images/k2.jpg`,
        },
          {
            type: "image",
            src: `${import.meta.env.BASE_URL}images/k3.jpg`,
          },
          {
            type: "image",
            src: `${import.meta.env.BASE_URL}images/k4.jpg`,
          },
          {
            type: "image",
            src: `${import.meta.env.BASE_URL}images/k5.jpg`,
          },
          {
            type: "image",
            src: `${import.meta.env.BASE_URL}images/k6.jpg`,
          },
          {
            type: "image",
            src: `${import.meta.env.BASE_URL}images/k7.jpg`,
          },
          {
            type: "image",
            src: `${import.meta.env.BASE_URL}images/k9.jpg`,
          },
          {
            type: "image",
            src: `${import.meta.env.BASE_URL}images/k10.jpg`,
          },
        ],
        description:
          "Dhamma sermon by Kathnoruwe Siridhamma himi was conducted on 20th June amidst a big crowd. Everybody loved the sermon and enjoyed the dinner provided by English dhamma org members.",
      },
  {
    id: 5,
    type: "past",
    title: "Mr Bandara's alms giving",
    date: "06 June 2026",
    location: "English Dhamma Temple",
    media: [
    {
      type: "image",
      src: `${import.meta.env.BASE_URL}images/b1.JPG`,
    },
    {
      type: "image",
      src: `${import.meta.env.BASE_URL}images/b2.JPG`,
    },
    {
      type: "image",
      src: `${import.meta.env.BASE_URL}images/b3.JPG`,
    },
    {
      type: "image",
      src: `${import.meta.env.BASE_URL}images/b4.JPG`,
    },
    {
      type: "image",
      src: `${import.meta.env.BASE_URL}images/b5.JPG`,
    },
    {
      type: "image",
      src: `${import.meta.env.BASE_URL}images/b6.JPG`,
    },
    {
      type: "image",
      src: `${import.meta.env.BASE_URL}images/b7.JPG`,
    },
    {
      type: "image",
      src: `${import.meta.env.BASE_URL}images/b8.JPG`,
    },
    {
      type: "image",
      src: `${import.meta.env.BASE_URL}images/b9.JPG`,
    },
    {
      type: "image",
      src: `${import.meta.env.BASE_URL}images/b10.JPG`,
    },
    {
      type: "video",
      src: `${import.meta.env.BASE_URL}videos/b1.mp4`,
    },
    ],
description: `Our heartfelt gratitude to our devotee, Mr. G. Bandara, for holding the Alms Giving Ceremony at our temple in remembrance of his beloved father and his former teachers.

May the merits of this wholesome offering be shared with his beloved father, his former teachers, and all departed loved ones.

May Mr. G. Bandara and his family be blessed with good health, happiness, peace, and prosperity.

May all rejoice in these merits. 🙏`,
  },
  {
    id: 4,
    type: "past",
    title: "Maliyadeva OBA English Dhamma Temple Garden cleaning and car park creation project",
    date: "31 May 2026",
    location: "English Dhamma Temple",
    media: [
    {
      type: "image",
      src: `${import.meta.env.BASE_URL}images/vesak1.jpg`,
    },
    {
      type: "image",
      src: `${import.meta.env.BASE_URL}images/vesak2.jpg`,
    },
    {
      type: "video",
      src: `${import.meta.env.BASE_URL}videos/vesak3.mp4`,
    },
    ],
    description:
      "Maliyadeva college OBA members organised a labor donation event where they cleaned the garden of the English Dhamma Temple, planted new plants, removed old shed to make space for the car park and enact a wall to support the car park space.",
  },

];

export default function Events() {
  const [selectedImage, setSelectedImage] = useState(null);

const upcomingEvents = events.filter(
  (event) => event.type === "upcoming"
);

const pastEvents = events.filter(
  (event) => event.type === "past"
);

const renderEvents = (eventList) =>
  eventList.map((event) => (
    <div key={event.id} className="sermon-card">
      <div className="event-gallery">
{event.media.map((item, index) => (
  item.type === "image" ? (
    <img
      key={index}
      src={item.src}
      alt={`${event.title} ${index + 1}`}
      className="gallery-thumb"
      onClick={() => setSelectedImage(item.src)}
    />
  ) : (
    <video
      key={index}
      className="gallery-thumb"
      controls
      preload="metadata"
    >
      <source src={item.src} type="video/mp4" />
      Your browser does not support video playback.
    </video>
  )
))}
      </div>

      <div className="sermon-content">
        <h2>{event.title}</h2>

        <p>
          <strong>Date:</strong> {event.date}
        </p>

        <p>
          <strong>Location:</strong> {event.location}
        </p>

<p style={{ whiteSpace: "pre-line" }}>
  {event.description}
</p>
      </div>
    </div>
  ));

return (
  <div className="page">
    <h1>Events</h1>

    <h2>📅 Upcoming Events</h2>
    {renderEvents(upcomingEvents)}

    <h2 style={{ marginTop: "40px" }}>
      📸 Past Events
    </h2>
    {renderEvents(pastEvents)}

    {selectedImage && (
      <div
        className="poster-overlay"
        onClick={() => setSelectedImage(null)}
      >
        <div className="poster-modal">
          <img
            src={selectedImage}
            alt="Event"
            className="poster-image"
          />
        </div>
      </div>
    )}
  </div>
);

}
