"use client";

import Link from "next/link";
import { MapPin, Users, Star, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaCardProps {
  id: string;
  title: string;
  type: string;
  location: string;
  price: string;
  reach: string;
  image: string;
  seller: string;
  rating: number;
  verified: boolean;
}

export function MediaCard({ id, title, type, location, price, reach, image, seller, rating, verified }: MediaCardProps) {
  return (
    <Link
      href={`/midia/${id}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1"
    >
      <div className="aspect-video overflow-hidden relative">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-[#1e3a8a]">
            {type}
          </span>
        </div>
        {verified && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 bg-emerald-500 text-white rounded-full text-xs font-medium flex items-center gap-1">
              <BadgeCheck className="h-3 w-3" /> Verificado
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-[#1e3a8a] transition-colors">{title}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <MapPin className="h-3.5 w-3.5" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Users className="h-3.5 w-3.5" />
          <span>{reach}</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <p className="text-lg font-bold text-[#1e3a8a]">{price}</p>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium text-gray-700">{rating}</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">{seller}</p>
      </div>
    </Link>
  );
}
