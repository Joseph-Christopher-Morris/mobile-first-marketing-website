'use client';

import { useState } from 'react';
import OptimizedImage from '@/components/ui/OptimizedImage';

interface CampaignProject {
  id: string;
  src: string;
  alt: string;
  title: string;
  client: string;
  projectScope: string;
  results: string[];
  metrics?: {
    label: string;
    value: string;
  }[];
  clientLogo?: string;
  category: string;
  year: string;
}

interface CampaignShowcaseProps {
  projects: CampaignProject[];
  className?: string;
}

export default function CampaignShowcase({ projects, className = '' }: CampaignShowcaseProps) {
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  const handleProjectHover = (projectId: string) => {
    setHoveredProject(projectId);

    // Track hover interaction for analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'campaign_hover', {
        event_category: 'engagement',
        event_label: projectId,
        value: 1
      });
    }
  };

  const handleProjectClick = (project: CampaignProject) => {
    // Track campaign project click
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'campaign_click', {
        event_category: 'engagement',
        event_label: project.id,
        custom_parameter_1: project.client,
        custom_parameter_2: project.category,
        value: 1
      });
    }
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${className}`}>
      {projects.map((project) => (
        <div
          key={project.id}
          className="campaign-project group relative bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
          onMouseEnter={() => handleProjectHover(project.id)}
          onMouseLeave={() => setHoveredProject(null)}
          onClick={() => handleProjectClick(project)}
        >
          {/* Image Container */}
          <div className="relative h-64 overflow-hidden">
            <OptimizedImage
              src={project.src}
              alt={project.alt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />

            {/* Overlay on hover */}
            <div className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
              hoveredProject === project.id ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="absolute inset-0 p-6 flex flex-col justify-center text-white">
                <h4 className="text-lg font-bold mb-2">{project.projectScope}</h4>
                <div className="space-y-1">
                  {project.results.map((result, index) => (
                    <div key={index} className="text-sm opacity-90">
                      • {result}
                    </div>
                  ))}
                </div>
                {project.metrics && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {project.metrics.map((metric, index) => (
                      <div key={index} className="text-center">
                        <div className="text-lg font-bold text-brand-pink">{metric.value}</div>
                        <div className="text-xs opacity-80">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Category Badge */}
            <div className="absolute top-4 left-4 bg-brand-pink text-white px-3 py-1 rounded-full text-sm font-medium">
              {project.category}
            </div>

            {/* Year Badge */}
            <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {project.year}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-pink transition-colors">
                {project.title}
              </h3>
              {project.clientLogo && (
                <div className="w-12 h-8 relative">
                  <OptimizedImage
                    src={project.clientLogo}
                    alt={`${project.client} logo`}
                    fill
                    className="object-contain opacity-60 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              )}
            </div>

            <div className="text-gray-600 mb-4">
              <span className="font-medium">Client:</span> {project.client}
            </div>

            <div className="text-sm text-gray-500">
              {project.projectScope}
            </div>

            {/* Hover indicator */}
            <div className="mt-4 flex items-center text-brand-pink opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-sm font-medium">View project details</span>
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
