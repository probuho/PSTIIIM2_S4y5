import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { MapPin, Calendar, Sun, StickyNote } from "lucide-react";

const sightingsData: Record<string, any> = {
  halcon_peregrino: {
    id: "1042",
    species: "Halcón Peregrino",
    scientific: "Falco peregrinus",
    verified: true,
    observer: "Jamie L.",
    date: "June 14, 2024 at 7:15 AM",
    location: "Golden Gate Park, San Francisco, CA",
    weather: "Clear skies, 62°F, light breeze",
    notes: "Hawk was perched on a tall pine, vocalizing. Observed foraging behavior and brief flight.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    comments: [
      { user: "Alex P.", text: "Great capture!", time: "2 hours ago" },
      { user: "Morgan S.", text: "Saw one nearby last week", time: "1 day ago" },
    ],
  },
};

export default function SightingDetail() {
  const { id } = useParams();
  // Normalizar id para demo (guiones a guiones bajos)
  const normalizedId = id?.toLowerCase().replace(/-/g, "_") || "";
  const sighting = sightingsData[normalizedId];
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(sighting ? sighting.comments : []);

  if (!sighting) {
    return <div className="text-center p-10">Avistamiento no encontrado.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Breadcrumb principal (el real) */}
      <div className="mb-2 text-sm text-muted-foreground">Inicio &gt; Avistamientos &gt; {sighting.species.replace(/ /g, "-")}</div>
      <h1 className="text-3xl font-bold mb-4">Sighting Overview</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <img src={sighting.image} alt={sighting.species} className="rounded-lg object-cover w-full md:w-2/3 max-h-[400px]" />
        <div className="bg-slate-50 rounded-lg p-4 flex-1 min-w-[250px]">
          <div className="uppercase text-xs text-muted-foreground mb-2">VERIFIED SIGHTING</div>
          <div className="font-bold text-xl mb-1">{sighting.species}</div>
          <div className="text-xs text-muted-foreground mb-2">Observed by {sighting.observer} on {sighting.date}.<br/>Location: {sighting.location}</div>
          <Button className="mb-2 w-full">Add Note</Button>
          <Button variant="secondary" className="w-full">Report Issue</Button>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Sighting Details</h2>
        <div className="flex flex-col gap-4">
          <Card className="bg-slate-50">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="w-12 flex justify-center"><MapPin className="w-7 h-7 text-slate-500" /></div>
              <div>
                <div className="font-semibold">Location</div>
                <div className="text-sm text-muted-foreground">{sighting.location}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-50">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="w-12 flex justify-center"><Calendar className="w-7 h-7 text-slate-500" /></div>
              <div>
                <div className="font-semibold">Date & Time</div>
                <div className="text-sm text-muted-foreground">{sighting.date}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-50">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="w-12 flex justify-center"><Sun className="w-7 h-7 text-slate-500" /></div>
              <div>
                <div className="font-semibold">Weather</div>
                <div className="text-sm text-muted-foreground">{sighting.weather}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-50">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="w-12 flex justify-center"><StickyNote className="w-7 h-7 text-slate-500" /></div>
              <div>
                <div className="font-semibold">Notes</div>
                <div className="text-sm text-muted-foreground">{sighting.notes}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Community Comments</h2>
        <div className="flex flex-col gap-2 mb-4">
          {comments.map((c, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-50 rounded p-2">
              <div className="w-8 h-8 rounded-full bg-neutral-300" />
              <div>
                <div className="font-semibold text-sm">{c.user}</div>
                <div className="text-xs text-muted-foreground">{c.text}</div>
                <div className="text-xs text-muted-foreground">{c.time}</div>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto"><span className="material-icons">thumb_up</span></Button>
            </div>
          ))}
        </div>
        <form onSubmit={e => {
          e.preventDefault();
          if (comment.trim()) {
            setComments([...comments, { user: "Tú", text: comment, time: "ahora" }]);
            setComment("");
          }
        }}>
          <textarea
            className="w-full rounded bg-slate-50 p-2 mb-2"
            rows={3}
            placeholder="Share your thoughts or ask a question..."
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          <Button type="submit">Post Comment</Button>
        </form>
      </div>
    </div>
  );
} 