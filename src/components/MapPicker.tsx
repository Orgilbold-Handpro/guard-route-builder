import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export type MapPickerProps = {
  token: string;
  value?: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number }) => void;
  style?: "light" | "dark";
};

const DEFAULT_CENTER: [number, number] = [106.917271, 47.918412];

const MapPicker: React.FC<MapPickerProps> = ({ token, value, onChange, style = "light" }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !token) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: `mapbox://styles/mapbox/${style === "light" ? "light-v11" : "dark-v11"}`,
      center: value ? [value.lng, value.lat] : DEFAULT_CENTER,
      zoom: value ? 14 : 11,
      pitch: 0,
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");

    if (value) {
      markerRef.current = new mapboxgl.Marker().setLngLat([value.lng, value.lat]).addTo(map);
    }

    map.on("click", (e) => {
      const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      if (!markerRef.current) {
        markerRef.current = new mapboxgl.Marker().setLngLat(coords).addTo(map);
      } else {
        markerRef.current.setLngLat(coords);
      }
      onChange({ lat: coords[1], lng: coords[0] });
    });

    mapRef.current = map;
    return () => {
      map.remove();
    };
  }, [token]);

  return <div ref={mapContainer} className="h-[420px] w-full rounded-md overflow-hidden" />;
};

export default MapPicker;
